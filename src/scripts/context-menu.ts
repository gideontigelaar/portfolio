import { toastText } from '../data/text';
import { count, found, total } from './eggs';
import { restoreFocus, usingKeyboard } from './press';
import { toggleTheme } from './theme';
import { toast } from './toast';
import { keepAboveDialogs } from './top-layer';

type Source = 'mouse' | 'touch' | 'keyboard';

interface Target {
  control?: HTMLElement;
  link?: HTMLAnchorElement;
  image?: HTMLImageElement;
  text: string;
  label: string;
}

interface Hold {
  id: number;
  x: number;
  y: number;
  timer: number;
}

const menu = document.querySelector<HTMLElement>('[data-context-menu]')!;
const group = menu.querySelector<HTMLElement>('[role="group"]')!;
const contextual = [...menu.querySelectorAll<HTMLElement>('[data-context-group]')];
const actions = [...menu.querySelectorAll<HTMLButtonElement>('[data-action]')];
const secrets = [...menu.querySelectorAll<HTMLElement>('[data-secret]')];
const home = menu.querySelector<HTMLAnchorElement>('[data-context-home]')!;
const themeItem = menu.querySelector<HTMLButtonElement>('[data-context-theme]')!;
const secretItem = menu.querySelector<HTMLButtonElement>('[data-context-source]')!;
const about = document.querySelector<HTMLDialogElement>('[data-about]')!;
const aboutCount = about.querySelector<HTMLElement>('[data-about-count]')!;
const root = document.documentElement;

const margin = 8;
const gap = 4;
const maxDistance = 120;
const closeDelay = 200;
const holdDelay = 500;
const holdSlop = 10;
const pointerMemory = 1500;
const keyMemory = 1000;
const typeaheadDelay = 500;
const controls = 'a[href], button, [role="button"], summary';
const blocks = 'p, h1, h2, h3, h4, h5, h6, li, dt, dd, figcaption, blockquote, td, th';
const editable = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const canWrite = typeof navigator.clipboard?.writeText === 'function';
const canWriteImage =
  typeof navigator.clipboard?.write === 'function' &&
  typeof ClipboardItem === 'function' &&
  (!('supports' in ClipboardItem) || ClipboardItem.supports('image/png'));

let opener: Source = 'mouse';
let navigated = false;
let target: Target = { text: '', label: '' };
let returnFocus: HTMLElement | null = null;
let hold: Hold | undefined;
let held = false;
let pressing = false;
let touching = false;
let nativeHold = false;
let closeTimer = 0;
let lastPointer = { type: '', time: -Infinity };
let lastMenuKey = -Infinity;
let query = '';
let queryTimer = 0;

const clean = (text?: string | null) => (text ?? '').replace(/\s+/g, ' ').trim();

const shorten = (text: string) => (text.length > 60 ? `${text.slice(0, 60).replace(/\s+\S*$/, '')}…` : text);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

const isOpen = () => menu.hasAttribute('data-open');

const isInside = (node: EventTarget | null) => node instanceof Node && menu.contains(node);

const isEditable = (node: EventTarget | null) => node instanceof Element && !!node.closest(editable);

