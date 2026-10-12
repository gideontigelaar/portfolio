import { reducedMotion } from './motion';

const duration = (element: HTMLElement) =>
  parseFloat(getComputedStyle(element).getPropertyValue('--launch-duration')) || 150;

export const press = (element: HTMLElement) =>
  new Promise<void>((resolve) => {
    if (reducedMotion.matches || element.hasAttribute('data-launching')) {
      resolve();
      return;
    }

    element.setAttribute('data-launching', '');
    window.setTimeout(() => {
      element.removeAttribute('data-launching');
      resolve();
    }, duration(element));
  });

export const launch = async (link: HTMLAnchorElement) => {
  await press(link);

  if (link.target === '_blank') {
    window.open(link.href, '_blank', 'noopener');
    return;
  }

  window.location.assign(link.href);
};

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || !(event.target instanceof Element)) return;

  const element = event.target.closest<HTMLElement>('[data-press]');
  if (!element) return;

  if (!(element instanceof HTMLAnchorElement)) {
    press(element);
    return;
  }

  if (
    reducedMotion.matches ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  if (element.hasAttribute('data-launching')) return;
  launch(element);
});