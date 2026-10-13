import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import docs from '../docs/cookies.md?raw';
import SelectorTema from './components/SelectorTema.jsx';

// Cada "## " del documento es una página del índice.
function dividirSecciones(md) {
  return md
    .split(/^(?=## )/m)
    .filter((s) => s.startsWith('## '))
    .map((s, i) => ({ id: i, titulo: s.split('\n')[0].replace('## ', ''), contenido: s }));
}

export default function App() {
  const secciones = useMemo(() => dividirSecciones(docs), []);
  const [actual, setActual] = useState(0);

  return (
    <div className="layout">
      <aside className="indice">
        <h1>Taller de Cookies</h1>
        <SelectorTema />
        <nav>
          {secciones.map((s) => (
            <button
              key={s.id}
              className={s.id === actual ? 'activo' : ''}
              onClick={() => setActual(s.id)}
            >
              {s.titulo}
            </button>
          ))}
        </nav>
      </aside>
      <main className="contenido">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{secciones[actual].contenido}</ReactMarkdown>
      </main>
    </div>
  );
}
