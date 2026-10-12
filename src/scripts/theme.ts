import { reducedMotion } from './motion';

const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

const applyTheme = (dark: boolean) => root.classList.toggle('dark', dark);

const storeTheme = (dark: boolean) => {
  try {
    if (dark === systemDark.matches) {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    }
  } catch {}
};

export const toggleTheme = (x: number, y: number) => {
  const dark = !root.classList.contains('dark');
  storeTheme(dark);

  if (!('startViewTransition' in document) || reducedMotion.matches) {
    applyTheme(dark);
    return;
  }

  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  document.startViewTransition(() => applyTheme(dark)).ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 600,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  });
};

systemDark.addEventListener('change', ({ matches }) => {
  storeTheme(matches);
  applyTheme(matches);
});