const items = () =>
  [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')].filter((element) => !element.closest('[hidden]'));

const focusItem = (item?: HTMLElement) => {
  navigated = true;
  item?.focus({ preventScroll: true });
  item?.scrollIntoView({ block: 'nearest' });
};

const labelOf = (element: HTMLElement) => clean(element.innerText).toLowerCase();

const nameOf = (element?: Element | null) => {
  if (!element) return '';
  const label = clean(element.getAttribute('aria-label'));
  if (label) return label;
  if (element instanceof HTMLImageElement) return clean(element.alt);
  const text = clean(element instanceof HTMLElement ? element.innerText : element.textContent);
  return text || clean(element.querySelector('img[alt]')?.getAttribute('alt'));
};

const isSamePage = (link: HTMLAnchorElement) =>
  link.hash !== '' &&
  link.origin === location.origin &&
  link.pathname === location.pathname &&
  link.search === location.search;

const isDisabled = (element: Element) => element.matches(':disabled, [aria-disabled="true"]');

const opensWithin = (control: HTMLElement, link?: HTMLAnchorElement) =>
  control.matches('[data-gallery-open]') || (!!link && link.origin === location.origin && link.target !== '_blank');

const ready = (image?: HTMLImageElement | null) => (image?.complete && image.currentSrc ? image : undefined);

const imageIn = (element: Element) =>
  ready([...element.querySelectorAll('img')].find((image) => image.getClientRects().length > 0));

const galleryImage = (element: Element) => {
  const gallery = element.closest('[data-gallery]');
  if (!gallery) return undefined;
  const hit = document.elementFromPoint(root.clientWidth / 2, innerHeight / 2);
  return hit instanceof HTMLImageElement && gallery.contains(hit) ? ready(hit) : undefined;
};

const keyboardImage = (origin: Element, control?: HTMLElement) => (control ? imageIn(control) : galleryImage(origin));

const textOf = (block: Element | null) =>
  block instanceof HTMLElement && !block.closest('[aria-hidden="true"]') && !block.querySelector(controls)
    ? clean(block.innerText)
    : '';

const resolve = (origin: Element | null, keyboard: boolean): Target => {
  if (!origin || origin === root || origin === document.body || menu.contains(origin)) return { text: '', label: '' };
  const control = origin.closest<HTMLElement>(controls) ?? undefined;
  const link = control instanceof HTMLAnchorElement && !isSamePage(control) ? control : undefined;
  const image = keyboard ? keyboardImage(origin, control) : origin instanceof HTMLImageElement ? ready(origin) : undefined;
  const block = control || keyboard ? null : (origin.closest(blocks) ?? (origin.childElementCount ? null : origin));
  return { control, link, image, text: textOf(block), label: shorten(nameOf(control ?? image ?? block)) };
};

const available: Record<string, (context: Target) => boolean> = {
  open: ({ control, link }) => !!control && opensWithin(control, link) && !isDisabled(control),
  interact: ({ control, link }) => !!control && !link && !opensWithin(control) && !isDisabled(control),
  'link-tab': ({ link }) => !!link,
  'copy-link': ({ link }) => !!link && canWrite,
  'image-tab': ({ image }) => !!image,
  'copy-image': ({ image }) => !!image && canWriteImage,
  'copy-text': ({ text }) => !!text && canWrite,
};

const isMenuKey = (event: KeyboardEvent) => event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);

const sourceOf = (event: MouseEvent): Source => {
  const type = (event as Partial<PointerEvent>).pointerType;
  if (touching || type === 'touch' || type === 'pen') return 'touch';
  if (type === '' || event.button < 0 || event.timeStamp - lastMenuKey < keyMemory || !(event.clientX || event.clientY)) {
    return 'keyboard';
  }
  if (type === 'mouse') return 'mouse';
  return event.timeStamp - lastPointer.time < pointerMemory && lastPointer.type !== 'mouse' ? 'touch' : 'mouse';
};

const place = (left: number, top: number, originX: number, originY: number) => {
  const x = clamp(left, margin, root.clientWidth - menu.offsetWidth - margin);
  const y = clamp(top, margin, innerHeight - menu.offsetHeight - margin);
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.transformOrigin = `${originX - x}px ${originY - y}px`;
};

const anchorOf = (element: Element | null) => {
  if (!element || element === root || element === document.body) return undefined;
  const rect = element.getBoundingClientRect();
  const usable = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
  return usable && rect.height < innerHeight / 2 ? rect : undefined;
};

const placeBy = (element: Element | null) => {
  const { offsetWidth: width, offsetHeight: height } = menu;
  const rect = anchorOf(element);
  if (!rect) {
    const x = root.clientWidth / 2;
    const y = innerHeight / 2;
    place(x - width / 2, y - height / 2, x, y);
    return;
  }
  const below = rect.bottom + gap;
  const fitsBelow = below + height <= innerHeight - margin;
  const fitsAbove = rect.top - gap - height >= margin;
  if (fitsBelow || !fitsAbove) {
    place(rect.left, below, rect.left, rect.bottom);
    return;
  }
  place(rect.left, rect.top - gap - height, rect.left, rect.top);
};

