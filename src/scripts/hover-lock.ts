const root = document.documentElement;
const live = '[data-context-menu]';
const releaseEvent = 'hover-release';
let held: [Element, string][] = [];

const hoverLocked = () => root.hasAttribute('data-hover-lock');

const mark = (element: Element | null, name: string) => {
  if (!element) return;
  element.setAttribute(name, '');
  held.push([element, name]);
};

export const hoverable = (element: Element) => !hoverLocked() || !!element.closest(live);

export const onHoverRelease = (callback: () => void) => window.addEventListener(releaseEvent, callback);

export const releaseHover = () => {
  if (!hoverLocked()) return;
  held.forEach(([element, name]) => element.removeAttribute(name));
  held = [];
  root.removeAttribute('data-hover-lock');
  window.dispatchEvent(new Event(releaseEvent));
};

export const lockHover = () => {
  releaseHover();
  document.querySelectorAll('body :hover').forEach((element) => {
    mark(element, 'data-hovered');
    mark(element.previousElementSibling, 'data-next-hovered');
  });
  root.setAttribute('data-hover-lock', '');
};