import { useState, FormEvent } from 'react';
import { Transaction, CalculatorSettings } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Plus, Minus, Trash2, MapPin, DollarSign, Tag, ReceiptText, Calendar as CalendarIcon, TrendingUp, List, Filter } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';

interface EntriesProps {
  transactions: Transaction[];
  settings: CalculatorSettings;
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function Entries({ transactions, settings, onAdd, onDelete }: EntriesProps) {
  const [type, setType] = useState<'earning' | 'expense'>('earning');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [km, setKm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [viewAll, setViewAll] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const earningCategories = ['Uber', '99', 'inDrive', 'Particular', 'Outros'];
  const expenseCategories = ['Combustível', 'Alimentação', 'Manutenção', 'Aluguel', 'Limpeza', 'Outros'];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    onAdd({
      type,
      amount: parseFloat(amount),
      category,
      km: type === 'earning' && km ? parseFloat(km) : undefined,
      date: new Date().toISOString(),
    });

    setAmount('');
    setKm('');
    // keep category to make it faster for multiple entries
  };

  const filteredTransactionsDate = viewAll
    ? [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : transactions.filter(t => {
        try {
          return isSameDay(parseISO(t.date), parseISO(selectedDate));
        } catch {
          return false;
        }
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = filterCategory === 'all' 
    ? filteredTransactionsDate 
    : filteredTransactionsDate.filter(t => t.category === filterCategory);

  const availableCategories = Array.from(new Set(transactions.map(t => t.category))).sort();

  // Calculate cost per km
  const daysPerMonth = (settings.daysPerWeek || 6) * 4;
  const monthlyKm = (settings.dailyKmGoal || 250) * daysPerMonth;
  
  let monthlyFixedCost = 0;
  if (settings.carType === 'rented') {
    monthlyFixedCost = settings.monthlyRental || 0;
  } else if (settings.carType === 'financed') {
    monthlyFixedCost = (settings.monthlyInstallment || 0) + (settings.monthlyInsurance || 0) + (settings.monthlyMaintenance || 0);
  } else {
    monthlyFixedCost = (settings.monthlyInsurance || 0) + (settings.monthlyMaintenance || 0);
  }

  const fuelCostPerKm = settings.fuelPrice / (settings.consumption || 1);
  const fixedCostPerKm = monthlyFixedCost / (monthlyKm || 1);
  const totalCostPerKm = fuelCostPerKm + fixedCostPerKm;

  const parsedAmount = parseFloat(amount) || 0;
  const parsedKm = parseFloat(km) || 0;
  
  const estimatedProfit = type === 'earning' && parsedAmount > 0 && parsedKm > 0 
    ? parsedAmount - (parsedKm * totalCostPerKm)
    : null;
    
  const avgPerKm = type === 'earning' && parsedAmount > 0 && parsedKm > 0
    ? parsedAmount / parsedKm
    : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex bg-zinc-100 p-1.5 rounded-2xl mb-6">
          <button
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              type === 'earning' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
            onClick={() => { setType('earning'); setCategory(''); }}
          >
            <Plus size={16} /> Ganhos
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
            onClick={() => { setType('expense'); setCategory(''); }}
          >
            <Minus size={16} /> Gastos
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
              <DollarSign size={16} className="text-zinc-400" />
              Valor (R$)
            </label>
            <Input 
              type="number" 
              step="0.01" 
              required 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg font-bold"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
              <Tag size={16} className="text-zinc-400" />
              Categoria
            </label>
            <div className="flex flex-wrap gap-2">
              {(type === 'earning' ? earningCategories : expenseCategories).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    category === cat 
                      ? type === 'earning' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                        : 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {type === 'earning' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
                  <MapPin size={16} className="text-zinc-400" />
                  Km Rodado (Opcional)
                </label>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={km} 
                  onChange={e => setKm(e.target.value)}
                  placeholder="Ex: 15.5"
                />
              </div>
              
              {estimatedProfit !== null && avgPerKm !== null && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-sm">
                  <div className="flex items-center gap-2 text-emerald-800 font-medium mb-2">
                    <TrendingUp size={16} />
                    <span>Análise da Corrida</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Média por Km:</span>
                      <span className="font-semibold text-emerald-900">R$ {avgPerKm.toFixed(2)} / km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Custo Estimado:</span>
                      <span className="font-semibold text-emerald-900">R$ {(parsedKm * totalCostPerKm).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-200/50 pt-1 mt-1">
                      <span className="text-emerald-800 font-medium">Lucro Líquido:</span>
                      <span className={`font-bold ${estimatedProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        R$ {estimatedProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            variant={type === 'earning' ? 'success' : 'danger'}
          >
            Adicionar {type === 'earning' ? 'Ganho' : 'Gasto'}
          </Button>
        </form>
      </Card>

      <div>
        <div className="flex flex-col gap-3 mb-4 px-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-800 tracking-tight">Histórico</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewAll(!viewAll)}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${viewAll ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 bg-zinc-100 hover:bg-zinc-200'}`}
              >
                <List size={14} />
                {viewAll ? 'Ver por dia' : 'Ver todos'}
              </button>
              {!viewAll && (
                <div className="relative">
                  <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-sm">
                    <CalendarIcon size={14} className="text-zinc-500" />
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="text-xs font-semibold text-zinc-700 bg-transparent outline-none cursor-pointer w-[110px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {availableCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
              <div className="flex items-center justify-center bg-zinc-100 text-zinc-400 rounded-lg p-1.5">
                <Filter size={14} />
              </div>
              <button
                onClick={() => setFilterCategory('all')}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  filterCategory === 'all'
                    ? 'bg-zinc-800 border-zinc-800 text-white'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                Todas
              </button>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    filterCategory === cat
                      ? 'bg-zinc-800 border-zinc-800 text-white'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 bg-white rounded-3xl border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <ReceiptText size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">{viewAll ? 'Nenhum lançamento registrado' : 'Nenhum lançamento para este dia'}</p>
            </div>
          ) : (
            filteredTransactions.map(t => (
              <Card key={t.id} className="flex items-center justify-between p-4 border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] group hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${
                    t.type === 'earning' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {t.type === 'earning' ? <TrendingUp size={20} /> : <ReceiptText size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-800 text-sm">{t.category}</p>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">
                      {format(parseISO(t.date), "dd/MM 'às' HH:mm")}
                      {t.km && ` • ${t.km} km`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-black tracking-tight ${
                      t.type === 'earning' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {t.type === 'earning' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                    </p>
                    {t.type === 'earning' && t.km && (
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                        R$ {(t.amount / t.km).toFixed(2)}/km
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all p-2 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
