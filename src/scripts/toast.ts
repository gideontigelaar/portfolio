import { reducedMotion, smooth } from './motion';
import { keepAboveDialogs } from './top-layer';

const pill = document.createElement('div');
pill.setAttribute('role', 'status');
pill.className =
  'pointer-events-none fixed bottom-6 left-1/2 z-70 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white opacity-0 shadow-lg dark:bg-zinc-50 dark:text-zinc-900';
document.body.append(pill);
keepAboveDialogs(pill);

let queue = Promise.resolve();

export const toast = (message: string) => {
  queue = queue.then(() => {
    pill.textContent = message;
    return pill
      .animate(
        reducedMotion.matches
          ? { opacity: [0, 1, 1, 0] }
          : {
              opacity: [0, 1, 1, 0],
              transform: ['translateY(1rem) scale(0.8)', 'none', 'none', 'translateY(0.5rem) scale(0.95)'],
              offset: [0, 0.15, 0.85, 1],
            },
        { duration: 2200, easing: smooth() },
      )
      .finished.then(
        () => {},
        () => {},
      )
      .then(() => {
        pill.textContent = '';
      });
  });
};