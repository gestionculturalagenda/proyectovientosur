import { HiOutlineUsers, HiOutlineHashtag, HiOutlineCalendar } from 'react-icons/hi';
import { useState } from 'react';
import { ConversationsList } from '../messages/ConversationsList';

const onlineUsers = [
	{ name: 'Lucía', avatar: 'https://i.pravatar.cc/44' },
	{ name: 'Pedro', avatar: 'https://i.pravatar.cc/45' },
	{ name: 'Sofía', avatar: 'https://i.pravatar.cc/46' },
];

const events = [
	{ title: 'Taller de escritura', date: '10 Jun, 18:00' },
	{ title: 'Fiesta de bienvenida', date: '12 Jun, 21:00' },
];

const trends = ['#cultura', '#eventos', '#comunidad', '#tendencias'];

const RightSidebar: React.FC = () => {
	// Estado para mostrar el modal de conversaciones
	const [showConversations, setShowConversations] = useState(false);
	// Handler para seleccionar usuario (puedes personalizar la acción)
	const handleSelectUser = (userId: string, userName: string, userAvatar: string) => {
		// Aquí puedes manejar la selección de usuario/conversación
		setShowConversations(false);
	};

	return (
		<div className="flex flex-col h-full p-4 gap-6 bg-white relative">
			{/* Usuarios en línea */}
			<div className="rounded-lg shadow-md p-4 bg-white">
				<div className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
					<HiOutlineUsers /> Usuarios en línea
				</div>
				<div className="flex -space-x-2 mb-1">
					{onlineUsers.map((u, i) => (
						<img
							key={i}
							src={u.avatar}
							alt={u.name}
							className="w-8 h-8 rounded-full border-2 border-white"
						/>
					))}
				</div>
				<div className="text-xs text-gray-500">
					{onlineUsers.length} conectados
				</div>
			</div>
			{/* Eventos próximos */}
			<div className="rounded-lg shadow-md p-4 bg-white">
				<div className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
					<HiOutlineCalendar /> Eventos próximos
				</div>
				<ul className="text-sm text-gray-600 space-y-1">
					{events.map((e, i) => (
						<li key={i} className="flex justify-between">
							<span>{e.title}</span>
							<span className="text-xs text-gray-400">{e.date}</span>
						</li>
					))}
				</ul>
			</div>
			{/* Tendencias */}
			<div className="rounded-lg shadow-md p-4 bg-white">
				<div className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
					<HiOutlineHashtag /> Tendencias
				</div>
				<div className="flex flex-wrap gap-2">
					{trends.map((t, i) => (
						<span
							key={i}
							className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
						>
							{t}
						</span>
					))}
				</div>
			</div>
			{/* Botón para abrir el modal de conversaciones */}
			<button
				className="mt-2 px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition text-sm"
				onClick={() => setShowConversations(true)}
			>
				Mensajes
			</button>
			{/* Modal de conversaciones flotante */}
			{showConversations && (
				<div className="fixed inset-0 z-50 flex items-start justify-end pointer-events-none">
					<div
						className="absolute inset-0 bg-black bg-opacity-40 pointer-events-auto"
						onClick={() => setShowConversations(false)}
					/>
					<aside className="relative mt-8 mr-8 w-[min(22rem,90vw)] max-w-full h-[80vh] bg-white shadow-2xl rounded-xl z-50 flex flex-col pointer-events-auto animate-fade-in" style={{ minWidth: '18rem' }}>
						<ConversationsList onSelectUser={handleSelectUser} />
					</aside>
				</div>
			)}
		</div>
	);
};

export default RightSidebar;
