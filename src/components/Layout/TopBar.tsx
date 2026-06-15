import { ChevronLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useState } from 'react';
import BeachSelectorModal from './BeachSelectorModal';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  showBeachSelector?: boolean;
}

export default function TopBar({ title, showBack = false, showBeachSelector = true }: TopBarProps) {
  const navigate = useNavigate();
  const { currentBeachId, beaches } = useAppStore();
  const [showBeachModal, setShowBeachModal] = useState(false);
  const currentBeach = beaches.find((b) => b.id === currentBeachId);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-b from-[#0A2463] to-[#0A2463]/95 backdrop-blur-sm z-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 text-white/80 hover:text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-lg font-bold text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {showBeachSelector && (
              <button
                onClick={() => setShowBeachModal(true)}
                className="px-3 py-1.5 bg-[#3E92CC]/20 text-white text-sm rounded-lg border border-[#3E92CC]/30 hover:bg-[#3E92CC]/30 transition-all"
              >
                {currentBeach?.name || '选择海滩'}
              </button>
            )}
            <button className="p-2 text-white/80 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>
      {showBeachModal && (
        <BeachSelectorModal onClose={() => setShowBeachModal(false)} />
      )}
    </>
  );
}
