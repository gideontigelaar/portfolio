document.addEventListener('touchstart', () => {}, { passive: true });

let keyboard = false;
window.addEventListener('keydown', () => (keyboard = true), { capture: true });
window.addEventListener('pointerdown', () => (keyboard = false), { capture: true, passive: true });

export const usingKeyboard = () => keyboard;

export const restoreFocus = (element: HTMLElement, visible: boolean) => {
  if (document.activeElement === element) element.blur();
  element.focus({ preventScroll: true, focusVisible: visible });
  if (visible || !element.matches(':focus-visible')) return;
  element.setAttribute('data-quiet-focus', '');
  const settle = (event: Event) => {
    if (event.type === 'blur' && !document.hasFocus()) return;
    element.removeAttribute('data-quiet-focus');
    element.removeEventListener('blur', settle);
    window.removeEventListener('keydown', settle, true);
  };
  element.addEventListener('blur', settle);
  window.addEventListener('keydown', settle, true);
};

const ghostWindow = 500;

export const onActivate = (button: HTMLElement, callback: () => void) => {
  let pressed = false;
  let last = -Infinity;
  button.addEventListener('pointerdown', () => (pressed = true), { passive: true });
  button.addEventListener('click', ({ detail, timeStamp }) => {
    if (detail && !pressed && timeStamp - last < ghostWindow) return;
    if (pressed) last = timeStamp;
    pressed = false;
    callback();
  });
};