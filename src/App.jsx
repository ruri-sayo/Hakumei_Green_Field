import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'hakumei:h-article-studio';

const blankArticle = {
  id: '',
  title: '',
  slug: '',
  category: 'Essay',
  status: 'draft',
  tags: [],
  markdown: '',
  excerpt: '',
  heroImage: '',
  imageAlt: '',
  updatedAt: '',
};

const starterArticles = [
  {
    id: 'h-local-1',
    title: 'Hakumei Kobo V0 設計メモ',
    slug: 'hakumei-kobo-v0-notes',
    category: 'Development',
    status: 'draft',
    tags: ['hakumei', 'v0'],
    excerpt: 'h-article Studio の初期サンプルです。',
    markdown:
      '# Hakumei Kobo V0 設計メモ\n\n人が書く記事を編集し、画像を添えて静的出力へ渡すための作業台です。\n\n## TODO\n\n- API 接続\n- テンプレート整備\n- 公開前チェック',
    heroImage: '',
    imageAlt: '',
    updatedAt: new Date().toISOString(),
  },
];

const templates = [
  {
    name: 'Review',
    text:
      '\n## 観察\n\n\n## 良かった点\n\n\n## 気になった点\n\n\n## 次に試すこと\n\n',
  },
  {
    name: 'How-to',
    text:
      '\n## 目的\n\n\n## 手順\n\n1. \n2. \n3. \n\n## 確認\n\n',
  },
  {
    name: 'Release Note',
    text:
      '\n## 変更点\n\n- \n\n## 影響範囲\n\n\n## 既知の課題\n\n',
  },
];

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function readLocalArticles() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(saved) && saved.length ? saved : starterArticles;
  } catch {
    return starterArticles;
  }
}

