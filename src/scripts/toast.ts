import { bounce, reducedMotion, smooth } from './motion';
import { keepAboveDialogs } from './top-layer';

const pill = document.createElement('div');
pill.setAttribute('role', 'status');
pill.setAttribute('data-toast', '');
pill.className =
  'pointer-events-none fixed bottom-6 left-1/2 z-70 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white opacity-0 shadow-lg dark:bg-zinc-50 dark:text-zinc-900';
document.body.append(pill);
keepAboveDialogs(pill);

let queue = Promise.resolve();

const play = (gold: boolean) => {
  const duration = gold ? 3200 : 2200;
  if (reducedMotion.matches) return pill.animate({ opacity: [0, 1, 1, 0] }, { duration, easing: smooth() });
  if (!gold) {
    return pill.animate(
      {
        opacity: [0, 1, 1, 0],
        transform: ['translateY(1rem) scale(0.8)', 'none', 'none', 'translateY(0.5rem) scale(0.95)'],
        offset: [0, 0.15, 0.85, 1],
      },
      { duration, easing: smooth() },
    );
  }
  pill.animate({ backgroundPosition: ['100% 0', '0 0'] }, { duration: 1000, delay: 600, iterations: 2, easing: smooth() });
  return pill.animate(
    {
      opacity: [0, 1, 1, 0],
      transform: ['translateY(2rem) scale(0.3) rotate(-12deg)', 'none', 'none', 'translateY(0.5rem) scale(0.95)'],
      easing: [bounce(), 'linear', smooth()],
      offset: [0, 0.2, 0.85, 1],
    },
    { duration },
  );
};

export const toast = (message: string, { gold = false } = {}) => {
  const shown = queue.then(() => {
    pill.textContent = message;
    pill.toggleAttribute('data-gold', gold);
  });
  queue = shown
    .then(() => play(gold).finished)
    .catch(() => {})
    .then(() => {
      pill.textContent = '';
      pill.removeAttribute('data-gold');
    });
  return shown;
};