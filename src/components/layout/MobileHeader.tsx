import { HiOutlineMenu, HiOutlineDotsHorizontal } from 'react-icons/hi';

interface MobileHeaderProps {
  onOpenLeft: () => void;
  onOpenRight: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenLeft, onOpenRight }) => {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white shadow-md flex items-center justify-between px-4 py-2">
      <button onClick={onOpenLeft} className="p-2 rounded-full hover:bg-blue-50">
        <HiOutlineMenu size={26} className="text-blue-600" />
      </button>
      <span className="font-bold text-lg text-blue-600">VientoSur</span>
      <button onClick={onOpenRight} className="p-2 rounded-full hover:bg-blue-50">
        <HiOutlineDotsHorizontal size={26} className="text-blue-600" />
      </button>
    </header>
  );
};

export default MobileHeader;