const cancelHold = () => {
  if (!hold) return;
  window.clearTimeout(hold.timer);
  hold = undefined;
};

const openDialogs = () => [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')];

const dismiss = (dialog: HTMLDialogElement) =>
  new Promise<void>((done) => {
    dialog.addEventListener('close', () => done(), { once: true });
    if (dialog.dispatchEvent(new Event('cancel', { cancelable: true }))) dialog.close();
  });

const goHome = async () => {
  await Promise.all(openDialogs().reverse().map(dismiss));
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  location.assign(home.href);
};

const show = (origin: Element | null, from: Source, secret: boolean, point?: { x: number; y: number }) => {
  cancelHold();
  target = resolve(origin, from === 'keyboard');
  if (document.querySelector('dialog[data-gallery][open]')) {
    themeItem.setAttribute('aria-disabled', 'true');
  } else {
    themeItem.removeAttribute('aria-disabled');
  }
  actions.forEach((action) => (action.hidden = !available[action.dataset.action ?? '']?.(target)));
  const hasActions = actions.some((action) => !action.hidden);
  contextual.forEach((element) => (element.hidden = !hasActions));
  if (target.label) {
    group.setAttribute('aria-label', target.label);
  } else {
    group.removeAttribute('aria-label');
  }
  secrets.forEach((element) => (element.hidden = !secret));
  if (!isInside(document.activeElement)) {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }
  opener = from;
  navigated = from === 'keyboard';
  pressing = from === 'touch' && touching;
  if (point) {
    place(point.x, point.y, point.x, point.y);
  } else {
    placeBy(origin);
  }
  window.clearTimeout(closeTimer);
  menu.inert = false;
  menu.setAttribute('data-open', '');
  if (from === 'keyboard') {
    focusItem(actions.find((action) => !action.hidden) ?? items()[0]);
  } else {
    menu.focus({ preventScroll: true });
  }
};

const hide = (restore = true, instant = false) => {
  cancelHold();
  if (!isOpen()) return;
  menu.toggleAttribute('data-instant', instant);
  menu.removeAttribute('data-open');
  if (instant) {
    void getComputedStyle(menu).opacity;
    menu.removeAttribute('data-instant');
  }
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && isInside(focused)) {
    if (restore && returnFocus) restoreFocus(returnFocus, navigated && usingKeyboard());
    if (isInside(document.activeElement)) focused.blur();
  }
  window.clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => (menu.inert = !isOpen()), closeDelay);
};

const center = (element: Element) => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return [x + width / 2, y + height / 2] as const;
};

const activate = (control: HTMLElement) => {
  hide(false);
  if (usingKeyboard()) control.focus({ preventScroll: true });
  control.click();
};

const report = (task: Promise<unknown>, success: string, failure: string) =>
  task.then(
    () => toast(success),
    () => toast(failure),
  );

const toPng = async (image: HTMLImageElement) => {
  await image.decode().catch(() => {});
  const vector = /\.svg(?:[?#]|$)/i.test(image.currentSrc);
  const shown = image.getBoundingClientRect();
  const width = image.naturalWidth || shown.width;
  const height = image.naturalHeight || shown.height;
  const scale = vector ? Math.max(1, 512 / Math.max(width, height, 1)) : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolvePng, reject) =>
    canvas.toBlob((blob) => (blob ? resolvePng(blob) : reject(new Error('Image could not be converted'))), 'image/png'),
  );
};

const run: Record<string, (context: Target) => void> = {
  open: ({ control }) => control && activate(control),
  interact: ({ control }) => control && activate(control),
  'link-tab': ({ link }) =>
    link && window.open(link.href, '_blank', link.relList.contains('noreferrer') ? 'noopener,noreferrer' : 'noopener'),
  'copy-link': ({ link }) =>
    link && report(navigator.clipboard.writeText(link.href), toastText.linkCopied, toastText.linkFailed),
  'image-tab': ({ image }) => image && window.open(image.currentSrc, '_blank', 'noopener'),
  'copy-image': ({ image }) =>
    image &&
    report(
      navigator.clipboard.write([new ClipboardItem({ 'image/png': toPng(image) })]),
      toastText.imageCopied,
      toastText.imageFailed,
    ),
  'copy-text': ({ text }) =>
    text && report(navigator.clipboard.writeText(text), toastText.textCopied, toastText.textFailed),
};

