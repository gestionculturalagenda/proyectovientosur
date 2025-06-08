import React, { useState, useEffect } from 'react';
import { Radio, Users, Heart, MessageCircle, Share2, Play, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

interface Stream {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  thumbnail: string;
  description: string;
  viewers: number;
  status: 'live' | 'scheduled' | 'ended';
  scheduledFor?: string;
  likes: number;
  category: string;
  tags: string[];
}

const sampleStreams: Stream[] = [
  {
    id: '1',
    title: 'Taller de pintura en vivo: Técnicas de acuarela',
    hostId: '1',
    hostName: 'María González',
    hostAvatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
    thumbnail: 'https://images.pexels.com/photos/312839/pexels-photo-312839.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Aprende técnicas básicas y avanzadas de acuarela con una artista profesional.',
    viewers: 128,
    status: 'live',
    likes: 45,
    category: 'Arte Visual',
    tags: ['pintura', 'acuarela', 'taller']
  },
  {
    id: '2',
    title: 'Concierto acústico: Sonidos del Sur',
    hostId: '2',
    hostName: 'Carlos Moreno',
    hostAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    thumbnail: 'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Música tradicional con instrumentos autóctonos en un formato íntimo.',
    viewers: 89,
    status: 'live',
    likes: 38,
    category: 'Música',
    tags: ['acústico', 'folklore', 'concierto']
  },
  {
    id: '3',
    title: 'Conversatorio: El futuro de los espacios culturales',
    hostId: '3',
    hostName: 'Laura Díaz',
    hostAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    thumbnail: 'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Panel de discusión con gestores culturales sobre nuevos modelos de gestión.',
    viewers: 0,
    status: 'scheduled',
    scheduledFor: '2025-05-25T18:00:00Z',
    likes: 12,
    category: 'Conversatorio',
    tags: ['gestión cultural', 'debate', 'futuro']
  }
];

const StreamsPage: React.FC = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  useEffect(() => {
    // Simular carga de transmisiones
    const loadStreams = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStreams(sampleStreams);
      setIsLoading(false);
    };
    
    loadStreams();
  }, []);
  
  const categories = ['Todos', 'Arte Visual', 'Música', 'Danza', 'Teatro', 'Conversatorio'];
  
  const liveStreams = streams.filter(stream => stream.status === 'live');
  const scheduledStreams = streams.filter(stream => stream.status === 'scheduled');
  
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner message="Cargando transmisiones..." />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="flex overflow-x-auto py-2 hide-scrollbar">
        <div className="flex space-x-2">
          {categories.map(category => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                activeCategory === category 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Live Now Section */}
      {liveStreams.length > 0 && (
        <div>
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">En vivo ahora</h2>
          </div>
          
          <div className="space-y-4">
            {liveStreams
              .filter(stream => activeCategory === 'Todos' || stream.category === activeCategory)
              .map(stream => (
                <Link key={stream.id} to={`/streams/${stream.id}`}>
                  <motion.div 
                    className="card p-0 overflow-hidden"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <img 
                        src={stream.thumbnail} 
                        alt={stream.title} 
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded flex items-center">
                        <Radio className="h-3 w-3 mr-1" />
                        EN VIVO
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {stream.viewers}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex mb-2">
                        <div className="avatar h-10 w-10 mr-3">
                          <img 
                            src={stream.hostAvatar} 
                            alt={stream.hostName} 
                            className="avatar-img"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                            {stream.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stream.hostName}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {stream.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full px-3 py-1">
                          {stream.category}
                        </div>
                        
                        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                          <div className="flex items-center text-xs">
                            <Heart className="h-3 w-3 mr-1" />
                            <span>{stream.likes}</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <Share2 className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
          </div>
        </div>
      )}
      
      {/* Scheduled Streams */}
      {scheduledStreams.length > 0 && (
        <div>
          <div className="flex items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Próximas transmisiones</h2>
          </div>
          
          <div className="space-y-3">
            {scheduledStreams
              .filter(stream => activeCategory === 'Todos' || stream.category === activeCategory)
              .map(stream => (
                <motion.div
                  key={stream.id}
                  className="card"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start">
                    <div className="relative min-w-[120px] h-[80px] rounded-lg overflow-hidden mr-3">
                      <img 
                        src={stream.thumbnail} 
                        alt={stream.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Play className="h-10 w-10 text-white opacity-80" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">
                        {stream.title}
                      </h3>
                      <div className="flex items-center mb-1">
                        <div className="avatar h-5 w-5 mr-2">
                          <img 
                            src={stream.hostAvatar} 
                            alt={stream.hostName} 
                            className="avatar-img"
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {stream.hostName}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-xs text-primary-600 dark:text-primary-400">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>
                          {stream.scheduledFor ? 
                            new Date(stream.scheduledFor).toLocaleString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Próximamente'}
                        </span>
                      </div>
                    </div>
                    
                    <button className="btn btn-ghost text-xs px-2 py-1">
                      Recordar
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}
      
      {/* Create Stream Button */}
      <div className="fixed bottom-20 right-4">
        <Link to="/streams/new">
          <motion.button
            className="btn btn-primary rounded-full p-3 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Radio className="h-5 w-5" />
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

export default StreamsPage;