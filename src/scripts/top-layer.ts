const elements = new Set<HTMLElement>();
const dialogs: HTMLDialogElement[] = [];
let observer: MutationObserver | undefined;

const relocate = (records: MutationRecord[]) => {
  records.forEach(({ target }) => {
    if (!(target instanceof HTMLDialogElement)) return;
    const index = dialogs.indexOf(target);
    if (index !== -1) dialogs.splice(index, 1);
    if (target.open) dialogs.push(target);
  });
  const host = dialogs.at(-1) ?? document.body;
  elements.forEach((element) => {
    if (element.parentElement !== host) host.append(element);
  });
};

export const keepAboveDialogs = (element: HTMLElement) => {
  elements.add(element);
  if (!observer) {
    dialogs.push(...document.querySelectorAll<HTMLDialogElement>('dialog[open]'));
    observer = new MutationObserver(relocate);
    observer.observe(document.body, { subtree: true, attributeFilter: ['open'] });
  }
  dialogs.at(-1)?.append(element);
  return () => elements.delete(element);
};