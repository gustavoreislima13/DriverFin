import { useState } from 'react';
import { Transaction, CalculatorSettings } from '../types';
import { Card } from './ui/Card';
import { TrendingUp, TrendingDown, DollarSign, Activity, Car, Calculator, Calendar as CalendarIcon, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { format, parseISO, isSameDay, subDays, isAfter } from 'date-fns';

interface DashboardProps {
  transactions: Transaction[];
  settings: CalculatorSettings;
}

export function Dashboard({ transactions, settings }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  const targetDate = parseISO(selectedDate);
  const isToday = isSameDay(targetDate, new Date());
  const dateLabel = isToday ? 'Hoje' : 'Selecionado';
  
  const selectedDateTransactions = transactions.filter(t => {
    try {
      return isSameDay(parseISO(t.date), targetDate);
    } catch {
      return false;
    }
  });
  
  const earnings = selectedDateTransactions.filter(t => t.type === 'earning').reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = selectedDateTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = earnings - expenses;
  
  const totalKm = selectedDateTransactions.filter(t => t.type === 'earning').reduce((acc, curr) => acc + (curr.km || 0), 0);
  
  const daysPerMonth = (settings.daysPerWeek || 6) * 4;
  const monthlyKm = (settings.dailyKmGoal || 250) * daysPerMonth;
  const monthlyFuelCost = (monthlyKm / (settings.consumption || 1)) * settings.fuelPrice;
  
  let monthlyFixedCost = 0;
  if (settings.carType === 'rented') {
    monthlyFixedCost = settings.monthlyRental || 0;
  } else if (settings.carType === 'financed') {
    monthlyFixedCost = (settings.monthlyInstallment || 0) + (settings.monthlyInsurance || 0) + (settings.monthlyMaintenance || 0);
  } else {
    monthlyFixedCost = (settings.monthlyInsurance || 0) + (settings.monthlyMaintenance || 0);
  }
  
  const requiredGrossRevenue = monthlyFixedCost + monthlyFuelCost + (settings.monthlyNetProfitGoal || 0);
  const requiredAvgPerKm = requiredGrossRevenue / (monthlyKm || 1);
  const requiredDailyRevenue = requiredGrossRevenue / (daysPerMonth || 1);
  const dailyNetProfitGoal = (settings.monthlyNetProfitGoal || 0) / (daysPerMonth || 1);

  // Calculate cost per km
  const fuelCostPerKm = settings.fuelPrice / (settings.consumption || 1);
  const fixedCostPerKm = monthlyFixedCost / (monthlyKm || 1);
  const totalCostPerKm = fuelCostPerKm + fixedCostPerKm;
  
  const profitPerKm = totalKm > 0 ? (netProfit / totalKm) : 0;
  const avgEarningsPerKm = totalKm > 0 ? (earnings / totalKm) : 0;
  
  // Goals
  const profitProgress = dailyNetProfitGoal > 0 ? Math.min(100, Math.max(0, (netProfit / dailyNetProfitGoal) * 100)) : 0;
  const grossProgress = requiredDailyRevenue > 0 ? Math.min(100, Math.max(0, (earnings / requiredDailyRevenue) * 100)) : 0;

  // Chart data (last 7 days from targetDate)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(targetDate);
    d.setDate(d.getDate() - (6 - i));
    const dayTrans = transactions.filter(t => {
      try {
        return isSameDay(parseISO(t.date), d);
      } catch {
        return false;
      }
    });
    const earn = dayTrans.filter(t => t.type === 'earning').reduce((acc, curr) => acc + curr.amount, 0);
    const exp = dayTrans.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return {
      name: format(d, 'dd/MM'),
      Lucro: earn - exp,
      Ganhos: earn,
    };
  });

  // Pie Chart Data (Expenses by Category for last 7 days from targetDate)
  const sevenDaysAgo = subDays(targetDate, 7);
  const last7DaysExpenses = transactions.filter(t => {
    try {
      const d = parseISO(t.date);
      return t.type === 'expense' && isAfter(d, sevenDaysAgo) && !isAfter(d, targetDate);
    } catch {
      return false;
    }
  });

  const expensesByCategory = last7DaysExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const PIE_COLORS = ['#f43f5e', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#8b5cf6', '#d946ef'];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-bold text-zinc-800 text-lg tracking-tight">Resumo</h2>
        <div className="relative">
          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-sm">
            <CalendarIcon size={14} className="text-zinc-500" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-zinc-700 bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-emerald-50 text-sm font-medium">Ganhos {dateLabel}</h3>
            <TrendingUp size={18} className="text-emerald-100" />
          </div>
          <p className="text-2xl font-bold">R$ {earnings.toFixed(2)}</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-rose-50 text-sm font-medium">Gastos {dateLabel}</h3>
            <TrendingDown size={18} className="text-rose-100" />
          </div>
          <p className="text-2xl font-bold">R$ {expenses.toFixed(2)}</p>
        </Card>
      </div>

      <Card className="relative overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
          <DollarSign size={80} />
        </div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-zinc-500 text-sm font-medium">Lucro Líquido ({dateLabel})</h3>
        </div>
        <p className={`text-4xl font-black tracking-tight ${netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          R$ {netProfit.toFixed(2)}
        </p>
        
        {dailyNetProfitGoal > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-500 font-medium">Meta: R$ {dailyNetProfitGoal.toFixed(2)}</span>
              <span className="font-bold text-emerald-500">{profitProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${profitProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-5">
          <div>
            <p className="text-[10px] text-zinc-500 mb-1 flex items-center gap-1 font-medium uppercase tracking-wider">
              <Activity size={10} /> Km Rodado
            </p>
            <p className="font-bold text-zinc-800 text-sm">{totalKm} km</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 mb-1 flex items-center gap-1 font-medium uppercase tracking-wider">
              <TrendingUp size={10} /> Ganho/Km
            </p>
            <p className="font-bold text-zinc-800 text-sm">
              R$ {avgEarningsPerKm.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 mb-1 flex items-center gap-1 font-medium uppercase tracking-wider">
              <Car size={10} /> Lucro/Km
            </p>
            <p className={`font-bold text-sm ${profitPerKm >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              R$ {profitPerKm.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="font-bold text-zinc-800 mb-3 flex items-center gap-2 text-sm">
          <Target size={16} className="text-emerald-500" />
          Progresso do Faturamento Bruto
        </h3>
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-3xl font-black tracking-tight text-zinc-900">R$ {earnings.toFixed(2)}</p>
            <p className="text-xs text-zinc-500 font-medium mt-1">de R$ {requiredDailyRevenue.toFixed(2)} necessários</p>
          </div>
          <span className="text-xl font-black text-emerald-500">{grossProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-2.5">
          <div 
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${grossProgress}%` }}
          ></div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-zinc-800 mb-4">Desempenho (Últimos 7 dias)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 500 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 500 }} />
              <Tooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
              />
              <Bar dataKey="Lucro" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.Lucro >= 0 ? '#10b981' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-zinc-800 mb-4">Gastos por Categoria (Últimos 7 dias)</h3>
        {pieData.length > 0 ? (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-zinc-400 text-sm font-medium">
            Nenhum gasto registrado neste período.
          </div>
        )}
      </Card>
      
      <Card className="bg-zinc-100 border-none mb-6">
        <h3 className="font-bold text-zinc-800 mb-2 flex items-center gap-2">
          <Calculator size={18} className="text-zinc-500" />
          Sua Meta por Km
        </h3>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black tracking-tight text-zinc-900">R$ {requiredAvgPerKm.toFixed(2)}</span>
          <span className="text-zinc-500 text-sm mb-1 font-medium">/ km</span>
        </div>
        <p className="text-xs text-zinc-500 mt-2 font-medium leading-relaxed">
          Baseado na sua meta de {settings.dailyKmGoal}km/dia. Não aceite corridas que paguem menos que isso!
        </p>
      </Card>
    </div>
  );
}
