import { isDesktop } from './eggs';

const modifiers = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock']);

const ignored = (target: EventTarget | null) =>
  target instanceof Element && !!target.closest('input, textarea, select, [contenteditable], dialog');

export const onSequence = (sequence: string[], within: number, callback: () => void) => {
  const keys: string[] = [];
  const times: number[] = [];

  window.addEventListener('keydown', (event) => {
    if (
      event.repeat ||
      event.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      modifiers.has(event.key) ||
      !isDesktop() ||
      ignored(event.target)
    ) {
      return;
    }

    keys.push(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    times.push(event.timeStamp);
    if (keys.length > sequence.length) {
      keys.shift();
      times.shift();
    }

    if (keys.length < sequence.length || event.timeStamp - times[0] > within) return;
    if (!keys.every((key, i) => key === sequence[i])) return;
    keys.length = 0;
    times.length = 0;
    callback();
  });
};