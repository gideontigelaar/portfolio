const elements = new Set<HTMLElement>();
let observer: MutationObserver | undefined;

const openDialog = () => document.querySelector('dialog[open]');

const relocate = () => {
  const host = openDialog() ?? document.body;
  elements.forEach((element) => host.append(element));
};

export const keepAboveDialogs = (element: HTMLElement) => {
  elements.add(element);
  openDialog()?.append(element);
  if (observer) return;
  observer = new MutationObserver(relocate);
  observer.observe(document.body, { subtree: true, attributeFilter: ['open'] });
};