const typeahead = (key: string, list: HTMLElement[], index: number) => {
  window.clearTimeout(queryTimer);
  queryTimer = window.setTimeout(() => (query = ''), typeaheadDelay);
  query += key.toLowerCase();
  const repeated = [...query].every((char) => char === query[0]);
  const search = repeated ? query[0] : query;
  const start = repeated ? index + 1 : Math.max(index, 0);
  const match = [...list.slice(start), ...list.slice(0, start)].find((element) =>
    labelOf(element).startsWith(search),
  );
  focusItem(match);
};

const startHold = (event: PointerEvent) => {
  const { pointerId, clientX, clientY } = event;
  const origin = event.target instanceof Element ? event.target : null;
  hold = {
    id: pointerId,
    x: clientX,
    y: clientY,
    timer: window.setTimeout(() => {
      held = true;
      show(origin, 'touch', false, { x: clientX, y: clientY });
    }, holdDelay),
  };
};

const release = (event: PointerEvent) => {
  if (hold?.id === event.pointerId) cancelHold();
};

const close = () => {
  if (!pressing) hide();
};

const closeFromOutside = (event: Event) => {
  if (!pressing && !isInside(event.target)) hide();
};

const lift = () => {
  touching = false;
  pressing = false;
};

menu.addEventListener('click', (event) => {
  if (!isOpen()) {
    event.preventDefault();
    return;
  }

  const item = event.target instanceof Element ? event.target.closest<HTMLElement>('[role="menuitem"]') : null;
  if (!item) return;

  const action = item.dataset.action;
  if (action) {
    const context = target;
    if (action !== 'open' && action !== 'interact') hide();
    run[action]?.(context);
    return;
  }

  if (item === themeItem) {
    if (isDisabled(themeItem)) return;
    const [x, y] = event.detail ? [event.clientX, event.clientY] : center(themeItem);
    hide(true, true);
    toggleTheme(x, y);
    return;
  }

  if (item === secretItem) {
    hide();
    found('secret-menu');
    aboutCount.textContent = `${count()}/${total()}`;
    if (!about.open) about.showModal();
    return;
  }

  const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  if (item === home && !modified && isSamePage(home) && openDialogs().length) {
    event.preventDefault();
    hide(false);
    goHome();
    return;
  }

  hide(item !== home);
});

menu.addEventListener('auxclick', (event) => {
  if (event.button !== 1) return;
  if (!isOpen()) {
    event.preventDefault();
    return;
  }
  if (event.target instanceof Element && event.target.closest('a[role="menuitem"]')) hide();
});

menu.addEventListener('keydown', (event) => {
  event.stopPropagation();
  const list = items();
  const index = list.indexOf(document.activeElement as HTMLElement);
  const focusAt = (next: number) => focusItem(list.at(next % list.length));

  switch (event.key) {
    case 'ArrowDown':
      focusAt(index + 1);
      break;
    case 'ArrowUp':
      focusAt(Math.max(index, 0) - 1);
      break;
    case 'Home':
    case 'PageUp':
      focusAt(0);
      break;
    case 'End':
    case 'PageDown':
      focusAt(-1);
      break;
    case 'Tab':
      navigated = true;
      hide();
      break;
    case 'Escape':
      hide();
      break;
    case 'Enter':
    case ' ':
      list[index]?.click();
      break;
    case 'ContextMenu':
      break;
    case 'F10':
      if (!event.shiftKey) return;
      break;
    default:
      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
      typeahead(event.key, list, index);
  }

  event.preventDefault();
});

menu.addEventListener('wheel', (event) => event.stopPropagation(), { passive: true });

