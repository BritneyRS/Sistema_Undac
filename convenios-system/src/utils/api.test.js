import { conveniosAPI } from './api';

describe('conveniosAPI', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  test('envía un archivo adjunto en FormData al crear un convenio', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    global.fetch = mockFetch;

    const archivo = new File(['contenido'], 'documento.pdf', { type: 'application/pdf' });

    await conveniosAPI.crear({ nombre: 'Convenio prueba' }, archivo);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.body instanceof FormData).toBe(true);
    expect(options.body.get('nombre')).toBe('Convenio prueba');
    expect(options.body.get('documento')).toBe(archivo);
  });
});
