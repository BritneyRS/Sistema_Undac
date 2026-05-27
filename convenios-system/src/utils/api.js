
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...options,
  };

  const res = await fetch(BASE_URL + endpoint, config);

  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem('token');
    // Sólo recargar la página si ya existía un token (sesión expirada).
    if (token) window.location.reload();
    // Lanzar un error para que el llamador lo maneje en su catch.
    throw new Error(data?.error || 'No autorizado');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Error en la petición');
  }

  return data;
}

// Auth
export const authAPI = {
  login: (usuario, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password }),
    }),
  me: () => request('/auth/me'),
};

// Convenios
export const conveniosAPI = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.ambito && filtros.ambito !== 'todos') params.set('ambito', filtros.ambito);
    if (filtros.busqueda) params.set('busqueda', filtros.busqueda);
    const qs = params.toString();
    return request('/convenios' + (qs ? '?' + qs : ''));
  },
  obtener:    (id)        => request('/convenios/' + id),
  crear:      (datos)     => request('/convenios',       { method: 'POST',   body: JSON.stringify(datos) }),
  actualizar: (id, datos) => request('/convenios/' + id, { method: 'PUT',    body: JSON.stringify(datos) }),
  eliminar:   (id)        => request('/convenios/' + id, { method: 'DELETE' }),
};
// Movilidades
export const movilidadAPI = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    
    // Filtros opcionales para el backend (dirección y búsqueda)
    if (filtros.direccion && filtros.direccion !== 'todos') {
      params.set('direccion', filtros.direccion);
    }
    if (filtros.busqueda) {
      params.set('busqueda', filtros.busqueda);
    }
    
    const qs = params.toString();
    return request('/movilidades' + (qs ? '?' + qs : ''));
  },
  obtener:    (id)        => request('/movilidades/' + id),
  crear:      (datos)     => request('/movilidades',       { method: 'POST',   body: JSON.stringify(datos) }),
  actualizar: (id, datos) => request('/movilidades/' + id, { method: 'PUT',    body: JSON.stringify(datos) }),
  eliminar:   (id)        => request('/movilidades/' + id, { method: 'DELETE' }),
};

