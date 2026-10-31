import { uiText } from '../data/text';
import { windowDots } from './dots';
import { reducedMotion, scrollTimelines } from './motion';
import { onActivate, restoreFocus, usingKeyboard } from './press';
import { clampIndex, labelSlides, stepOf, swipe } from './swipe';
import { inViewport } from './viewport';

const radius = (element: Element) =>
  parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;

const isVisible = (rect: DOMRect) => rect.width > 0 && inViewport(rect);

const isBoxed = (element: Element) => getComputedStyle(element).display !== 'contents';

const images = (root: Element) =>
  [root, ...root.querySelectorAll('img')].filter((element) => element instanceof HTMLImageElement);

const loaded = (image?: HTMLImageElement): image is HTMLImageElement => !!image?.complete && image.naturalWidth > 0;

const rendered = (image: HTMLImageElement) => image.getClientRects().length > 0;

const decoded = (image: HTMLImageElement) =>
  new Promise((resolve, reject) => {
    if (image.complete) return resolve(undefined);
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', reject, { once: true });
  }).then(() => image.decode());

const placehold = (image: HTMLImageElement, thumbnail?: HTMLImageElement) => {
  if (!loaded(thumbnail) || thumbnail.currentSrc === image.currentSrc) return;
  const placeholder = {
    'background-image': `url("${thumbnail.currentSrc}")`,
    'background-position': getComputedStyle(image).objectPosition,
    'background-size': 'cover',
    color: 'transparent',
  };
  Object.entries(placeholder).forEach(([property, value]) => image.style.setProperty(property, value));
  decoded(image).then(
    () => Object.keys(placeholder).forEach((property) => image.style.removeProperty(property)),
    () => {},
  );
};

const regionOf = (target: EventTarget | null) =>
  target instanceof Element ? target.closest<HTMLElement>('[data-gallery-scroll]') : null;

const overflows = (region: HTMLElement | null): region is HTMLElement =>
  !!region && region.scrollHeight > region.clientHeight;

const fadeEdge = 2;

const fadeRange = 0.12;

const fade = (region: HTMLElement) => {
  const max = region.scrollHeight - region.clientHeight;
  const progress = max > 0 ? region.scrollTop / max : 0;
  const edge = (value: number) => (max > 0 ? `${Math.min(value / fadeRange, 1) * fadeEdge}rem` : '0px');
  region.style.setProperty('--fade-top', edge(progress));
  region.style.setProperty('--fade-bottom', edge(1 - progress));
};

const focusable = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

const settleDelay = 150;

const decodeLimit = 150;

const settle = (decoding: unknown[]) =>
  Promise.race([Promise.all(decoding), new Promise((resolve) => window.setTimeout(resolve, decodeLimit))]);

const readLink = () => {
  try {
    return decodeURIComponent(location.hash.slice(1)).split('/');
  } catch {
    return [];
  }
};

const afterScroll = (done: () => void) => {
  let timer = 0;
  const finish = () => {
    window.clearTimeout(timer);
    window.removeEventListener('scroll', wait);
    window.removeEventListener('scrollend', finish);
    done();
  };
  const wait = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(finish, settleDelay);
  };
  window.addEventListener('scroll', wait, { passive: true });
  window.addEventListener('scrollend', finish);
  wait();
};

