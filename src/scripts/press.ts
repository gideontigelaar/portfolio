document.addEventListener('touchstart', () => {}, { passive: true });

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