menu.addEventListener('pointermove', (event) => {
  if (!isOpen() || event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
  const item = event.target.closest<HTMLElement>('[role="menuitem"]');
  if (item && item !== document.activeElement) item.focus({ preventScroll: true, focusVisible: false });
});

menu.addEventListener('pointerleave', (event) => {
  if (event.pointerType !== 'mouse' || !isOpen() || document.activeElement === menu) return;
  if (isInside(document.activeElement)) menu.focus({ preventScroll: true });
});

menu.addEventListener('focusout', ({ relatedTarget }) => {
  if (relatedTarget instanceof Node && !menu.contains(relatedTarget)) hide(false);
});

window.addEventListener('contextmenu', (event) => {
  const origin = event.target instanceof Element ? event.target : null;
  if (isInside(origin)) {
    event.preventDefault();
    return;
  }

  const from = sourceOf(event);
  if (from === 'touch') nativeHold = true;
  if (held) {
    event.preventDefault();
    return;
  }

  if ((from === 'mouse' && event.shiftKey) || isEditable(origin)) {
    hide();
    return;
  }

  event.preventDefault();
  if (from === 'touch') held = true;
  show(origin, from, event.altKey, from === 'keyboard' ? undefined : { x: event.clientX, y: event.clientY });
});

window.addEventListener('keydown', (event) => {
  if (isMenuKey(event)) lastMenuKey = event.timeStamp;
  if (isInside(event.target)) return;

  if (event.key === 'Escape') {
    if (!isOpen()) return;
    event.preventDefault();
    hide();
    return;
  }

  if (!isMenuKey(event)) return;
  if (isEditable(document.activeElement)) return;
  event.preventDefault();
  show(document.activeElement, 'keyboard', event.altKey);
});

window.addEventListener(
  'pointerdown',
  (event) => {
    lastPointer = { type: event.pointerType, time: event.timeStamp };
    held = false;
    touching = event.pointerType !== 'mouse';
    if (isInside(event.target)) return;
    hide();
    if (event.pointerType !== 'mouse' && event.isPrimary && !nativeHold && !isEditable(event.target)) startHold(event);
  },
  { capture: true, passive: true },
);

window.addEventListener(
  'pointermove',
  (event) => {
    if (hold?.id === event.pointerId && Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > holdSlop) {
      cancelHold();
    }
    if (!isOpen() || opener !== 'mouse' || event.pointerType !== 'mouse') return;
    const { left, top, right, bottom } = menu.getBoundingClientRect();
    const dx = Math.max(left - event.clientX, 0, event.clientX - right);
    const dy = Math.max(top - event.clientY, 0, event.clientY - bottom);
    if (Math.hypot(dx, dy) > maxDistance) hide();
  },
  { passive: true },
);

window.addEventListener(
  'pointerup',
  (event) => {
    release(event);
    lift();
  },
  { capture: true, passive: true },
);
window.addEventListener('pointercancel', release, { capture: true, passive: true });
window.addEventListener('touchcancel', lift, { capture: true, passive: true });

window.addEventListener(
  'touchend',
  (event) => {
    lift();
    if (held && event.cancelable) event.preventDefault();
  },
  { capture: true },
);

window.addEventListener(
  'click',
  (event) => {
    if (!held || !event.detail) return;
    held = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  },
  { capture: true },
);

window.addEventListener('scroll', closeFromOutside, { capture: true, passive: true });
window.addEventListener('wheel', closeFromOutside, { capture: true, passive: true });
window.addEventListener(
  'dragstart',
  (event) => {
    if (pressing) {
      event.preventDefault();
      return;
    }
    hide();
  },
  { capture: true },
);
window.addEventListener('resize', close);
window.addEventListener('blur', close);
window.addEventListener('pagehide', close);
window.addEventListener('hashchange', close);
window.visualViewport?.addEventListener('resize', close);
window.visualViewport?.addEventListener('scroll', close);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hide();
});

about.addEventListener('click', ({ target: clicked }) => {
  if (clicked === about || (clicked instanceof Element && clicked.closest('[data-about-close]'))) about.close();
});

keepAboveDialogs(menu);