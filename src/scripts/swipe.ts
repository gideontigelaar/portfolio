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
const dragSlop = 5;
const flipDistance = 60;
const settleFallback = 600;

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

  const apply = (value: number) => {
    if (value === offset) return;
    offset = value;
    track.style.translate = value ? `${value}px` : '';
  };

  const pull = (position: number) => {
    if (reducedMotion.matches) return;
    const max = track.scrollWidth - track.clientWidth;
    const overshoot = position - Math.min(Math.max(position, 0), max);
    apply(-stretch(overshoot, track.clientWidth * stretchRatio));
  };

  const release = () => {
    if (!offset) return;
    track.animate({ translate: [`${offset}px`, '0px'] }, { duration: returnDuration, easing: smooth(), composite: 'add' });
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