function writeLocalArticles(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

async function loadArticles() {
  try {
    const data = await apiRequest('/api/articles?type=h');
    return { articles: data.items || data.articles || data, source: 'api' };
  } catch {
    return { articles: readLocalArticles(), source: 'local' };
  }
}

async function persistArticle(article, source) {
  const payload = { ...article, type: 'h', updatedAt: new Date().toISOString() };
  if (source === 'api') {
    const method = payload.id ? 'PUT' : 'POST';
    const path = payload.id ? `/api/articles/${encodeURIComponent(payload.id)}` : '/api/articles';
    return apiRequest(path, { method, body: JSON.stringify(payload) });
  }

  const articles = readLocalArticles();
  const id = payload.id || `h-local-${Date.now()}`;
  const saved = { ...payload, id };
  const next = articles.some((item) => item.id === id)
    ? articles.map((item) => (item.id === id ? saved : item))
    : [saved, ...articles];
  writeLocalArticles(next);
  return saved;
}

async function removeArticle(articleId, source) {
  if (source === 'api') {
    await apiRequest(`/api/articles/${encodeURIComponent(articleId)}`, { method: 'DELETE' });
    return;
  }
  writeLocalArticles(readLocalArticles().filter((item) => item.id !== articleId));
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarkdown(markdown) {
  const inline = (value) =>
    escapeHtml(value)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

  const lines = markdown.split('\n');
  const html = [];
  let listOpen = false;

  lines.forEach((line) => {
    if (/^\s*[-*]\s+/.test(line)) {
      if (!listOpen) {
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
      return;
    }
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
    if (/^###\s+/.test(line)) html.push(`<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`);
    else if (/^##\s+/.test(line)) html.push(`<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`);
    else if (/^#\s+/.test(line)) html.push(`<h1>${inline(line.replace(/^#\s+/, ''))}</h1>`);
    else if (line.trim()) html.push(`<p>${inline(line)}</p>`);
  });

  if (listOpen) html.push('</ul>');
  return html.join('');
}

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(blankArticle);
  const [apiSource, setApiSource] = useState('local');
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('Loading articles...');
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadArticles().then(({ articles: loadedArticles, source }) => {
      setArticles(loadedArticles);
      setApiSource(source);
      const first = loadedArticles[0] || { ...blankArticle, id: '' };
      setSelectedId(first.id);
      setDraft(first);
      setMessage(source === 'api' ? 'Connected to /api/articles.' : 'Using local draft storage until the API is available.');
    });
  }, []);

  const filteredArticles = useMemo(() => {
    if (filter === 'all') return articles;
    return articles.filter((article) => article.status === filter);
  }, [articles, filter]);

  const previewHtml = useMemo(() => renderMarkdown(draft.markdown || ''), [draft.markdown]);

  function selectArticle(article) {
    setSelectedId(article.id);
    setDraft({ ...blankArticle, ...article });
  }

  function updateDraft(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value,
      slug: field === 'title' && !current.slug ? slugify(value) : current.slug,
    }));
  }

  function createArticle() {
    const next = {
      ...blankArticle,
      id: '',
      title: 'Untitled h-article',
      slug: '',
      markdown: '# Untitled h-article\n\n',
      updatedAt: new Date().toISOString(),
    };
    setSelectedId('');
    setDraft(next);
    setMessage('New article draft created.');
  }

  async function saveArticle() {
    setBusy(true);
    try {
      const saved = await persistArticle({ ...draft, slug: draft.slug || slugify(draft.title) }, apiSource);
      const normalized = { ...draft, ...saved };
      setArticles((current) => {
        const next = current.some((item) => item.id === normalized.id)
          ? current.map((item) => (item.id === normalized.id ? normalized : item))
          : [normalized, ...current];
        if (apiSource === 'local') writeLocalArticles(next);
        return next;
      });
      setDraft(normalized);
      setSelectedId(normalized.id);
      setMessage('Article saved.');
    } catch (error) {
      setMessage(`Save failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function deleteSelectedArticle() {
    if (!draft.id) {
      createArticle();
      return;
    }
    const confirmed = window.confirm(`Delete "${draft.title || 'Untitled'}"?`);
    if (!confirmed) return;

    setBusy(true);
    try {
      await removeArticle(draft.id, apiSource);
      const next = articles.filter((item) => item.id !== draft.id);
      setArticles(next);
      const fallback = next[0] || { ...blankArticle };
      setDraft(fallback);
      setSelectedId(fallback.id || '');
      setMessage('Article deleted.');
    } catch (error) {
      setMessage(`Delete failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  function insertTemplate(text) {
    const textarea = document.getElementById('markdown-editor');
    const start = textarea?.selectionStart ?? draft.markdown.length;
    const end = textarea?.selectionEnd ?? draft.markdown.length;
    const markdown = `${draft.markdown.slice(0, start)}${text}${draft.markdown.slice(end)}`;
    updateDraft('markdown', markdown);
    requestAnimationFrame(() => textarea?.focus());
  }

  async function uploadImage(file) {
    if (!file) return;
    setBusy(true);
    try {
      if (apiSource === 'api' && draft.id) {
        const body = new FormData();
        body.append('image', file);
        const uploaded = await apiRequest(`/api/articles/${encodeURIComponent(draft.id)}/images`, {
          method: 'POST',
          body,
        });
        updateDraft('heroImage', uploaded.url || uploaded.path || '');
        setMessage('Image uploaded.');
      } else {
        updateDraft('heroImage', URL.createObjectURL(file));
        setMessage('Image attached locally. Save after the API is available to persist it.');
      }
    } catch (error) {
      setMessage(`Image upload failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function exportArticles(scope) {
    setBusy(true);
    try {
      const target = scope === 'single' ? draft.id : 'all';
      if (apiSource === 'api') {
        const result = await apiRequest(`/api/export/articles/${target}`, { method: 'POST' });
        setMessage(typeof result === 'string' ? result : result.message || `Export queued for ${target}.`);
      } else {
        const payload = scope === 'single' ? draft : articles;
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = scope === 'single' ? `${draft.slug || 'h-article'}.json` : 'h-articles.json';
        link.click();
        URL.revokeObjectURL(url);
        setMessage('Local JSON export created.');
      }
    } catch (error) {
      setMessage(`Export failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Hakumei Kobo V0</p>
          <h1>h-article Studio</h1>
        </div>
        <div className="topbar-actions">
          <span className={`connection ${apiSource}`}>{apiSource === 'api' ? 'API' : 'Local'}</span>
          <button onClick={createArticle}>New Article</button>
          <button className="primary" onClick={saveArticle} disabled={busy}>
            Save
          </button>
        </div>
      </header>

      <main className="studio-layout">
        <aside className="article-sidebar">
          <div className="panel-header">
            <h2>Articles</h2>
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="article-list">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                className={`article-row ${selectedId === article.id ? 'active' : ''}`}
                onClick={() => selectArticle(article)}
              >
                <span>{article.title || 'Untitled'}</span>
                <small>
                  {article.status} · {article.category}
                </small>
              </button>
            ))}
          </div>
        </aside>

        <section className="editor-pane">
          <div className="meta-grid">
            <label>
              Title
              <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} />
            </label>
            <label>
              Slug
              <input value={draft.slug} onChange={(event) => updateDraft('slug', slugify(event.target.value))} />
            </label>
            <label>
              Category
              <input value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} />
            </label>
            <label>
              Status
              <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="wide">
              Tags
              <input
                value={draft.tags.join(', ')}
                onChange={(event) =>
                  updateDraft(
                    'tags',
                    event.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="design, devlog, hakumei"
              />
            </label>
            <label className="wide">
              Excerpt
              <input value={draft.excerpt} onChange={(event) => updateDraft('excerpt', event.target.value)} />
            </label>
          </div>

          <div className="toolbar">
            {templates.map((template) => (
              <button key={template.name} onClick={() => insertTemplate(template.text)}>
                Insert {template.name}
              </button>
            ))}
            <button onClick={() => fileInputRef.current?.click()}>Upload Image</button>
            <button className="danger" onClick={deleteSelectedArticle} disabled={busy}>
              Delete
            </button>
            <input
              ref={fileInputRef}
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={(event) => uploadImage(event.target.files?.[0])}
            />
          </div>

          {draft.heroImage && (
            <div className="image-strip">
              <img src={draft.heroImage} alt={draft.imageAlt || draft.title || 'Article image'} />
              <label>
                Image alt text
                <input value={draft.imageAlt} onChange={(event) => updateDraft('imageAlt', event.target.value)} />
              </label>
            </div>
          )}

          <div className="editor-grid">
            <label className="markdown-panel">
              Markdown
              <textarea
                id="markdown-editor"
                value={draft.markdown}
                onChange={(event) => updateDraft('markdown', event.target.value)}
                spellCheck="true"
              />
            </label>
            <section className="preview-panel">
              <div className="preview-label">Preview</div>
              <article dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </section>
          </div>
        </section>

        <aside className="export-pane">
          <h2>Export</h2>
          <p>Build h-article output through `/api/export` when available, or download local JSON while offline.</p>
          <button className="primary" onClick={() => exportArticles('single')} disabled={busy || !draft.title}>
            Export Current
          </button>
          <button onClick={() => exportArticles('all')} disabled={busy || articles.length === 0}>
            Export All
          </button>
          <div className="status-box">{message}</div>
        </aside>
      </main>
    </div>
  );
}

export default App;
