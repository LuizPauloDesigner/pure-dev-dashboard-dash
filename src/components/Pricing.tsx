import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calculator, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export const Pricing = () => {
  const { state, updatePricingData } = useApp();
  
  const [fixedCosts, setFixedCosts] = useState(state.pricingData.fixedCosts.toString());
  const [desiredSalary, setDesiredSalary] = useState(state.pricingData.desiredSalary.toString());
  const [taxesPercent, setTaxesPercent] = useState(state.pricingData.taxesPercent.toString());
  const [hoursPerDay, setHoursPerDay] = useState(state.pricingData.hoursPerDay.toString());
  const [daysPerMonth, setDaysPerMonth] = useState(state.pricingData.daysPerMonth.toString());
  
  const [projectHours, setProjectHours] = useState('40');
  const [complexityMultiplier, setComplexityMultiplier] = useState('1.0');

  const calculateIdealHourlyRate = () => {
    const costs = parseFloat(fixedCosts) || 0;
    const salary = parseFloat(desiredSalary) || 0;
    const taxes = parseFloat(taxesPercent) || 0;
    const hours = parseFloat(hoursPerDay) || 1;
    const days = parseFloat(daysPerMonth) || 1;

    const monthlyRevenue = salary + costs;
    const monthlyRevenueWithTaxes = monthlyRevenue / (1 - taxes / 100);
    const monthlyHours = hours * days;
    
    const minHourlyRate = monthlyRevenue / monthlyHours;
    const idealHourlyRate = monthlyRevenueWithTaxes / monthlyHours;

    return {
      minHourlyRate: minHourlyRate || 0,
      idealHourlyRate: idealHourlyRate || 0,
    };
  };

  const { minHourlyRate, idealHourlyRate } = calculateIdealHourlyRate();

  const handleSaveHourlyRate = () => {
    updatePricingData({
      fixedCosts: parseFloat(fixedCosts) || 0,
      desiredSalary: parseFloat(desiredSalary) || 0,
      taxesPercent: parseFloat(taxesPercent) || 0,
      hoursPerDay: parseFloat(hoursPerDay) || 8,
      daysPerMonth: parseFloat(daysPerMonth) || 22,
      idealHourlyRate,
    });
    toast.success('Valor/Hora Ideal salvo com sucesso!');
  };

  const calculateProjectPrice = () => {
    const hours = parseFloat(projectHours) || 0;
    const multiplier = parseFloat(complexityMultiplier) || 1;
    return state.pricingData.idealHourlyRate * hours * multiplier;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Precificador de Serviços</h2>

      {/* Calculadora de Valor/Hora */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Valor/Hora
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Custos Fixos Mensais (R$)</Label>
              <Input
                type="number"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(e.target.value)}
                placeholder="Ex: 3000"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Aluguel, internet, luz, software, etc.
              </p>
            </div>

            <div>
              <Label>Salário Desejado (R$)</Label>
              <Input
                type="number"
                value={desiredSalary}
                onChange={(e) => setDesiredSalary(e.target.value)}
                placeholder="Ex: 5000"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Quanto você quer ganhar por mês
              </p>
            </div>

            <div>
              <Label>Impostos (%)</Label>
              <Input
                type="number"
                value={taxesPercent}
                onChange={(e) => setTaxesPercent(e.target.value)}
                placeholder="Ex: 15"
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                MEI, Simples Nacional, etc.
              </p>
            </div>

            <div>
              <Label>Horas por Dia</Label>
              <Input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                placeholder="Ex: 8"
                min="1"
                max="24"
                step="0.5"
              />
            </div>

            <div>
              <Label>Dias por Mês</Label>
              <Input
                type="number"
                value={daysPerMonth}
                onChange={(e) => setDaysPerMonth(e.target.value)}
                placeholder="Ex: 22"
                min="1"
                max="31"
                step="1"
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Valor/Hora Mínimo</p>
                <p className="text-2xl font-bold">R$ {minHourlyRate.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sem considerar impostos
                </p>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
                <p className="text-sm text-muted-foreground mb-1">Valor/Hora Ideal</p>
                <p className="text-2xl font-bold text-primary">R$ {idealHourlyRate.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Com impostos inclusos
                </p>
              </div>
            </div>

            <Button onClick={handleSaveHourlyRate} className="w-full mt-4">
              <DollarSign className="h-4 w-4 mr-2" />
              Salvar Valor/Hora Ideal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calculadora de Projeto Fixo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Calculadora de Projeto Fixo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.pricingData.idealHourlyRate === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Configure e salve seu Valor/Hora Ideal acima para usar esta calculadora
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Horas Estimadas</Label>
                  <Input
                    type="number"
                    value={projectHours}
                    onChange={(e) => setProjectHours(e.target.value)}
                    placeholder="Ex: 40"
                    min="0"
                    step="0.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tempo estimado para o projeto
                  </p>
                </div>

                <div>
                  <Label>Multiplicador de Complexidade</Label>
                  <Input
                    type="number"
                    value={complexityMultiplier}
                    onChange={(e) => setComplexityMultiplier(e.target.value)}
                    placeholder="Ex: 1.5"
                    min="0.1"
                    step="0.1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    1.0 = normal, 1.5 = complexo, 2.0 = muito complexo
                  </p>
                </div>
              </div>

              <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary">
                <p className="text-sm text-muted-foreground mb-2">Valor Sugerido do Projeto</p>
                <p className="text-3xl font-bold text-primary">
                  R$ {calculateProjectPrice().toFixed(2)}
                </p>
                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  <p>• Valor/Hora: R$ {state.pricingData.idealHourlyRate.toFixed(2)}</p>
                  <p>• Horas: {projectHours}h</p>
                  <p>• Multiplicador: {complexityMultiplier}x</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg border">
        <h3 className="font-semibold mb-2">💡 Dica</h3>
        <p className="text-sm text-muted-foreground">
          Ao salvar seu Valor/Hora Ideal, você pode vinculá-lo aos serviços do seu Catálogo 
          nas Configurações. Assim, quando criar orçamentos, o preço será preenchido 
          automaticamente com base neste valor!
        </p>
      </div>
    </div>
  );
};
