import { toastText } from '../data/text';
import { confetti } from './confetti';
import { toast } from './toast';

const storageKey = 'easter-eggs';
const touchOnly = window.matchMedia('(hover: none) and (pointer: coarse)');

const registry = {
  konami: 'desktop',
  'name-wave': 'desktop',
  console: 'desktop',
  'secret-menu': 'desktop',
  'catch-the-dot': 'desktop',
  'party-hat': 'all',
  disco: 'all',
  'time-travel': 'all',
  sleep: 'all',
  'language-combo': 'all',
} as const;

type Egg = keyof typeof registry;

const ids = Object.keys(registry) as Egg[];
const discovered = new Set<Egg>();

try {
  const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  if (Array.isArray(stored)) {
    ids.filter((id) => stored.includes(id)).forEach((id) => discovered.add(id));
  }
} catch {}

export const isDesktop = () => !touchOnly.matches;

export const onDeviceChange = (callback: () => void) => touchOnly.addEventListener('change', callback);

const available = () => ids.filter((id) => registry[id] === 'all' || isDesktop());

export const total = () => available().length;

export const count = () => available().filter((id) => discovered.has(id)).length;

const golden = () => document.documentElement.toggleAttribute('data-golden', count() === total());

golden();
onDeviceChange(golden);

export const found = (egg: Egg) => {
  if (discovered.has(egg) || !available().includes(egg)) return;
  discovered.add(egg);
  try {
    localStorage.setItem(storageKey, JSON.stringify([...discovered]));
  } catch {}
  toast(toastText.eggFound(count(), total()));
  if (!golden()) return;
  toast(toastText.allEggs, { gold: true }).then(() => {
    confetti();
    window.dispatchEvent(new Event('eggs-complete'));
  });
};