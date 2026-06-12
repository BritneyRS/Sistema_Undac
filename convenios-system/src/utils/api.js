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
    if (token) window.location.reload();
    throw new Error(data?.error || 'No autorizado');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Error en la petición');
  }

  return data;
}

// ── Request para FormData (subida de archivos) ──────────────
async function requestFormData(endpoint, method, datos, archivo) {
  const token = getToken();

  const formData = new FormData();

  // Agregar todos los campos de texto
  Object.entries(datos).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  // Agregar archivo si existe
  if (archivo) {
    formData.append('documento', archivo);
  }

  const res = await fetch(BASE_URL + endpoint, {
    method,
    headers: {
      // NO poner Content-Type aquí — el browser lo pone automáticamente con el boundary correcto
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: formData,
  });

  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem('token');
    if (token) window.location.reload();
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
export const movilidadesAPI = {

  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.semestre && filtros.semestre !== 'todos') params.set('semestre', filtros.semestre);
    if (filtros.escuela && filtros.escuela !== 'todos') params.set('escuela', filtros.escuela);
    if (filtros.busqueda) params.set('busqueda', filtros.busqueda);
    const qs = params.toString();
    return request('/movilidades' + (qs ? '?' + qs : ''));
  },

  obtener: (id) => request('/movilidades/' + id),

  // Crear acepta un objeto de datos y opcionalmente un File
  crear: (datos, archivo = null) =>
    requestFormData('/movilidades', 'POST', datos, archivo),

  // Actualizar acepta un objeto de datos y opcionalmente un File
  actualizar: (id, datos, archivo = null) =>
    requestFormData('/movilidades/' + id, 'PUT', datos, archivo),

  eliminar: (id) => request('/movilidades/' + id, { method: 'DELETE' }),

  descargarDocumento: async (id, nombreArchivo) => {
    const token = getToken();
    const res = await fetch(BASE_URL + `/movilidades/${id}/documento`, {
      headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'Error al descargar el documento');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo || 'documento';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // URL para descargar el documento adjunto de una movilidad
  urlDocumento: (id) => `${BASE_URL}/movilidades/${id}/documento`,
};