const colors = ['#3b82f6', '#60a5fa', '#f59e0b', '#f43f5e', '#10b981', '#a855f7'];
const steps = 12;
const pieces = 60;

export const confetti = () => {
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.className = 'pointer-events-none fixed inset-0 z-70 overflow-hidden';
  document.body.append(layer);

  const falls = Array.from({ length: pieces }, () => {
    const piece = document.createElement('span');
    piece.className = 'absolute -top-3 left-1/2 h-3 w-1.5 rounded-xs';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    layer.append(piece);

    const spreadX = (Math.random() - 0.5) * innerWidth;
    const lift = Math.random() * 160;
    const gravity = innerHeight * (0.9 + Math.random() * 0.4);
    const spin = (Math.random() - 0.5) * 1440;

    const frames = Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;
      const x = spreadX * t;
      const y = gravity * t * t - lift * t * (1 - t);
      return {
        transform: `translate(${x}px, ${y}px) rotate(${spin * t}deg) rotateY(${spin * t * 2}deg)`,
        opacity: t > 0.8 ? (1 - t) * 5 : 1,
      };
    });

    return piece.animate(frames, {
      duration: 1600 + Math.random() * 800,
      delay: Math.random() * 150,
      easing: 'linear',
      fill: 'both',
    }).finished;
  });

  Promise.allSettled(falls).then(() => layer.remove());
};