import { useCallback, useEffect, useState } from 'react';
import { deleteCookie, getCookie, setCookie } from '../utils/cookies';
import SelectorTema from './SelectorTema.jsx';

// cookieStore da los atributos (Expires, Secure, SameSite); document.cookie solo nombre=valor.
async function leerCookies() {
  if (window.cookieStore) {
    return (await window.cookieStore.getAll()).map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain ?? location.hostname,
      path: c.path,
      expires: c.expires ? new Date(c.expires).toUTCString() : 'Session',
      size: c.name.length + c.value.length,
      secure: c.secure,
      sameSite: c.sameSite,
    }));
  }
  return document.cookie
    .split('; ')
    .filter(Boolean)
    .map((p) => {
      const [name, ...v] = p.split('=');
      const value = v.join('=');
      return { name, value, domain: location.hostname, path: '/', expires: '?', size: name.length + value.length, secure: '?', sameSite: '?' };
    });
}

function TablaCookies({ cookies }) {
  return (
    <table>
      <thead>
        <tr>
          {['Name', 'Value', 'Domain', 'Path', 'Expires', 'Size', 'HttpOnly', 'Secure', 'SameSite'].map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cookies.map((c) => (
          <tr key={c.name}>
            <td>{c.name}</td>
            <td>{c.value}</td>
            <td>{c.domain}</td>
            <td>{c.path}</td>
            <td>{c.expires}</td>
            <td>{c.size}</td>
            {/* HttpOnly nunca es visible desde JS: una cookie legible por JS no es HttpOnly */}
            <td>No</td>
            <td>{String(c.secure)}</td>
            <td>{c.sameSite}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PracticaEnVivo() {
  const [cookies, setCookies] = useState([]);
  const [logB, setLogB] = useState([]);
  const [storage, setStorage] = useState([]);

  const refrescar = useCallback(async () => {
    setCookies(await leerCookies());
    setStorage(Object.keys(localStorage).map((k) => ({ clave: k, longitud: localStorage.getItem(k).length })));
  }, []);

  useEffect(() => {
    // Una cookie de sesión y una con fecha fija para el ejercicio A.
    setCookie('sesionDemo', 'abc123');
    setCookie('visitas', String(Number(getCookie('visitas') ?? 0) + 1), 7);
    refrescar();
  }, [refrescar]);

  const ejecutarB = () => {
    const salida = [];
    document.cookie = 'tema=oscuro; path=/; max-age=3600';
    salida.push(['document.cookie = "tema=oscuro; path=/; max-age=3600"', '(crea la cookie)']);
    salida.push(['console.log(document.cookie)', document.cookie]);
    document.cookie = 'tema=; path=/; max-age=0';
    salida.push(['document.cookie = "tema=; path=/; max-age=0"', '(borra la cookie)']);
    salida.push(['console.log(document.cookie)', document.cookie]);
    setLogB(salida);
    refrescar();
  };

  return (
    <section>
      <hr />
      <h2>Práctica en vivo</h2>

      <h3>Ejercicio A — Cookies reales de esta página</h3>
      <button onClick={refrescar}>Actualizar</button>
      <TablaCookies cookies={cookies} />
      <p>
        <code>sesionDemo</code> tiene <code>Expires = Session</code>; <code>visitas</code> tiene fecha fija (7 días).
        Ninguna es <code>HttpOnly</code>, por eso ambas aparecen en <code>document.cookie</code>:
      </p>
      <pre>{document.cookie || '(vacío)'}</pre>

      <h3>Ejercicio B — Crear, leer y borrar con JavaScript</h3>
      <button onClick={ejecutarB}>Ejecutar las 4 líneas</button>
      {logB.length > 0 && (
        <pre>{logB.map(([codigo, res]) => `${codigo}\n  → ${res || '(cadena vacía)'}`).join('\n')}</pre>
      )}

      <h3>Ejercicio C — Selector de tema (persiste al recargar)</h3>
      <SelectorTema />
      <p>
        Cookie actual: <code>tema={getCookie('tema') ?? 'null'}</code>. Recarga la página y se mantiene.
      </p>
      <button onClick={() => { deleteCookie('tema'); refrescar(); }}>deleteCookie("tema")</button>

      <h3>Ejercicio E — Auditoría de esta página</h3>
      <p>Claves en Local Storage ({storage.length}):</p>
      <pre>
        {storage.length
          ? storage.map((s) => `${s.clave} (${s.longitud} caracteres)`).join('\n')
          : 'Ninguna. Esta página no usa Supabase; en el proyecto real aparecería sb-<ref>-auth-token.'}
      </pre>
    </section>
  );
}
