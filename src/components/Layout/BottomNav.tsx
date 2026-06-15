import { NavLink } from 'react-router-dom';
import { Waves, Clock, Shield, BookOpen, Map } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/tide', label: '潮汐预报', icon: Waves },
  { to: '/window', label: '窗口规划', icon: Clock },
  { to: '/safety', label: '安全退路', icon: Shield },
  { to: '/journal', label: '赶海日志', icon: BookOpen },
  { to: '/guide', label: '路书', icon: Map },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0A2463] border-t border-[#3E92CC]/30 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                  isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn('transition-all duration-200', isActive && 'scale-110')}
                  />
                  <span className={cn('text-[10px] mt-1 font-medium', isActive && 'font-bold')}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
