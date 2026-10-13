export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export const smooth = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const playOnce = (
  element: Element,
  keyframes: PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
) => {
  if (reducedMotion.matches || element.getAnimations().some((animation) => !(animation instanceof CSSTransition))) return;
  element.animate(keyframes, options);
};