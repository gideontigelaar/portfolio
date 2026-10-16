const root = document.documentElement;
const live = '[data-context-menu]';
const releaseEvent = 'hover-release';
let held: Element[] = [];

const hoverLocked = () => root.hasAttribute('data-hover-lock');

export const hoverable = (element: Element) => !hoverLocked() || !!element.closest(live);

export const onHoverRelease = (callback: () => void) => window.addEventListener(releaseEvent, callback);

export const releaseHover = () => {
  if (!hoverLocked()) return;
  held.forEach((element) => element.removeAttribute('data-hovered'));
  held = [];
  root.removeAttribute('data-hover-lock');
  window.dispatchEvent(new Event(releaseEvent));
};

export const lockHover = () => {
  releaseHover();
  held = [...document.querySelectorAll(':hover')];
  held.forEach((element) => element.setAttribute('data-hovered', ''));
  root.setAttribute('data-hover-lock', '');
};