document.querySelectorAll<HTMLDialogElement>('dialog[data-gallery]').forEach((dialog) => {
  const track = dialog.querySelector<HTMLElement>('[data-gallery-track]')!;
  const slides = [...track.children] as HTMLElement[];
  const items = [...track.querySelectorAll<HTMLElement>('[data-gallery-item]')];
  const regions = [...track.querySelectorAll<HTMLElement>('[data-gallery-scroll]')];
  const dots = [...dialog.querySelectorAll<HTMLButtonElement>('[data-dots] button')];
  const fades = [...dialog.querySelectorAll<HTMLElement>('[data-gallery-fade]')];
  const openers = [
    ...document.querySelectorAll<HTMLElement>(`[data-gallery-open="${dialog.dataset.gallery}"]`),
  ];
  const triggers = openers.filter((opener) => !opener.hasAttribute('data-gallery-index'));
  const status = dialog.querySelector<HTMLElement>('[data-gallery-status]');
  const crossfade = dialog.hasAttribute('data-crossfade');
  let index = 0;
  let busy = false;
  let closeQueued = false;
  let heading: number | undefined;
  let pressedBackdrop = false;
  let origin: HTMLElement | undefined;
  let keyboardNavigation = false;
  let returnUrl = location.href;

  const fading = () => {
    const boxed = fades.filter(isBoxed);
    return boxed.filter((element) => !boxed.some((other) => other !== element && other.contains(element)));
  };

  const isBackdrop = (target: EventTarget | null) =>
    target instanceof Element &&
    (target === dialog ||
      target === track ||
      target.hasAttribute('data-gallery-backdrop') ||
      (target.parentElement === track && !target.hasAttribute('data-gallery-item')));

  const clamp = (value: number) => clampIndex(value, slides.length);

  const slideDots = windowDots(dots);

  const linkTo = (i: number) => `#${dialog.dataset.gallery}/${slides[i].dataset.gallerySlug ?? i + 1}`;

  const select = (next: number) => {
    index = clamp(next);
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    slideDots(index);
    if (dialog.open) history.replaceState(history.state, '', linkTo(index));
  };

  const announce = () => {
    if (status) status.textContent = uiText.position(index + 1, slides.length);
  };

  if (slides.length > 1) labelSlides(slides);

  if (!track.querySelector(focusable)) {
    track.tabIndex = 0;
    track.setAttribute('role', 'group');
    track.setAttribute('aria-label', dialog.getAttribute('aria-label') ?? '');
  }

  const go = (next: number, behavior: ScrollBehavior = 'smooth') => {
    track.scrollTo({ left: clamp(next) * stepOf(track), behavior: reducedMotion.matches ? 'instant' : behavior });
  };

  const paint = swipe(track, {
    index: () => index,
    go,
    host: dialog,
    enabled: () => !busy,
    ignore: ({ target, offsetX }) => {
      const region = regionOf(target);
      return !!region && region === target && offsetX >= region.clientWidth;
    },
    preventDefault: true,
  });

  const navigate = (next: number) => {
    if (busy) return;
    heading = clamp(next);
    go(heading);
  };

  const animate = async (opening: boolean) => {
    busy = true;
    dialog.inert = !opening;
    track.style.overflow = 'hidden';
    if (!opening) go(index, 'instant');
    const item = items[index];
    const trigger = triggers[index];
    if (!opening) trigger?.dispatchEvent(new Event('gallery-reveal', { bubbles: true }));
    const ready = opening && item ? images(item).filter(rendered).map((image) => decoded(image).catch(() => {})) : [];
    let ghost: HTMLElement | undefined;
    const animations: Animation[] = [];

    try {
      const options: KeyframeAnimationOptions = {
        duration: reducedMotion.matches ? 150 : opening ? 550 : 450,
        easing: opening ? 'cubic-bezier(0.32, 0.72, 0, 1)' : 'cubic-bezier(1, 0, 0.68, 0.28)',
        direction: opening ? 'normal' : 'reverse',
        fill: 'both',
      };
      const source = trigger?.getBoundingClientRect();
      const target = item?.getBoundingClientRect();

      if (item && (!trigger || !source || !target || reducedMotion.matches || !isVisible(source) || !target.width)) {
        animations.push(item.animate({ opacity: [0, 1], scale: [0.95, 1] }, options));
      } else if (item && trigger && source && target) {
        const scale = Math.max(source.width / target.width, source.height / target.height);
        const x = source.x + source.width / 2 - target.x - target.width / 2;
        const y = source.y + source.height / 2 - target.y - target.height / 2;
        const insetX = (target.width - source.width / scale) / 2;
        const insetY = (target.height - source.height / scale) / 2;

        ghost = item.cloneNode(true) as HTMLElement;
        Object.assign(ghost.style, {
          position: 'fixed',
          top: `${target.top}px`,
          left: `${target.left}px`,
          width: `${target.width}px`,
          height: `${target.height}px`,
          margin: '0',
          pointerEvents: 'none',
        });
        ghost.setAttribute('aria-hidden', 'true');
        ghost.inert = true;
        const originals = images(item);
        const thumbnails = images(trigger);
        const decoding = images(ghost).map((image, i) => {
          const available = [originals[i], thumbnails[i]].find(loaded);
          if (!available) return undefined;
          image.closest('picture')?.replaceWith(image);
          image.removeAttribute('srcset');
          image.removeAttribute('sizes');
          image.loading = 'eager';
          image.src = available.currentSrc;
          return image.decode().catch(() => {});
        });
        if (!opening) await settle(decoding);
        dialog.append(ghost);
        const ghostRegions = ghost.querySelectorAll<HTMLElement>('[data-gallery-scroll]');
        item.querySelectorAll<HTMLElement>('[data-gallery-scroll]').forEach((region, i) => {
          const ghostRegion = ghostRegions[i];
          ghostRegion.style.overflow = 'hidden';
          ghostRegion.scrollTop = region.scrollTop;
          if (region.scrollHeight <= region.clientHeight) ghostRegion.style.maskImage = 'none';
        });
        item.style.visibility = 'hidden';

        animations.push(
          ghost.animate(
            {
              transform: [`translate(${x}px, ${y}px) scale(${scale})`, 'none'],
              clipPath: [
                `inset(${insetY}px ${insetX}px round ${radius(trigger) / scale}px)`,
                `inset(0px 0px round ${radius(item)}px)`,
              ],
              opacity: crossfade ? [0, 1] : [1, 1],
            },
            options,
          ),
        );
      }

      animations.push(
        ...fading().map((element) =>
          element.animate(
            element.dataset.galleryFade === 'rise' ? { opacity: [0, 1], translate: ['0 0.75rem', '0 0'] } : { opacity: [0, 1] },
            options,
          ),
        ),
      );
      await Promise.allSettled(animations.map((animation) => animation.finished));
      if (ghost) await settle(ready);
    } finally {
      ghost?.remove();
      if (item) item.style.visibility = '';
      animations.forEach((animation) => animation.cancel());
      if (!opening && dialog.open) {
        const focusTarget = trigger ?? origin;
        const visible = keyboardNavigation && usingKeyboard();
        dialog.close();
        if (focusTarget) {
          restoreFocus(focusTarget, visible);
          dialog.addEventListener(
            'close',
            () => {
              const active = document.activeElement;
              if (active && active !== document.body && active !== focusTarget) restoreFocus(focusTarget, visible);
            },
            { once: true },
          );
        }
      }
      dialog.inert = false;
      track.style.removeProperty('overflow');
      busy = false;
      if (closeQueued && dialog.open) {
        closeQueued = false;
        animate(false);
      }
    }
  };

  const open = (next: number, opener: HTMLElement) => {
    if (busy || dialog.open) return;
    closeQueued = false;
    origin = opener;
    keyboardNavigation = usingKeyboard();
    items.forEach((item, i) => {
      const thumbnails = triggers[i] ? images(triggers[i]) : [];
      images(item).forEach((image, j) => placehold(image, thumbnails[j]));
    });
    if (status) status.textContent = '';
    heading = undefined;
    returnUrl = location.hash.includes('/') ? `${location.pathname}${location.search}` : location.href;
    dialog.showModal();
    dialog.focus({ preventScroll: true });
    dialog.scrollTop = 0;
    regions.forEach((region) => (region.scrollTop = 0));
    go(next, 'instant');
    select(next);
    paint();
    animate(true);
  };

  const shift = (direction: number) => navigate(((heading ?? index) + direction + slides.length) % slides.length);

  const close = () => {
    if (!dialog.open) return;
    if (busy) {
      closeQueued = true;
      return;
    }
    animate(false);
  };

  openers.forEach((opener) =>
    opener.addEventListener('click', () => open(Number(opener.dataset.galleryIndex ?? triggers.indexOf(opener)), opener)),
  );
  dots.forEach((dot, i) => dot.addEventListener('click', () => navigate(i)));

  dialog.querySelectorAll<HTMLButtonElement>('[data-gallery-shift]').forEach((button) => {
    onActivate(button, () => shift(Number(button.dataset.galleryShift)));
  });

  dialog.addEventListener('close', () => history.replaceState(history.state, '', returnUrl));

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener('pointerdown', ({ target }) => (pressedBackdrop = !busy && isBackdrop(target)), {
    passive: true,
  });

  dialog.addEventListener('click', ({ target }) => {
    const closes = target instanceof Element && !!target.closest('[data-gallery-close]');
    if (closes || (pressedBackdrop && isBackdrop(target))) close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') keyboardNavigation = true;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      shift(event.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    if ((event.key !== 'ArrowUp' && event.key !== 'ArrowDown') || regionOf(event.target)) return;
    const region = slides[index].querySelector<HTMLElement>('[data-gallery-scroll]');
    if (!overflows(region)) return;
    event.preventDefault();
    region.scrollBy({ top: event.key === 'ArrowDown' ? 64 : -64, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });

  dialog.addEventListener(
    'wheel',
    (event) => {
      if (busy) event.preventDefault();
    },
    { passive: false },
  );

  track.addEventListener(
    'scroll',
    () => {
      const next = clamp(track.scrollLeft / stepOf(track));
      if (next === heading) heading = undefined;
      if (next === index) return;
      select(next);
      announce();
    },
    { passive: true },
  );

  if (!scrollTimelines) {
    const observer = new ResizeObserver((entries) =>
      entries.forEach(({ target }) => {
        const region = target.closest<HTMLElement>('[data-gallery-scroll]');
        if (region) fade(region);
      }),
    );
    regions.forEach((region) => {
      region.addEventListener('scroll', () => fade(region), { passive: true });
      observer.observe(region);
      region.querySelectorAll(':scope > *, img').forEach((child) => observer.observe(child));
    });
  }

  const forget = () => (heading = undefined);
  track.addEventListener('pointerdown', forget, { passive: true });
  track.addEventListener('touchstart', forget, { passive: true });

  const linked = () => {
    const [name, key] = readLink();
    if (name !== dialog.dataset.gallery || !key) return -1;
    const position = Number(key);
    if (Number.isInteger(position) && position > 0 && position <= slides.length) return position - 1;
    return slides.findIndex((slide) => slide.dataset.gallerySlug === key);
  };

  const follow = () => {
    const next = linked();
    if (next < 0) return;
    if (dialog.open) {
      navigate(next);
      return;
    }
    const anchor = triggers[next] ?? openers.at(-1);
    if (!anchor || document.querySelector('dialog[open]')) return;
    anchor.scrollIntoView({ block: 'center' });
    afterScroll(() => open(next, anchor));
  };

  window.addEventListener('hashchange', follow);
  follow();
});