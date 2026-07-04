export function createSprite(className, sprite, label) {
  const element = document.createElement('div');
  element.className = className;
  element.setAttribute('aria-label', label);

  const img = document.createElement('img');
  img.src = sprite;
  img.alt = label;
  img.draggable = false;
  element.appendChild(img);

  return element;
}

export function clearArena(arena) {
  arena.replaceChildren();
}

export function showOnly(screens, activeName) {
  Object.entries(screens).forEach(([name, element]) => {
    element.classList.toggle('is-active', name === activeName);
  });
}
