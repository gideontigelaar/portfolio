export const maxDots = 4;

export const dotWindow = (count: number, active: number) => {
  const start = Math.max(0, Math.min(active - Math.floor((maxDots - 1) / 2), count - maxDots));
  return {
    start,
    hidden: (i: number) => count > maxDots && (i < start || i >= start + maxDots),
    edge: (i: number) =>
      count > maxDots && ((i === start && start > 0) || (i === start + maxDots - 1 && start + maxDots < count)),
  };
};