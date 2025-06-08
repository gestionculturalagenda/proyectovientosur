import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import { supabase } from '../lib/supabase';
import EventoCulturalCard from '../components/cultural/EventoCulturalCard';

const CulturalEventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      (async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('id', id)
          .single();
        if (data && !error) {
          setEvent(data);
        } else {
          setEvent(null);
        }
        setLoading(false);
      })();
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!event) return <NotFoundPage />;

  return (
    <div className="max-w-xl mx-auto p-4">
      <button onClick={() => navigate('/')} className="text-primary-600 dark:text-primary-400 hover:underline mb-4">← Volver a inicio</button>
      <EventoCulturalCard event={event} disableCardNavigation onDeleted={() => navigate('/agenda')} />
    </div>
  );
};

export default CulturalEventDetailPage;
