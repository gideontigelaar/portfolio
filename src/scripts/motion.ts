export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export const scrollTimelines = CSS.supports('animation-timeline: scroll()');

const easings = new Map<string, string>();

const easing = (name: string) => {
  let value = easings.get(name);
  if (value === undefined) {
    value = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'ease-out';
    easings.set(name, value);
  }
  return value;
};

export const spring = () => easing('--ease-spring');

export const smooth = () => easing('--ease-smooth');

export const bounce = () => easing('--ease-bounce');

export const playOnce = (
  element: Element,
  keyframes: PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
) => {
  if (reducedMotion.matches || element.getAnimations().some((animation) => !(animation instanceof CSSTransition))) return;
  return element.animate(keyframes, options);
};