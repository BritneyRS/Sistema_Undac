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
async function requestFormData(endpoint, method, datos, archivo1 = null, archivo2 = null) {
  const token = getToken();

  const formData = new FormData();

  // Agregar todos los campos de texto
  Object.entries(datos).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  // Agregar archivos si existen
  if (archivo1) {
    formData.append('documento1', archivo1);
  }
  if (archivo2) {
    formData.append('documento2', archivo2);
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

async function requestFormDataSingle(endpoint, method, datos, archivo = null) {
  const token = getToken();
  const formData = new FormData();

  Object.entries(datos).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  if (archivo) {
    formData.append('documento', archivo);
  }

  const res = await fetch(BASE_URL + endpoint, {
    method,
    headers: {
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
  crear:      (datos, archivo = null) => requestFormDataSingle('/convenios', 'POST', datos, archivo),
  actualizar: (id, datos, archivo = null, borrarDocumento = false) => {
    const payload = {
      ...datos,
      ...(borrarDocumento ? { borrar_documento: 'true' } : {}),
    };
    return requestFormDataSingle('/convenios/' + id, 'PUT', payload, archivo);
  },
  eliminar:   (id)        => request('/convenios/' + id, { method: 'DELETE' }),
  descargarDocumento: async (id, nombreArchivo) => {
    const token = getToken();
    const res = await fetch(BASE_URL + '/convenios/' + id + '/documento', {
      headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'Error al descargar el documento');
    }

    const blob = await res.blob();
    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = nombreArchivo || 'documento';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlBlob);
  },
  urlDocumento: (id) => BASE_URL + '/convenios/' + id + '/documento',
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
  crear: (datos, archivo1 = null, archivo2 = null) =>
    requestFormData('/movilidades', 'POST', datos, archivo1, archivo2),

  // Actualizar acepta un objeto de datos y opcionalmente dos Files
  actualizar: (id, datos, archivo1 = null, archivo2 = null) =>
    requestFormData('/movilidades/' + id, 'PUT', datos, archivo1, archivo2),

  eliminar: (id) => request('/movilidades/' + id, { method: 'DELETE' }),

  descargarDocumento: async (id, nombreArchivo, indice = 1) => {
    const token = getToken();
    const url = new URL(BASE_URL + `/movilidades/${id}/documento`);
    url.searchParams.set('indice', String(indice));

    const res = await fetch(url.toString(), {
      headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'Error al descargar el documento');
    }

    const blob = await res.blob();
    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = nombreArchivo || 'documento';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlBlob);
  },

  previsualizarDocumento: async (id, indice = 1) => {
    const token = getToken();
    const url = new URL(BASE_URL + `/movilidades/${id}/documento`);
    url.searchParams.set('indice', String(indice));
    url.searchParams.set('preview', 'true');

    const res = await fetch(url.toString(), {
      headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'Error al previsualizar el documento');
    }

    const blob = await res.blob();
    const urlBlob = URL.createObjectURL(blob);
    window.open(urlBlob, '_blank');
    setTimeout(() => URL.revokeObjectURL(urlBlob), 10000);
  },

  // URL para descargar el documento adjunto de una movilidad
  urlDocumento: (id, indice = 1, preview = false) => {
    const url = new URL(BASE_URL + `/movilidades/${id}/documento`);
    url.searchParams.set('indice', String(indice));
    if (preview) url.searchParams.set('preview', 'true');
    return url.toString();
  },
};