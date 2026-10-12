const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(({ isIntersecting, boundingClientRect, target }) => {
      if (!isIntersecting && boundingClientRect.top > 0) return;
      target.setAttribute('data-revealed', '');
      observer.unobserve(target);
    });
  },
  { rootMargin: '0px 0px 10% 0px' },
);

document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));