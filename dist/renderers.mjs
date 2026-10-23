import { SOURCE_BY_ID } from './data/sources.mjs';


export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const disabled = value => value ? ' disabled' : '';
export const sourceButtons = ids => ids.map(id => `<button type="button" data-source="${id}">[${SOURCE_BY_ID[id].number}] ${esc(SOURCE_BY_ID[id].short)} ↗</button>`).join('');
const boundary = source => `<div class="source-limit"><strong>这份材料能走到哪里</strong>${esc(source.limit)}</div>`;

export function materialMarkup(source, ui, context, bookmarked) {
  const expanded = context === 'reader';
  const tab = ui.tab ?? (source.image ? 'image' : 'notes');
  const page = Math.min(ui.page ?? 0, (source.pages?.length ?? 1) - 1);
  const image = source.pages?.[page]?.url ?? source.image;
  const scan = image ? `<div class="source-scan${ui.zoom ? ' image-zoomed' : ''}">${source.pages ? `<div class="scan-navigation"><button type="button" data-page-step="-1" aria-label="上一幅原页"${disabled(page === 0)}>‹</button><select data-page-select aria-label="选择原站扫描图">${source.pages.map((entry, i) => `<option value="${i}"${i === page ? ' selected' : ''}>${esc(entry.label)}</option>`).join('')}</select><button type="button" data-page-step="1" aria-label="下一幅原页"${disabled(page === source.pages.length - 1)}>›</button></div>` : ''}<button class="scan-button" type="button" data-inspect-image aria-label="${expanded ? '放大或缩回' : '展开'}${esc(source.short)}图像"><img src="${esc(image)}" alt="${esc(source.title)}${source.pages ? `，原站图 ${page + 1}` : ''}" decoding="async"><span class="image-wait">正在从原站展开这一页…</span><span class="image-failure" hidden>原页图像暂未加载<br><small>本地札记和原站出处仍可查看。<br>请勿将札记当作原件全文。</small></span></button><span class="scan-caption">${source.id === 'art' ? '当代意象 · 非历史影像' : source.map ? '保留原图边款 · 后期修订图' : '真实原页 · 原站远程阅览'}　${expanded ? '点击图像切换放大' : '点击展开阅览'}</span></div>` : '';
  const quotation = source.quote ? `<span class="quote-label">原信转引 · 排印摘句</span><blockquote class="letter-quote">${esc(source.quote)}</blockquote>` : '';
  const notePages=[...(quotation?[quotation]:[]),`<p class="material-intro">${esc(source.intro)}</p>`,...source.facts.map(([title,text])=>`<dl class="source-facts"><dt>${esc(title)}</dt><dd>${esc(text)}</dd></dl>`),boundary(source)];
  const notePage=Math.max(0,Math.min(ui.notePage??0,notePages.length-1));
  const notes = `<div class="source-note-page">${notePages[notePage]}</div><nav class="note-navigation" aria-label="资料札记翻页"><button type="button" data-note-step="-1"${disabled(notePage===0)}>← 上一段</button><span>札记 ${notePage+1} / ${notePages.length}</span><button type="button" data-note-step="1"${disabled(notePage===notePages.length-1)}>下一段 →</button></nav>`;
  const provenance = `<p class="material-credit">${esc(source.credit)}</p><div class="source-links">${source.links.map(link => `<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join('') || '<p>此项为本项目创作说明，无历史原件链接。</p>'}</div>${boundary(source)}<p class="rights-note">使用说明：${esc(source.rights)}</p>`;
  return `<article class="material-card" data-material-id="${source.id}" data-context="${context}"><div class="material-heading"><p class="source-number">${source.number} / ${esc(source.kind)}</p>${expanded?'':`<h3>${esc(source.title)}</h3>`}<p class="material-date">${esc(source.date)} · ${esc(source.era)}</p><p class="material-credit">${esc(source.credit)}</p></div><div class="mini-tabs" role="tablist" aria-label="${esc(source.short)}阅读方式">${[...(image ? [['image', '原页']] : []), ['notes', '阅读札记'], ['source', '出处与边界']].map(([id, label]) => `<button type="button" role="tab" aria-selected="${tab === id}" aria-controls="material-panel-${context}" tabindex="${tab === id ? 0 : -1}" data-material-tab="${id}">${label}</button>`).join('')}</div><div class="source-body${tab === 'image' ? ' original-body' : ''}" role="tabpanel" id="material-panel-${context}">${tab === 'image' ? scan + (expanded ? '<aside class="reader-side-note"><button type="button" class="ink-link" data-material-tab="notes">逐段读札记、原文身份与支持边界 →</button></aside>' : '') : tab === 'notes' ? notes : provenance}</div><div class="material-actions"><button class="text-button" type="button" data-bookmark="${source.id}">${bookmarked ? '已收藏 · 取消收藏' : '收入资料收藏'}</button>${!expanded ? `<button class="text-button" type="button" data-source="${source.id}">展开阅览 ↗</button>` : ''}</div></article>`;
}

