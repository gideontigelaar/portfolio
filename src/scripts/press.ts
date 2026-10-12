const duration = 150;

document.addEventListener('click', ({ target }) => {
  if (!(target instanceof Element)) return;

  const element = target.closest<HTMLElement>('[data-press]');
  if (!element || element.hasAttribute('data-launching')) return;

  element.setAttribute('data-launching', '');
  window.setTimeout(() => element.removeAttribute('data-launching'), duration);
});