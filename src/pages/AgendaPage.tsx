import React, { useEffect, useState } from "react";
import EventoCulturalCard from "../components/cultural/EventoCulturalCard";
import CumpleañosCard from "../components/cultural/CumpleañosCard";
import { TareaCulturalKanban } from "../components/cultural/TareaCulturalKanban";
import { supabase } from "../lib/supabase";
import { Search } from 'lucide-react';

const AgendaPage: React.FC = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [cumpleanos, setCumpleanos] = useState<any[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingCumpleanos, setLoadingCumpleanos] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    // Cargar eventos culturales
    const fetchEventos = async () => {
      setLoadingEventos(true);
      const { data } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha_inicio', { ascending: true });
      setEventos(data || []);
      setLoadingEventos(false);
    };
    fetchEventos();
  }, []);

  useEffect(() => {
    // Cargar próximos cumpleaños (por ejemplo, próximos 30 días)
    const fetchCumpleanos = async () => {
      setLoadingCumpleanos(true);
      const today = new Date();
      const future = new Date();
      future.setDate(today.getDate() + 30);
      const { data } = await supabase
        .from('cumpleanos')
        .select('*')
        .gte('fecha_nacimiento', today.toISOString().slice(0, 10))
        .lte('fecha_nacimiento', future.toISOString().slice(0, 10))
        .order('fecha_nacimiento', { ascending: true });
      setCumpleanos(data || []);
      setLoadingCumpleanos(false);
    };
    fetchCumpleanos();
  }, []);

  // Filtrar eventos por búsqueda y fecha
  // const eventosFiltrados = eventos.filter(event => {
  //   const matchNombre = event.titulo?.toLowerCase().includes(search.toLowerCase());
  //   const matchFecha = filterDate ? format(new Date(event.fecha_inicio), 'yyyy-MM-dd') === filterDate : true;
  //   return matchNombre && matchFecha;
  // });

  // Unificar feed de cumpleaños y eventos
  const feed = [
    ...cumpleanos.map(c => ({
      ...c,
      __type: 'cumple',
      fecha: c.fecha_nacimiento
    })),
    ...eventos.map(e => ({
      ...e,
      __type: 'evento',
      fecha: e.fecha_inicio
    }))
  ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  // Actualiza un cumpleaños editado en el array sin recargar todo
  const handleCumpleEdited = (cumpleActualizado: any) => {
    setCumpleanos(prev => prev.map(c => c.id === cumpleActualizado.id ? { ...c, ...cumpleActualizado } : c));
  };

  // Actualiza un evento editado en el array sin recargar todo
  const handleEventoEdited = (eventoActualizado: any) => {
    setEventos(prev => prev.map(e => e.id === eventoActualizado.id ? { ...e, ...eventoActualizado } : e));
  };

  return (
    <main className="p-4 max-w-3xl mx-auto min-h-screen bg-gradient-to-b from-primary-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <header className="py-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-700 dark:text-primary-300 drop-shadow-sm mb-2">Agenda cultural</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Consulta y programa eventos, cumpleaños y tareas de la comunidad</p>
      </header>
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div className="flex-1 flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-1/2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar evento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-3 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full transition shadow-sm text-base"
              aria-label="Buscar evento"
            />
          </div>
          <div className="relative w-full md:w-1/3">
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="px-3 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full transition shadow-sm text-base"
              aria-label="Filtrar por fecha"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/></svg>
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => window.location.href = '/calendar'}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary-600 text-white font-semibold shadow-lg hover:bg-primary-700 transition focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            aria-label="Programar evento"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 5v14m7-7H5"/></svg>
            Programar
          </button>
        </div>
      </div>
      <section aria-labelledby="feed" className="mb-12">
        <h2 id="feed" className="text-2xl font-bold mb-6 text-primary-700 dark:text-primary-300">Próximos eventos y cumpleaños</h2>
        {loadingEventos || loadingCumpleanos ? (
          <div className="text-center text-lg text-gray-500 py-8">Cargando...</div>
        ) : feed.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No hay eventos ni cumpleaños próximos.</div>
        ) : (
          <div className="space-y-6">
            {feed.map(item =>
              item.__type === 'cumple' ? (
                <div className="shadow-lg rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-0" key={item.id}>
                  <CumpleañosCard
                    birthday={item}
                    onDeleted={() => setCumpleanos(prev => prev.filter(c => c.id !== item.id))}
                    onEdit={handleCumpleEdited}
                  />
                </div>
              ) : (
                <div className="shadow-lg rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-0" key={item.id}>
                  <EventoCulturalCard
                    event={item}
                    onDeleted={() => setEventos(prev => prev.filter(e => e.id !== item.id))}
                    onEdit={() => handleEventoEdited(item)}
                  />
                </div>
              )
            )}
          </div>
        )}
      </section>
      <section aria-labelledby="tareas" className="mb-8">
        <h2 id="tareas" className="text-2xl font-bold mb-6 text-primary-700 dark:text-primary-300">Tareas</h2>
        <div className="shadow-lg rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
          <TareaCulturalKanban />
        </div>
      </section>
    </main>
  );
};

export default AgendaPage;