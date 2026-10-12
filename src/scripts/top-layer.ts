export const keepAboveDialogs = (element: HTMLElement) => {
  new MutationObserver(() => {
    (document.querySelector('dialog[open]') ?? document.body).append(element);
  }).observe(document.body, { subtree: true, attributeFilter: ['open'] });
};