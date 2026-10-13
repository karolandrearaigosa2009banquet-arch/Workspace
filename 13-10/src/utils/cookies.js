/**
 * Crea o actualiza una cookie.
 * @param {string} nombre - Nombre de la cookie.
 * @param {string} valor - Valor (se codifica con encodeURIComponent).
 * @param {number} [diasExpiracion] - Días de vida (Max-Age/Expires). Sin valor: cookie de sesión.
 * @param {Object} [opciones]
 * @param {string} [opciones.path="/"] - Atributo Path.
 * @param {string} [opciones.domain] - Atributo Domain.
 * @param {boolean} [opciones.secure=false] - Atributo Secure (solo HTTPS).
 * @param {"Strict"|"Lax"|"None"} [opciones.sameSite="Lax"] - Atributo SameSite ("None" exige secure).
 */
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

/**
 * Lee una cookie por nombre.
 * @param {string} nombre
 * @returns {string|null} El valor decodificado, o null si no existe.
 */
export function getCookie(nombre) {
  const buscado = `${encodeURIComponent(nombre)}=`;
  for (const parte of document.cookie.split("; ")) {
    if (parte.startsWith(buscado)) {
      return decodeURIComponent(parte.slice(buscado.length));
    }
  }
  return null;
}

/**
 * Borra una cookie reutilizando setCookie con expiración en el pasado.
 * Debe recibir el mismo path/domain con el que fue creada.
 * @param {string} nombre
 * @param {Object} [opciones] - Mismas opciones que setCookie (path, domain).
 */
export function deleteCookie(nombre, opciones = {}) {
  setCookie(nombre, "", -1, opciones);
}
