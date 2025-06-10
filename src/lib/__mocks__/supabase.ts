// Mock avanzado de supabase para tests con chaining y datos simulados

// Datos simulados para tablas comunes
type MockData = { [key: string]: any[] };
const mockData: MockData = {
  stories: [
    { id: 1, title: 'Historia 1', user_id: 1 },
    { id: 2, title: 'Historia 2', user_id: 2 }
  ],
  users: [
    { id: 1, username: 'usuario1', avatar_url: 'https://mock.url/avatar1.png' },
    { id: 2, username: 'usuario2', avatar_url: 'https://mock.url/avatar2.png' }
  ],
  notifications: [
    { id: 1, type: 'like', read: false, user_id: 1, created_at: '2024-06-10T12:00:00Z' }
  ],
  posts: [
    {
      id: '1',
      autor_id: '1',
      tipo: 'text',
      contenido: '¡Hola, este es un post de prueba!',
      multimedia_url: [],
      creado_en: '2024-06-10T10:00:00Z',
      comentarios: [],
      reacciones: [],
    },
    {
      id: '2',
      autor_id: '2',
      tipo: 'text',
      contenido: 'Segundo post de ejemplo',
      multimedia_url: [],
      creado_en: '2024-06-10T11:00:00Z',
      comentarios: [],
      reacciones: [],
    }
  ],
  eventos: [
    { id: 1, title: 'Evento de prueba', date: '2024-06-15', user_id: 1 },
    { id: 2, title: 'Segundo evento', date: '2024-06-20', user_id: 2 }
  ],
  // Agrega más tablas simuladas según necesidad
};

function createQueryChain(data: any[] = []) {
  let result = data;
  const chain: any = {
    select: () => chain,
    eq: (col: string, value: any) => {
      result = result.filter((row: any) => row[col] === value);
      return chain;
    },
    in: (col: string, arr: any[]) => {
      result = result.filter((row: any) => arr.includes(row[col]));
      return chain;
    },
    or: () => chain,
    order: () => chain,
    update: () => Promise.resolve({ data: result }),
    insert: () => Promise.resolve({ data: result }),
    single: () => Promise.resolve({ data: result[0] }),
    maybeSingle: () => Promise.resolve({ data: result[0] }),
    // Simula respuesta final
    then: (resolve: any) => Promise.resolve({ data: result }).then(resolve),
    data: result,
    // Métodos de realtime/channel
    subscribe: () => {},
    removeChannel: () => {},
    channel: () => ({ on: () => ({ subscribe: () => {}, removeChannel: () => {} }) })
  };
  return chain;
}

export const supabase = {
  from: (table: string) => createQueryChain(mockData[table] || []),
  storage: {
    from: () => ({ getPublicUrl: () => ({ data: { publicUrl: 'https://mock.url/file' } }) })
  }
};
