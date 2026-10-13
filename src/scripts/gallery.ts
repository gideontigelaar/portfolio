import { reducedMotion } from './motion';
import { inViewport } from './viewport';

const radius = (element: Element) =>
  parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;

const isVisible = (rect: DOMRect) => rect.width > 0 && inViewport(rect);

const isBoxed = (element: Element) => getComputedStyle(element).display !== 'contents';

const regionOf = (target: EventTarget | null) =>
  target instanceof Element ? target.closest<HTMLElement>('[data-gallery-scroll]') : null;

const overflows = (region: HTMLElement | null): region is HTMLElement =>
  !!region && region.scrollHeight > region.clientHeight;

document.querySelectorAll<HTMLDialogElement>('dialog[data-gallery]').forEach((dialog) => {
  const track = dialog.querySelector<HTMLElement>('[data-gallery-track]')!;
  const slides = [...track.children] as HTMLElement[];
  const items = [...track.querySelectorAll<HTMLElement>('[data-gallery-item]')];
  const regions = [...track.querySelectorAll<HTMLElement>('[data-gallery-scroll]')];
  const dots = [...dialog.querySelectorAll<HTMLButtonElement>('[data-gallery-dots] button')];
  const fades = [...dialog.querySelectorAll<HTMLElement>('[data-gallery-fade]')];
  const triggers = [
    ...document.querySelectorAll<HTMLElement>(`[data-gallery-open="${dialog.dataset.gallery}"]`),
  ];
  const crossfade = dialog.hasAttribute('data-crossfade');
  let index = 0;
  let busy = false;
  let closeQueued = false;
  let dragged = false;

  const fading = () => {
    const boxed = fades.filter(isBoxed);
    return boxed.filter((element) => !boxed.some((other) => other !== element && other.contains(element)));
  };

  const dismisses = (target: Element) =>
    target === dialog ||
    target === track ||
    target.hasAttribute('data-gallery-backdrop') ||
    !!target.closest('[data-gallery-close]') ||
    (target.parentElement === track && !target.hasAttribute('data-gallery-item'));

  const clamp = (value: number) =>
    Number.isFinite(value) ? Math.max(0, Math.min(Math.round(value), slides.length - 1)) : 0;

  const slideWidth = () =>
    (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 0) || track.clientWidth || 1;

  const select = (next: number) => {
    index = clamp(next);
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
  };

  const go = (next: number, behavior: ScrollBehavior = 'smooth') => {
    track.scrollTo({ left: clamp(next) * slideWidth(), behavior });
  };

  const navigate = (next: number) => {
    if (!busy) go(next);
  };

  const animate = async (opening: boolean) => {
    busy = true;
    dialog.inert = !opening;
    track.style.overflow = 'hidden';
    if (!opening) go(index, 'instant');
    const item = items[index];
    const trigger = triggers[index];
    let ghost: HTMLElement | undefined;
    let animations: Animation[] = [];

    try {
      const options: KeyframeAnimationOptions = {
        duration: reducedMotion.matches ? 150 : opening ? 550 : 450,
        easing: opening ? 'cubic-bezier(0.32, 0.72, 0, 1)' : 'cubic-bezier(1, 0, 0.68, 0.28)',
        direction: opening ? 'normal' : 'reverse',
        fill: 'both',
      };
      const source = trigger?.getBoundingClientRect();
      const target = item?.getBoundingClientRect();
      animations = fading().map((element) =>
        element.animate(
          element.dataset.galleryFade === 'rise' ? { opacity: [0, 1], translate: ['0 0.75rem', '0 0'] } : { opacity: [0, 1] },
          options,
        ),
      );

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
        if (ghost instanceof HTMLImageElement && item instanceof HTMLImageElement) {
          ghost.removeAttribute('srcset');
          ghost.removeAttribute('sizes');
          ghost.src = item.currentSrc || trigger.querySelector('img')?.currentSrc || item.src;
        }
        dialog.append(ghost);
        const ghostRegions = ghost.querySelectorAll<HTMLElement>('[data-gallery-scroll]');
        item.querySelectorAll<HTMLElement>('[data-gallery-scroll]').forEach((region, i) => {
          ghostRegions[i].scrollTop = region.scrollTop;
        });
        item.style.visibility = 'hidden';
        if (!crossfade) trigger.style.visibility = 'hidden';

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

      await Promise.allSettled(animations.map((animation) => animation.finished));
    } finally {
      ghost?.remove();
      if (item) item.style.visibility = '';
      if (trigger) trigger.style.visibility = '';
      animations.forEach((animation) => animation.cancel());
      if (!opening && dialog.open) dialog.close();
      dialog.inert = false;
      track.style.removeProperty('overflow');
      busy = false;
      if (closeQueued && dialog.open) {
        closeQueued = false;
        animate(false);
      }
    }
  };

  const open = (next: number) => {
    if (busy || dialog.open) return;
    closeQueued = false;
    items.forEach((item, i) => {
      const thumbnail = triggers[i]?.querySelector('img');
      if (item instanceof HTMLImageElement && thumbnail) {
        item.style.background = `center / cover url("${thumbnail.currentSrc}")`;
      }
    });
    dialog.showModal();
    dialog.focus({ preventScroll: true });
    dialog.scrollTop = 0;
    regions.forEach((region) => (region.scrollTop = 0));
    go(next, 'instant');
    select(next);
    animate(true);
  };

  const shift = (direction: number) => navigate((index + direction + slides.length) % slides.length);

  const close = () => {
    if (!dialog.open) return;
    if (busy) {
      closeQueued = true;
      return;
    }
    animate(false);
  };

  triggers.forEach((trigger, i) => trigger.addEventListener('click', () => open(i)));
  dots.forEach((dot, i) => dot.addEventListener('click', () => navigate(i)));

  dialog.querySelectorAll<HTMLButtonElement>('[data-gallery-shift]').forEach((button) => {
    button.addEventListener('click', () => shift(Number(button.dataset.galleryShift)));
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener('click', (event) => {
    if (dismisses(event.target as Element)) close();
  });

  dialog.addEventListener('keydown', (event) => {
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

  let wheelLocked = false;
  let wheelTimeout = 0;

  dialog.addEventListener(
    'wheel',
    (event) => {
      const vertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
      const navigates =
        vertical && slides.length > 1 && dialog.scrollHeight <= dialog.clientHeight && !overflows(regionOf(event.target));
      if (!busy && !navigates) return;
      event.preventDefault();
      clearTimeout(wheelTimeout);
      wheelTimeout = window.setTimeout(() => (wheelLocked = false), 200);
      if (busy) wheelLocked = true;
      if (wheelLocked || Math.abs(event.deltaY) < 4) return;
      wheelLocked = true;
      navigate(index + Math.sign(event.deltaY));
    },
    { passive: false },
  );

  track.addEventListener(
    'scroll',
    () => {
      const next = clamp(track.scrollLeft / slideWidth());
      if (next !== index) select(next);
    },
    { passive: true },
  );

  track.addEventListener('dragstart', (event) => event.preventDefault());

  dialog.addEventListener(
    'click',
    (event) => {
      if (!dragged) return;
      dragged = false;
      event.stopImmediatePropagation();
      event.preventDefault();
    },
    true,
  );

  track.addEventListener('pointerdown', (event) => {
    dragged = false;
    if (busy || event.pointerType !== 'mouse' || event.button !== 0 || slides.length < 2) return;
    const region = regionOf(event.target);
    if (region && region === event.target && event.offsetX >= region.clientWidth) return;
    event.preventDefault();

    const start = { x: event.clientX, left: track.scrollLeft, index };
    let delta = 0;

    const move = (moveEvent: PointerEvent) => {
      delta = moveEvent.clientX - start.x;
      if (!dragged && Math.abs(delta) > 5) {
        dragged = true;
        track.style.scrollSnapType = 'none';
      }
      if (dragged) track.scrollLeft = start.left - delta;
    };

    const settle = () => track.style.removeProperty('scroll-snap-type');

    window.addEventListener('pointermove', move);
    window.addEventListener(
      'pointerup',
      () => {
        window.removeEventListener('pointermove', move);
        if (!dragged) return;
        if ('onscrollend' in window) {
          track.addEventListener('scrollend', settle, { once: true });
        } else {
          setTimeout(settle, 500);
        }
        go(Math.abs(delta) > 60 ? start.index - Math.sign(delta) : start.index);
      },
      { once: true },
    );
  });
});