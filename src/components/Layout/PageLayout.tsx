import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  showBack?: boolean;
  showBeachSelector?: boolean;
}

export default function PageLayout({
  title,
  children,
  showBack = false,
  showBeachSelector = true,
}: PageLayoutProps) {
  const { recalculateTideData, tideData } = useAppStore();

  useEffect(() => {
    if (!tideData) {
      recalculateTideData();
    }
  }, [recalculateTideData, tideData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2463] via-[#0E3A8C] to-[#0A1628]">
      <TopBar title={title} showBack={showBack} showBeachSelector={showBeachSelector} />
      <main className="pt-14 pb-20 px-4 max-w-lg mx-auto">
        <div className="animate-fadeIn">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
