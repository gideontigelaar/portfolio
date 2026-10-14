import { uiText } from '../data/text';
import { windowDots } from './dots';
import { reducedMotion, smooth } from './motion';
import { onActivate } from './press';
import { clampIndex, labelSlides, stepOf, swipe } from './swipe';

const enterDuration = 550;
const enterStagger = 70;
const blur = 'blur(8px)';
const wide = matchMedia('(min-width: 40rem)');

document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
  const track = root.querySelector<HTMLElement>('[data-carousel-pages]')!;
  const pages = [...track.children] as HTMLElement[];
  if (pages.length < 2) return;

  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-dots] button')];
  const status = root.querySelector<HTMLElement>('[data-carousel-status]');
  const items = pages.map((page) => [...page.querySelectorAll<HTMLElement>('[data-carousel-item]')]);
  const slideDots = windowDots(dots);
  let index = 0;
  let heading: number | undefined;
  let entering: Animation[] = [];

  const scrollTo = (next: number, behavior: ScrollBehavior) =>
    track.scrollTo({ left: next * stepOf(track), behavior: reducedMotion.matches ? 'instant' : behavior });

  const lock = () => pages.forEach((page, i) => (page.inert = i !== index));

  const select = (next: number) => {
    index = next;
    lock();
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    slideDots(index);
    if (status) status.textContent = uiText.page(index + 1, pages.length);
  };

  const reveal = (direction: number) => {
    entering.forEach((animation) => animation.cancel());
    entering = [];
    if (reducedMotion.matches) return;
    entering = items[index].map((item, i) =>
      item.animate(
        { opacity: [0, 1], filter: [blur, 'none'], scale: [0.97, 1], translate: [`${direction * 1.25}rem 0.5rem`, '0 0'] },
        { duration: enterDuration, delay: i * enterStagger, easing: smooth(), fill: 'backwards' },
      ),
    );
  };

  const paint = swipe(track, {
    index: () => index,
    go: (next) => scrollTo(clampIndex(next, pages.length), 'smooth'),
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

  labelSlides(pages);
  lock();

  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, Math.sign(i - index))));

  root.querySelectorAll<HTMLButtonElement>('[data-carousel-shift]').forEach((button) => {
    const direction = Number(button.dataset.carouselShift);
    onActivate(button, () => show(((heading ?? index) + direction + pages.length) % pages.length, direction));
  });

  track.addEventListener(
    'scroll',
    () => {
      const next = clampIndex(track.scrollLeft / stepOf(track), pages.length);
      if (next === heading) heading = undefined;
      if (next !== index) select(next);
    },
    { passive: true },
  );

  track.addEventListener('pointerdown', forget, { passive: true });
  track.addEventListener('touchstart', forget, { passive: true });

  root.addEventListener('gallery-reveal', ({ target }) => {
    const page = pages.findIndex((candidate) => target instanceof Node && candidate.contains(target));
    if (page === -1 || page === index) return;
    forget();
    select(page);
    scrollTo(page, 'instant');
    paint();
  });
});