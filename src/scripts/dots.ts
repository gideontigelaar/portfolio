import { dotWindow, maxDots } from '../lib/dots';

export const windowDots = (dots: HTMLElement[]) => {
  const list = dots[0]?.parentElement;
  if (!list || dots.length <= maxDots) return () => {};
  return (active: number) => {
    const { start, hidden, edge } = dotWindow(dots.length, active);
    list.style.setProperty('--dots-start', String(start));
    dots.forEach((dot, i) => {
      dot.inert = hidden(i);
      dot.toggleAttribute('data-edge', edge(i));
    });
  };
};