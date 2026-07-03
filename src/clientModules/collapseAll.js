function collapseAll() {
  const items = document.querySelectorAll(
    '.menu__list-item:not(.menu__list-item--collapsed)'
  );

  items.forEach(item => {
    const caret = item.querySelector('.menu__caret');
    if (caret) { caret.click(); return; }

    const label = item.querySelector('.menu__link--sublist');
    if (label) { label.click(); }
  });
}

// Expose globally for the navbar button
if (typeof window !== 'undefined') {
  window.__flockCollapseAll = collapseAll;
}

// Auto-collapse all categories on first page load
let isFirstLoad = true;
export function onRouteDidUpdate() {
  if (!isFirstLoad) return;
  isFirstLoad = false;

  setTimeout(() => collapseAll(), 150);
}
