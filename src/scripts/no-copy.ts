const block = (event: Event) => event.preventDefault();

['copy', 'cut', 'selectstart'].forEach((type) => document.addEventListener(type, block));

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) selection.removeAllRanges();
});