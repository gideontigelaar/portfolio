import { found } from './eggs';
import { reducedMotion } from './motion';
import { toast } from './toast';

const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const spreeWindow = 3000;
const spreeLength = 10;
const rapidToggle = 600;
const discoDuration = 5000;
const discoFade = 800;
const discoSpin = 800;
const revealProperties = ['--theme-x', '--theme-y', '--theme-radius'];
let spree: number[] = [];
let transition: ViewTransition | undefined;

const themeColor = document.querySelector('meta[name="theme-color"]');

const applyTheme = (dark: boolean) => {
  root.classList.toggle('dark', dark);
  themeColor?.setAttribute('content', dark ? '#09090b' : '#fafafa');
};

const storeTheme = (dark: boolean) => {
  try {
    if (dark === systemDark.matches) {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    }
  } catch {}
};

const clearReveal = () => revealProperties.forEach((property) => root.style.removeProperty(property));

const endTransition = () => {
  transition?.skipTransition();
  transition = undefined;
  clearReveal();
};

const setTheme = (dark: boolean, x: number, y: number, instant: boolean) => {
  storeTheme(dark);
  endTransition();

  if (instant || !('startViewTransition' in document) || reducedMotion.matches) {
    applyTheme(dark);
    return;
  }

  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.style.setProperty('--theme-x', `${x}px`);
  root.style.setProperty('--theme-y', `${y}px`);
  root.style.setProperty('--theme-radius', `${radius}px`);

  const current = document.startViewTransition(() => applyTheme(dark));
  transition = current;
  current.ready.catch(() => {});
  current.finished.then(
    () => {
      if (transition !== current) return;
      transition = undefined;
      clearReveal();
    },
    () => {},
  );
};

const spinOut = async (icon: Element, spin: Animation) => {
  const from = ((Number(spin.currentTime ?? 0) % discoSpin) / discoSpin) * 360;
  const to = from < 180 ? 360 : 720;
  spin.cancel();
  await icon
    .animate(
      { rotate: [`${from}deg`, `${to}deg`] },
      { duration: (2 * (to - from) * discoSpin) / 360, easing: 'cubic-bezier(0.3, 0.6, 0.45, 1)' },
    )
    .finished.catch(() => {});
};

const disco = () => {
  toast('Disco mode');
  found('disco');
  if (reducedMotion.matches) return;

  root.setAttribute('data-disco', '');
  const icons = [...document.querySelectorAll('[data-theme-toggle] > svg')];
  const spins = icons.map((icon) => icon.animate({ rotate: ['0deg', '360deg'] }, { duration: discoSpin, iterations: Infinity }));

  window.setTimeout(() => {
    root.setAttribute('data-disco', 'off');
    Promise.all([
      ...icons.map((icon, i) => spinOut(icon, spins[i])),
      new Promise((resolve) => window.setTimeout(resolve, discoFade)),
    ]).then(() => root.removeAttribute('data-disco'));
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
  setTheme(matches, innerWidth / 2, innerHeight / 2, document.hidden);
});