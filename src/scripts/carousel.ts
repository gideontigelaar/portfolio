import { uiText } from '../data/text';
import { windowDots } from './dots';
import { reducedMotion, smooth } from './motion';
import { onActivate } from './press';
import { clampIndex, labelSlides, stepOf, swipe } from './swipe';

const enterDuration = 550;
const enterStagger = 70;
const blur = 'blur(8px)';
const wide = window.matchMedia('(min-width: 40rem)');

document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
  const track = root.querySelector<HTMLElement>('[data-carousel-pages]')!;
  const items = [...track.children] as HTMLElement[];
  if (items.length < 2) return;
  const contents = items.map((item) => item.querySelector<HTMLElement>('[data-carousel-item]') ?? item);

  const status = root.querySelector<HTMLElement>('[data-carousel-status]');
  const dotSets = [...root.querySelectorAll<HTMLElement>('[data-carousel-controls]')].map((controls) => {
    const dots = [...controls.querySelectorAll<HTMLButtonElement>('[data-dots] button')];
    return { dots, slide: windowDots(dots) };
  });

  const perPage = () => {
    const next = items.findIndex((item) => item.offsetLeft !== items[0].offsetLeft);
    return next === -1 ? items.length : next;
  };

  let size = perPage();
  let index = 0;
  let heading: number | undefined;
  let entering: Animation[] = [];

  const count = () => Math.ceil(items.length / size);

  const pageContents = (page: number) => contents.slice(page * size, (page + 1) * size);

  const scrollTo = (next: number, behavior: ScrollBehavior) =>
    track.scrollTo({ left: next * stepOf(track), behavior: reducedMotion.matches ? 'instant' : behavior });

  const lock = () => items.forEach((item, i) => (item.inert = Math.floor(i / size) !== index));

  const anchor = () =>
    items.forEach((item, i) => {
      const first = items[i - (i % size)];
      const last = items[Math.min(i - (i % size) + size, items.length) - 1];
      const middle = (first.offsetTop + last.offsetTop + last.offsetHeight) / 2;
      item.style.transformOrigin = `50% ${middle - item.offsetTop}px`;
    });

  const select = (next: number) => {
    index = next;
    lock();
    const dotSet = dotSets.find(({ dots }) => dots.length === count());
    dotSet?.dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    dotSet?.slide(index);
    if (status) status.textContent = uiText.page(index + 1, count());
  };

  const settled = new Set<HTMLElement>();

  const settleReveals = () =>
    contents.forEach((content, i) => {
      if (i >= size && content.hasAttribute('data-reveal') && !content.hasAttribute('data-revealed')) {
        content.setAttribute('data-revealed', '');
        settled.add(content);
      } else if (i < size && settled.has(content) && !contents[0].hasAttribute('data-revealed')) {
        settled.delete(content);
        content.removeAttribute('data-revealed');
      }
    });

  const reveal = (direction: number) => {
    entering.forEach((animation) => animation.cancel());
    entering = [];
    if (reducedMotion.matches) return;
    entering = pageContents(index).map((content, i) =>
      content.animate(
        { opacity: [0, 1], filter: [blur, 'none'], scale: [0.97, 1], translate: [`${direction * 1.25}rem 0.5rem`, '0 0'] },
        { duration: enterDuration, delay: i * enterStagger, easing: smooth(), fill: 'backwards' },
      ),
    );
  };

  const paint = swipe(track, {
    index: () => index,
    go: (next) => scrollTo(clampIndex(next, count()), 'smooth'),
    host: root,
  });

  const show = (next: number, direction: number) => {
    if (next === (heading ?? index)) return;
    if (!wide.matches) {
      heading = next;
      scrollTo(next, 'smooth');
      return;
    }
    heading = undefined;
    select(next);
    scrollTo(next, 'instant');
    paint();
    reveal(direction);
  };

  const forget = () => (heading = undefined);

  labelSlides(items);
  lock();
  settleReveals();

  dotSets.forEach(({ dots }) =>
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, Math.sign(i - index)))),
  );

  root.querySelectorAll<HTMLButtonElement>('[data-carousel-shift]').forEach((button) => {
    const direction = Number(button.dataset.carouselShift);
    onActivate(button, () => show(((heading ?? index) + direction + count()) % count(), direction));
  });

  track.addEventListener(
    'scroll',
    () => {
      if (size !== perPage()) return;
      const next = clampIndex(track.scrollLeft / stepOf(track), count());
      if (next === heading) heading = undefined;
      if (next !== index) select(next);
    },
    { passive: true },
  );

  track.addEventListener('pointerdown', forget, { passive: true });
  track.addEventListener(
    'pointerdown',
    ({ pointerType }) => {
      if (pointerType === 'mouse') return;
      contents.forEach((content) => content.getAnimations().forEach((animation) => animation.finish()));
    },
    { passive: true },
  );
  track.addEventListener('touchstart', forget, { passive: true });

  new ResizeObserver(() => {
    const next = perPage();
    if (next !== size) {
      const page = Math.floor((index * size) / next);
      size = next;
      forget();
      entering.forEach((animation) => animation.cancel());
      entering = [];
      settleReveals();
      select(page);
      scrollTo(page, 'instant');
      paint();
    }
    anchor();
  }).observe(track);

  new IntersectionObserver(
    (entries, observer) => {
      if (!entries.some(({ isIntersecting }) => isIntersecting)) return;
      observer.disconnect();
      track.querySelectorAll('img').forEach((image) => (image.loading = 'eager'));
    },
    { rootMargin: '100% 0px' },
  ).observe(track);

  root.addEventListener('gallery-reveal', ({ target }) => {
    const item = items.findIndex((candidate) => target instanceof Node && candidate.contains(target));
    const page = Math.floor(item / size);
    if (item === -1 || page === index) return;
    forget();
    select(page);
    scrollTo(page, 'instant');
    paint();
  });
});