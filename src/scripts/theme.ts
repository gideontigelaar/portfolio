import { found } from './eggs';
import { reducedMotion } from './motion';
import { toast } from './toast';

const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const spreeWindow = 3000;
const spreeLength = 6;
const rapidToggle = 1500;
const discoDuration = 5000;
const discoFade = 600;
let spree: number[] = [];

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

const setTheme = (dark: boolean, x: number, y: number, instant: boolean) => {
  storeTheme(dark);

  if (instant || !('startViewTransition' in document) || reducedMotion.matches) {
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

const disco = () => {
  toast('Disco mode 🪩');
  found('disco');
  if (reducedMotion.matches) return;

  root.setAttribute('data-disco', '');
  window.setTimeout(() => {
    root.setAttribute('data-disco', 'off');
    window.setTimeout(() => root.removeAttribute('data-disco'), discoFade);
  }, discoDuration);
};

export const toggleTheme = (x: number, y: number) => {
  if (root.hasAttribute('data-disco')) return;

  const now = performance.now();
  spree = spree.filter((time) => now - time < spreeWindow);
  const rapid = now - (spree.at(-1) ?? -Infinity) < rapidToggle;
  spree.push(now);

  setTheme(!root.classList.contains('dark'), x, y, rapid);

  if (spree.length < spreeLength) return;
  spree = [];
  disco();
};

systemDark.addEventListener('change', ({ matches }) => {
  storeTheme(matches);
  applyTheme(matches);
});