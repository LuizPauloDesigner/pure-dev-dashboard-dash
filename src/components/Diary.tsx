import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export const Diary = () => {
  const { state, updateDiaryEntry } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [content, setContent] = useState('');

  const dateString = selectedDate.toISOString().split('T')[0];
  const entry = state.diary.find(e => e.date === dateString);

  useEffect(() => {
    setContent(entry?.content || '');
  }, [entry]);

  const handleSave = () => {
    updateDiaryEntry(dateString, content);
    toast.success('Entrada salva');
  };

  const datesWithEntries = state.diary.map(e => new Date(e.date));

  return (
    <div className="grid gap-6 md:grid-cols-[350px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              hasEntry: datesWithEntries,
            }}
            modifiersClassNames={{
              hasEntry: 'bg-primary/20 font-bold',
            }}
          />
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Total de entradas: {state.diary.length}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-primary/20" />
              <span className="text-muted-foreground">Dia com entrada</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardTitle>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Escreva sobre seu dia..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[500px] resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
