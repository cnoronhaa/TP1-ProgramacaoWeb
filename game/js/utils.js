export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function setElementPosition(element, x, y, size, angle = 0) {
  element.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px) rotate(${angle}rad)`;
}

export function circlesCollide(a, b) {
  return distance(a, b) <= a.radius + b.radius;
}
