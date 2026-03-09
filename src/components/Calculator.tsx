import { useState } from 'react';
import { CalculatorSettings } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Car, Fuel, Wrench, Calendar, Target, AlertCircle, Activity, TrendingUp } from 'lucide-react';

interface CalculatorProps {
  settings: CalculatorSettings;
  onUpdateSettings: (settings: CalculatorSettings) => void;
}

export function Calculator({ settings, onUpdateSettings }: CalculatorProps) {
  const [localSettings, setLocalSettings] = useState<CalculatorSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof CalculatorSettings, value: string | number) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleCarTypeChange = (type: 'rented' | 'financed' | 'owned') => {
    setLocalSettings(prev => ({ ...prev, carType: type }));
    setSaved(false);
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const daysPerMonth = (localSettings.daysPerWeek || 6) * 4;
  const hoursPerMonth = (localSettings.hoursPerDay || 8) * daysPerMonth;
  const monthlyKm = (localSettings.dailyKmGoal || 250) * daysPerMonth;
  
  const monthlyFuelCost = (monthlyKm / (localSettings.consumption || 1)) * localSettings.fuelPrice;
  
  let monthlyFixedCost = 0;
  if (localSettings.carType === 'rented') {
    monthlyFixedCost = localSettings.monthlyRental || 0;
  } else if (localSettings.carType === 'financed') {
    monthlyFixedCost = (localSettings.monthlyInstallment || 0) + (localSettings.monthlyInsurance || 0) + (localSettings.monthlyMaintenance || 0);
  } else {
    monthlyFixedCost = (localSettings.monthlyInsurance || 0) + (localSettings.monthlyMaintenance || 0);
  }
  
  const requiredGrossRevenue = monthlyFixedCost + monthlyFuelCost + (localSettings.monthlyNetProfitGoal || 0);
  
  const requiredAvgPerKm = requiredGrossRevenue / (monthlyKm || 1);
  const requiredAvgPerHour = requiredGrossRevenue / (hoursPerMonth || 1);
  const requiredDailyRevenue = requiredGrossRevenue / (daysPerMonth || 1);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
      <div className="bg-white -mx-4 -mt-4 p-6 pb-8 text-zinc-900 rounded-b-[2rem] mb-6 shadow-sm border-b border-zinc-100">
        <h2 className="text-2xl font-black mb-1 tracking-tight">Calculadora Meu Km</h2>
        <p className="text-zinc-500 text-sm mb-6 font-medium">Descubra seu custo real por quilômetro rodado</p>
        
        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 text-center">
          <p className="text-zinc-500 text-sm font-semibold mb-1 uppercase tracking-wider">Meta por KM</p>
          <div className="text-5xl font-black tracking-tight text-zinc-900">
            R$ {requiredAvgPerKm.toFixed(2)}
          </div>
        </div>
      </div>

      <Card>
        <h3 className="font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <Car size={18} className="text-zinc-500" />
          Tipo de Veículo
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(['rented', 'financed', 'owned'] as const).map(type => (
            <button
              key={type}
              onClick={() => handleCarTypeChange(type)}
              className={`py-2.5 px-1 text-xs font-bold rounded-2xl border transition-all ${
                localSettings.carType === type 
                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              {type === 'rented' ? 'Alugado' : type === 'financed' ? 'Financiado' : 'Quitado'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="text-gray-400" />
                Dias/Semana
              </label>
              <Input 
                type="number" 
                value={localSettings.daysPerWeek} 
                onChange={e => handleChange('daysPerWeek', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Activity size={16} className="text-gray-400" />
                Horas/Dia
              </label>
              <Input 
                type="number" 
                value={localSettings.hoursPerDay} 
                onChange={e => handleChange('hoursPerDay', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Target size={16} className="text-gray-400" />
                Meta Diária (Km)
              </label>
              <Input 
                type="number" 
                value={localSettings.dailyKmGoal} 
                onChange={e => handleChange('dailyKmGoal', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <TrendingUp size={16} className="text-gray-400" />
                Meta Lucro/Mês
              </label>
              <Input 
                type="number" 
                step="0.01"
                value={localSettings.monthlyNetProfitGoal} 
                onChange={e => handleChange('monthlyNetProfitGoal', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Fuel size={16} className="text-gray-400" />
                Combustível (R$)
              </label>
              <Input 
                type="number" 
                step="0.01"
                value={localSettings.fuelPrice} 
                onChange={e => handleChange('fuelPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Activity size={16} className="text-gray-400" />
                Consumo (Km/L)
              </label>
              <Input 
                type="number" 
                step="0.1"
                value={localSettings.consumption} 
                onChange={e => handleChange('consumption', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {localSettings.carType === 'rented' ? (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="text-gray-400" />
                Aluguel Mensal (R$)
              </label>
              <Input 
                type="number" 
                step="0.01"
                value={localSettings.monthlyRental} 
                onChange={e => handleChange('monthlyRental', parseFloat(e.target.value) || 0)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {localSettings.carType === 'financed' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Calendar size={16} className="text-gray-400" />
                    Parcela Mensal
                  </label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={localSettings.monthlyInstallment} 
                    onChange={e => handleChange('monthlyInstallment', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <AlertCircle size={16} className="text-gray-400" />
                  Seguro + IPVA/Mês
                </label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={localSettings.monthlyInsurance} 
                  onChange={e => handleChange('monthlyInsurance', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className={localSettings.carType === 'owned' ? 'col-span-2' : ''}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Wrench size={16} className="text-gray-400" />
                  Manutenção/Mês
                </label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={localSettings.monthlyMaintenance} 
                  onChange={e => handleChange('monthlyMaintenance', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 mt-6 shadow-sm">
            <h4 className="font-bold text-zinc-900 mb-3 text-sm flex items-center gap-2">
              <Target size={16} className="text-emerald-500" />
              Suas Metas (A Fórmula do Motorista):
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Faturamento Mensal:</span>
                <span className="font-black text-zinc-900 text-lg">R$ {requiredGrossRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Meta por KM:</span>
                <span className="font-black text-emerald-600 text-lg">R$ {requiredAvgPerKm.toFixed(2)} <span className="text-xs font-semibold text-emerald-600/70">/ km</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Meta por Hora:</span>
                <span className="font-black text-zinc-900 text-lg">R$ {requiredAvgPerHour.toFixed(2)} <span className="text-xs font-semibold text-zinc-400">/ h</span></span>
              </div>
              <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-200 mt-1">
                <span className="text-zinc-500 font-medium uppercase tracking-wider">Meta Diária:</span>
                <span className="font-bold text-zinc-800">R$ {requiredDailyRevenue.toFixed(2)} / dia</span>
              </div>
            </div>
          </div>
        </div>

        <Button 
          className="w-full mt-6" 
          onClick={handleSave}
          variant={saved ? 'success' : 'primary'}
        >
          {saved ? 'Salvo com sucesso!' : 'Salvar Configurações'}
        </Button>
      </Card>

      {localSettings.carType === 'owned' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-amber-800 font-medium text-sm">O Grande Alerta sobre o Carro Quitado</h4>
            <p className="text-amber-700/80 text-xs mt-1 leading-relaxed">
              O carro quitado parece mais fácil, mas cuidado com a depreciação! Recomendamos trabalhar com a meta do Financiado. Guarde a diferença numa conta separada para trocar de carro no futuro, senão você terá um carro sucateado e sem dinheiro para comprar outro.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-amber-800 font-medium text-sm">Dica de Ouro</h4>
            <p className="text-amber-700/80 text-xs mt-1 leading-relaxed">
              Nunca aceite corridas que paguem menos que <strong>R$ {requiredAvgPerKm.toFixed(2)} por km</strong>. 
              O ideal é buscar corridas que paguem pelo menos o dobro do seu custo para ter um bom lucro.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
