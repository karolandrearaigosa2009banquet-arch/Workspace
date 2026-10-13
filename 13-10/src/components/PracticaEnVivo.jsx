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

const HTML_ATAQUE = `<form action="https://sitio-victima.com/api/transferir-dinero" method="POST" id="f">
  <input type="hidden" name="destino" value="cuenta-del-atacante">
  <input type="hidden" name="monto" value="1000">
</form>
<script>document.getElementById("f").submit();</script>`;

// Simulación 100 % local: no se envía ninguna petición real.
function simularCsrf(sameSite) {
  const cookieViaja = sameSite === 'None'; // POST cross-site: Lax y Strict no la envían
  return {
    cookieViaja,
    exito: cookieViaja,
    texto: cookieViaja
      ? 'El navegador adjunta la cookie de sesión. El servidor cree que la víctima pidió la transferencia: ATAQUE EXITOSO.'
      : `Con SameSite=${sameSite} el navegador NO adjunta la cookie en un POST cross-site. El servidor responde 401: ATAQUE BLOQUEADO.`,
  };
}

export default function PracticaEnVivo() {
  const [cookies, setCookies] = useState([]);
  const [logB, setLogB] = useState([]);
  const [storage, setStorage] = useState([]);
  const [sameSite, setSameSite] = useState('None');
  const [resultadoD, setResultadoD] = useState(null);

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
      <h2 className="titulo-practica">Práctica en vivo</h2>

      <div className="tarjeta">
      <h3>Ejercicio A — Cookies reales de esta página</h3>
      <button onClick={refrescar}>Actualizar</button>
      <div className="tabla-scroll"><TablaCookies cookies={cookies} /></div>
      <p>
        <code>sesionDemo</code> tiene <code>Expires = Session</code>; <code>visitas</code> tiene fecha fija (7 días).
        Ninguna es <code>HttpOnly</code>, por eso ambas aparecen en <code>document.cookie</code>:
      </p>
      <pre>{document.cookie || '(vacío)'}</pre>

      </div>
      <div className="tarjeta">
      <h3>Ejercicio B — Crear, leer y borrar con JavaScript</h3>
      <button onClick={ejecutarB}>Ejecutar las 4 líneas</button>
      {logB.length > 0 && (
        <pre>{logB.map(([codigo, res]) => `${codigo}\n  → ${res || '(cadena vacía)'}`).join('\n')}</pre>
      )}

      </div>
      <div className="tarjeta">
      <h3>Ejercicio C — Selector de tema (persiste al recargar)</h3>
      <SelectorTema />
      <p>
        Cookie actual: <code>tema={getCookie('tema') ?? 'null'}</code>. Recarga la página y se mantiene.
      </p>
      <button onClick={() => { deleteCookie('tema'); refrescar(); }}>deleteCookie("tema")</button>

      </div>
      <div className="tarjeta">
      <h3>Ejercicio D — Simulación de CSRF (local, sin peticiones reales)</h3>
      <p>HTML hipotético del sitio malicioso (solo se muestra, no se ejecuta):</p>
      <pre>{HTML_ATAQUE}</pre>
      <label>
        Cookie de sesión de la víctima con{' '}
        <select value={sameSite} onChange={(e) => { setSameSite(e.target.value); setResultadoD(null); }}>
          <option value="None">SameSite=None (o sin protección)</option>
          <option value="Lax">SameSite=Lax</option>
          <option value="Strict">SameSite=Strict</option>
        </select>
      </label>{' '}
      <button onClick={() => setResultadoD(simularCsrf(sameSite))}>Simular ataque</button>
      {resultadoD && (
        <pre className={resultadoD.exito ? 'peligro' : 'seguro'}>
          {`POST /api/transferir-dinero (origen: sitio-malicioso.com)\nCookie enviada: ${resultadoD.cookieViaja ? 'sí' : 'no'}\n→ ${resultadoD.texto}`}
        </pre>
      )}

      </div>
      <div className="tarjeta">
      <h3>Ejercicio E — Auditoría de esta página</h3>
      <p>Claves en Local Storage ({storage.length}):</p>
      <pre>
        {storage.length
          ? storage.map((s) => `${s.clave} (${s.longitud} caracteres)`).join('\n')
          : 'Ninguna. Esta página no usa Supabase; en el proyecto real aparecería sb-<ref>-auth-token.'}
      </pre>
      </div>
    </section>
  );
}
