import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Calculator } from './components/Calculator';
import { Entries } from './components/Entries';
import { BottomNav } from './components/BottomNav';
import { Transaction, CalculatorSettings } from './types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DEFAULT_SETTINGS: CalculatorSettings = {
  carType: 'rented',
  daysPerWeek: 6,
  hoursPerDay: 8,
  dailyKmGoal: 250,
  monthlyRental: 3504,
  monthlyInstallment: 2100,
  monthlyInsurance: 550,
  monthlyMaintenance: 600,
  fuelPrice: 4.29,
  consumption: 9.3,
  monthlyNetProfitGoal: 3000,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'entries'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<CalculatorSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = new Date().getTime();
        const [txRes, settingsRes] = await Promise.all([
          fetch(`/api/transactions?t=${timestamp}`),
          fetch(`/api/settings?t=${timestamp}`)
        ]);
        
        if (txRes.ok) {
          const data = await txRes.json();
          setTransactions(data);
        }
        
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data) {
            setSettings(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateSettings = async (newSettings: CalculatorSettings) => {
    setSettings(newSettings);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions([newTransaction, ...transactions]);
    
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      });
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    
    try {
      await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center max-w-md mx-auto shadow-2xl relative overflow-hidden">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <header className="bg-white text-zinc-900 p-5 pt-10 pb-8 rounded-b-[2rem] shadow-sm border-b border-zinc-100 z-10">
        <h1 className="text-3xl font-black tracking-tight">DriverFin</h1>
        <p className="text-zinc-500 text-sm mt-1.5 font-medium capitalize">{format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 p-4">
        {activeTab === 'dashboard' && <Dashboard transactions={transactions} settings={settings} />}
        {activeTab === 'calculator' && <Calculator settings={settings} onUpdateSettings={updateSettings} />}
        {activeTab === 'entries' && <Entries transactions={transactions} settings={settings} onAdd={addTransaction} onDelete={deleteTransaction} />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
