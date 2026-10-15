import { uiText } from '../data/text';
import { reducedMotion, scrollTimelines, smooth } from './motion';

interface SwipeOptions {
  index: () => number;
  go: (index: number) => void;
  host?: HTMLElement;
  enabled?: () => boolean;
  ignore?: (event: PointerEvent) => boolean;
  preventDefault?: boolean;
}

const resistance = 0.55;
const stretchRatio = 0.5;
const returnDuration = 600;
const intentDistance = 8;
const dragSlop = 5;
const flipDistance = 60;
const settleFallback = 600;
const scrollTolerance = 1;

export const stepOf = (track: HTMLElement) => {
  const [first, second] = track.children as HTMLCollectionOf<HTMLElement>;
  return (second ? second.offsetLeft - first.offsetLeft : 0) || track.clientWidth || 1;
};

export const clampIndex = (value: number, count: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(Math.round(value), count - 1)) : 0;

export const labelSlides = (slides: HTMLElement[]) =>
  slides.forEach((slide, i) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', uiText.slide);
    slide.setAttribute('aria-label', uiText.position(i + 1, slides.length));
  });

const stretch = (distance: number, size: number) =>
  Math.sign(distance) * (1 - 1 / ((Math.abs(distance) * resistance) / size + 1)) * size;

const createBounce = (track: HTMLElement) => {
  let offset = 0;
  let returning: Animation | undefined;

  const apply = (value: number) => {
    offset = value;
    track.style.translate = value ? `${value}px` : '';
  };

  const pull = (position: number) => {
    if (reducedMotion.matches) return;
    returning?.cancel();
    returning = undefined;
    const max = track.scrollWidth - track.clientWidth;
    const overshoot = position - Math.min(Math.max(position, 0), max);
    const native = track.scrollLeft < -scrollTolerance || track.scrollLeft > max + scrollTolerance;
    apply(overshoot && !native ? -stretch(overshoot, track.clientWidth * stretchRatio) : 0);
  };

  const release = () => {
    if (!offset) return;
    returning = track.animate({ translate: [`${offset}px`, '0px'] }, { duration: returnDuration, easing: smooth() });
    apply(0);
  };

  return { pull, release };
};

export const swipe = (
  track: HTMLElement,
  { index, go, host = track, enabled = () => true, ignore, preventDefault = false }: SwipeOptions,
) => {
  track.addEventListener('dragstart', (event) => event.preventDefault());
  const slides = [...track.children] as HTMLElement[];
  if (slides.length < 2) return () => {};

  const bounce = createBounce(track);
  let frame = 0;
  let dragged = false;
  let timer = 0;
  let origin: { x: number; y: number; left: number } | undefined;
  let horizontal: boolean | undefined;

  const restoreSnap = () => {
    window.clearTimeout(timer);
    track.removeEventListener('scrollend', restoreSnap);
    track.style.removeProperty('scroll-snap-type');
  };

  const paint = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (scrollTimelines || !track.clientWidth) return;
    const step = stepOf(track);
    const range = (track.clientWidth + slides[0].offsetWidth) / 2;
    const left = track.scrollLeft;
    slides.forEach((slide, i) =>
      slide.style.setProperty('--distance', String(Math.min(Math.abs(i * step - left) / range, 1))),
    );
  };

  if (!scrollTimelines) {
    const schedule = () => (frame ||= requestAnimationFrame(paint));
    track.addEventListener('scroll', schedule, { passive: true });
    schedule();
  }

  const endTouch = () => {
    origin = undefined;
    bounce.release();
  };

  track.addEventListener(
    'touchstart',
    ({ touches }) => {
      horizontal = undefined;
      origin =
        touches.length === 1 && enabled()
          ? { x: touches[0].clientX, y: touches[0].clientY, left: track.scrollLeft }
          : undefined;
    },
    { passive: true },
  );

  track.addEventListener(
    'touchmove',
    ({ touches }) => {
      if (!origin || touches.length !== 1) return;
      const dx = touches[0].clientX - origin.x;
      const dy = touches[0].clientY - origin.y;
      if (horizontal === undefined && Math.hypot(dx, dy) > intentDistance) horizontal = Math.abs(dx) > Math.abs(dy);
      if (horizontal) bounce.pull(origin.left - dx);
    },
    { passive: true },
  );

  track.addEventListener('touchend', endTouch, { passive: true });
  track.addEventListener('touchcancel', endTouch, { passive: true });

  host.addEventListener(
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
    if (event.pointerType !== 'mouse' || event.button !== 0 || !enabled() || ignore?.(event)) return;
    if (preventDefault) event.preventDefault();

    window.clearTimeout(timer);
    track.removeEventListener('scrollend', restoreSnap);

    const start = { x: event.clientX, left: track.scrollLeft, index: index() };
    const controller = new AbortController();
    const { signal } = controller;
    let delta = 0;

    const move = (moveEvent: PointerEvent) => {
      delta = moveEvent.clientX - start.x;
      if (!dragged && Math.abs(delta) > dragSlop) {
        dragged = true;
        track.style.scrollSnapType = 'none';
      }
      if (!dragged) return;
      track.scrollLeft = start.left - delta;
      bounce.pull(start.left - delta);
    };

    const end = () => {
      controller.abort();
      if (!dragged) {
        restoreSnap();
        return;
      }
      window.setTimeout(() => (dragged = false));
      bounce.release();
      track.addEventListener('scrollend', restoreSnap, { once: true });
      timer = window.setTimeout(restoreSnap, settleFallback);
      go(Math.abs(delta) > flipDistance ? start.index - Math.sign(delta) : start.index);
    };

    window.addEventListener('pointermove', move, { signal });
    window.addEventListener('pointerup', end, { signal });
    window.addEventListener('pointercancel', end, { signal });
  });

  return paint;
};