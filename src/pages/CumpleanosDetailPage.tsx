import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import { supabase } from '../lib/supabase';
import CumpleañosCard from '../components/cultural/CumpleañosCard';

const CumpleanosDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [birthday, setBirthday] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      (async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('cumpleanos')
          .select('*')
          .eq('id', id)
          .single();
        if (data && !error) {
          setBirthday(data);
        } else {
          setBirthday(null);
        }
        setLoading(false);
      })();
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!birthday) return <NotFoundPage />;

  return (
    <main className="max-w-xl mx-auto p-4">
      <button onClick={() => navigate('/')} className="text-primary-600 dark:text-primary-400 hover:underline mb-4">← Volver a inicio</button>
      <CumpleañosCard birthday={birthday} disableCardNavigation onDeleted={() => navigate('/agenda')} />
    </main>
  );
};

export default CumpleanosDetailPage;
