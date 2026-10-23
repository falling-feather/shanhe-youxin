import { SOURCE_BY_ID } from './data/sources.mjs';
import { esc } from './renderers.mjs';

/** 仅阅览完整原图：拖动、缩放、读边款；不补写历史行程。 */
export function mountAtlas(container, { view = {} } = {}) {
  const source = SOURCE_BY_ID.atlas;
  let baseWidth = 1, baseHeight = 1, dragging = null;
  Object.assign(view, { zoom: view.zoom ?? 1, x: view.x ?? 0, y: view.y ?? 0 });
  container.innerHTML = `<div class="map-pane"><div class="map-viewport" tabindex="0" role="application" aria-label="汉口历史地图。方向键移动，滚轮或按钮缩放，可以放大图幅边款。"><div class="map-sheet"><img src="${esc(source.image)}" alt="${esc(source.title)}，${esc(source.date)}，完整边款保留" draggable="false"></div><span class="map-crosshair" aria-hidden="true"></span></div><div class="map-pins-control"><button type="button" data-map-source>汉口地图 · 自由查阅 ↗</button></div><div class="map-controls"><button type="button" data-map-control="in" aria-label="放大地图">＋</button><button type="button" data-map-control="out" aria-label="缩小地图">－</button><button type="button" data-map-control="fit">全幅</button><button type="button" data-map-control="margin">读边款</button></div><div class="map-loading">正在展开真实图幅…</div><div class="map-bottom"><div>${esc(source.date)}<small>空间参考；实际路线仍须另查材料</small></div><button type="button" data-map-source>看完整出处 ↗</button></div></div>`;
  const viewport = container.querySelector('.map-viewport');
  const sheet = container.querySelector('.map-sheet');
  const image = sheet.querySelector('img');
  const loading = container.querySelector('.map-loading');
  function redraw() {
    const maxX = (baseWidth * view.zoom + viewport.clientWidth) / 2 - 50;
    const maxY = (baseHeight * view.zoom + viewport.clientHeight) / 2 - 50;
    view.x = Math.max(-maxX, Math.min(maxX, view.x));
    view.y = Math.max(-maxY, Math.min(maxY, view.y));
    sheet.style.width = `${baseWidth}px`; sheet.style.height = `${baseHeight}px`;
    sheet.style.transform = `translate(calc(-50% + ${view.x}px),calc(-50% + ${view.y}px)) scale(${view.zoom})`;
  }
  function resize() {
    if (viewport.clientWidth <= 0 || viewport.clientHeight <= 0) return;
    baseHeight = Math.min(viewport.clientHeight - 24, (viewport.clientWidth - 24) * 7500 / 5044);
    baseWidth = baseHeight * 5044 / 7500;
    redraw();
  }
  function zoom(factor, clientX, clientY) {
    const rect = viewport.getBoundingClientRect();
    const ax = (clientX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
    const ay = (clientY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
    const next = Math.max(1, Math.min(14, view.zoom * factor));
    const ratio = next / view.zoom;
    view.x = ax - (ax - view.x) * ratio; view.y = ay - (ay - view.y) * ratio; view.zoom = next; redraw();
  }
  const observer = new ResizeObserver(resize); observer.observe(viewport);
  image.addEventListener('load', () => { loading.hidden = true; });
  image.addEventListener('error', () => { loading.textContent = '地图未能加载，请打开资料 01 查看出处。'; });
  if (image.complete && image.naturalWidth) loading.hidden = true;
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    viewport.focus({ preventScroll: true });
    dragging = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y, moved: false };
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', event => {
    if (!dragging || event.pointerId !== dragging.id) return;
    if (Math.hypot(event.clientX - dragging.startX, event.clientY - dragging.startY) > 5) dragging.moved = true;
    if (dragging.moved) { viewport.classList.add('dragging'); view.x = dragging.x + event.clientX - dragging.startX; view.y = dragging.y + event.clientY - dragging.startY; redraw(); }
  });
  viewport.addEventListener('pointerup', event => {
    if (!dragging || event.pointerId !== dragging.id) return;
    dragging = null; viewport.classList.remove('dragging');
  });
  viewport.addEventListener('pointercancel', () => { dragging = null; viewport.classList.remove('dragging'); });
  viewport.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15, event.clientX, event.clientY); }, { passive: false });
  viewport.addEventListener('keydown', event => {
    const delta = event.shiftKey ? 12 : 40;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-', '='].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowLeft') view.x += delta;
    if (event.key === 'ArrowRight') view.x -= delta;
    if (event.key === 'ArrowUp') view.y += delta;
    if (event.key === 'ArrowDown') view.y -= delta;
    if (event.key === '+' || event.key === '=') zoom(1.2);
    if (event.key === '-') zoom(1 / 1.2);
    redraw();
  });
  container.addEventListener('click', onClick);
  function onClick(event) {
    const action = event.target.closest('[data-map-control]')?.dataset.mapControl;
    if (action === 'in') zoom(1.35);
    if (action === 'out') zoom(1 / 1.35);
    if (action === 'fit') { Object.assign(view, { zoom: 1, x: 0, y: 0 }); redraw(); }
    if (action === 'margin') { const scale = viewport.clientWidth < 500 ? 12 : 6.5; Object.assign(view, { zoom: scale, x: baseWidth * scale * .31, y: baseHeight * scale * -.386 }); redraw(); }
  }
  resize();
  return { dispose: () => { observer.disconnect(); container.removeEventListener('click', onClick); } };
}
