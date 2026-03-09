import { LayoutDashboard, Calculator, ReceiptText } from 'lucide-react';
import { cn } from './ui/Card';

interface BottomNavProps {
  activeTab: 'dashboard' | 'calculator' | 'entries';
  onTabChange: (tab: 'dashboard' | 'calculator' | 'entries') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Resumo', icon: LayoutDashboard },
    { id: 'entries', label: 'Lançamentos', icon: ReceiptText },
    { id: 'calculator', label: 'Meu Km', icon: Calculator },
  ] as const;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-zinc-200/50 pb-safe pt-2 px-6 flex justify-between items-center z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center p-2 min-w-[72px] transition-all duration-300",
              isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <div className={cn(
              "p-2 rounded-2xl mb-1 transition-all duration-300",
              isActive ? "bg-zinc-100 scale-110" : "bg-transparent scale-100"
            )}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={cn("text-[10px] font-medium transition-all", isActive && "font-bold tracking-wide")}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
