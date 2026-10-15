const BLOCK_TAGS = new Set([
  'p',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'section',
  'article',
  'header',
  'footer',
  'blockquote',
  'pre',
  'table',
  'thead',
  'tbody',
  'tr',
  'td',
  'th',
]);

const LIST_TAGS = new Set(['ul', 'ol']);

/** Render <ul>/<ol> menjadi baris ber-marker, mendukung list bersarang. */
function renderList(list: Element, out: string[], depth: number): void {
  const ordered = list.tagName.toLowerCase() === 'ol';
  const indent = '  '.repeat(depth);
  let index = 1;

  Array.from(list.children).forEach((child) => {
    if (child.tagName.toLowerCase() !== 'li') return;

    const marker = ordered ? `${index}. ` : '- ';
    const inner: string[] = [];
    renderChildren(child, inner, depth + 1);

    if (inner.length === 0) {
      const text = (child.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) out.push(`${indent}${marker}${text}`);
    } else {
      out.push(`${indent}${marker}${inner[0]}`);
      for (let i = 1; i < inner.length; i += 1) {
        out.push(inner[i]);
      }
    }

    index += 1;
  });
}

/**
 * Traversal berurutan: teks inline digabung dalam satu baris, lalu di-flush
 * saat bertemu blok/list/`<br>`. Ini menjaga teks campuran (mis. paragraf
 * berisi <br> atau heading + list) tidak hilang.
 */
function renderChildren(parent: Node, out: string[], depth: number): void {
  let buffer = '';

  const flush = () => {
    const text = buffer.replace(/\s+/g, ' ').trim();
    if (text) out.push(text);
    buffer = '';
  };

  Array.from(parent.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      buffer += node.textContent || '';
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === 'br') {
      flush();
      return;
    }

    if (LIST_TAGS.has(tag)) {
      flush();
      renderList(el, out, depth);
      return;
    }

    if (tag === 'li') {
      flush();
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) out.push(`- ${text}`);
      return;
    }

    if (BLOCK_TAGS.has(tag)) {
      flush();
      renderChildren(el, out, depth);
      return;
    }

    // Inline (strong, em, a, span, ...) → tetap satu baris
    buffer += el.textContent || '';
  });

  flush();
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Ambil teks dari clipboard dengan mempertahankan bullet.
 *
 * Bullet di Word/Google Docs/ChatGPT adalah *formatting* (bukan karakter),
 * sehingga saat paste ke <textarea> browser membuangnya. Fungsi ini membaca
 * text/html dan mengubah <li> menjadi "- " (atau "1. " untuk ordered list)
 * agar bullet tetap ada.
 */
export function pasteToPlainText(clipboardData: DataTransfer | null): string {
  if (!clipboardData) return '';

  const html = clipboardData.getData('text/html');
  if (html && /<li[\s>]/i.test(html)) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const lines: string[] = [];
    renderChildren(doc.body, lines, 0);
    const text = normalizeText(lines.join('\n'));
    if (text) return text;
  }

  return normalizeText(clipboardData.getData('text/plain') || '');
}
