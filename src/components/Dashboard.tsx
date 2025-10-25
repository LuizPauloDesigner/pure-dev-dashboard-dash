import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, FileText, Code, Timer, Heart, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const Dashboard = () => {
  const { state, currentProject } = useApp();

  // Calcular últimos 7 dias
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const last7DaysLabels = last7Days.map(date => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
  });

  const inProgressTasks = state.kanban.filter(
    task => task.projectId === currentProject && task.column === 'inProgress'
  );

  const recentNotes = state.notes
    .filter(note => note.projectId === currentProject)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const recentSnippets = state.snippets
    .filter(snippet => snippet.projectId === currentProject)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Filtrar dados dos últimos 7 dias
  const last7DaysBreaks = state.wellnessStats.breaks.filter(b => {
    const breakDate = new Date(b.dataHora).toISOString().split('T')[0];
    return last7Days.includes(breakDate);
  });

  const last7DaysDiary = state.diary.filter(entry => {
    return entry.projetoId === currentProject && last7Days.includes(entry.date);
  });

  // KPIs últimos 7 dias
  const totalBreaks = last7DaysBreaks.length;
  const completedBreaks = last7DaysBreaks.filter(b => b.adesaoStatus === 'Concluida').length;
  const adherenceRate = totalBreaks > 0 ? Math.round((completedBreaks / totalBreaks) * 100) : 0;

  const moodScores = last7DaysDiary.map(e => e.moodScore).filter(m => m !== null && m !== undefined) as number[];
  const avgMoodNum = moodScores.length > 0 
    ? moodScores.reduce((acc, val) => acc + val, 0) / moodScores.length
    : null;
  const avgMood = avgMoodNum ? avgMoodNum.toFixed(1) : null;

  const moodEmoji = avgMoodNum 
    ? avgMoodNum >= 4.5 ? '🤩' : avgMoodNum >= 3.5 ? '😁' : avgMoodNum >= 2.5 ? '🙂' : avgMoodNum >= 1.5 ? '😐' : '😞'
    : null;

  // Dados para o gráfico (por dia)
  const dailyFocusCycles = last7Days.map(date => {
    // Aqui vamos considerar focusSessions dividido pelos dias (simplificação)
    // Em uma implementação real, precisaríamos rastrear por data
    return 0; // Placeholder - precisaria de dados diários de Pomodoro
  });

  const dailyMoodAvg = last7Days.map(date => {
    const dayEntries = last7DaysDiary.filter(e => e.date === date);
    const dayMoods = dayEntries.map(e => e.moodScore).filter(m => m !== null && m !== undefined) as number[];
    return dayMoods.length > 0 ? dayMoods.reduce((acc, val) => acc + val, 0) / dayMoods.length : null;
  });

  const hasData = moodScores.length > 0 || totalBreaks > 0;

  const chartData = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: 'Ciclos de Foco',
        data: dailyFocusCycles,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
        tension: 0.3,
      },
      {
        label: 'Humor Médio',
        data: dailyMoodAvg,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y1',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Ciclos de Foco',
        },
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Humor (1-5)',
        },
        min: 1,
        max: 5,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tarefas em Progresso</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{inProgressTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {state.notes.filter(n => n.projectId === currentProject).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Snippets</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {state.snippets.filter(s => s.projectId === currentProject).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessões Pomodoro</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{state.pomodoroStats.focusSessions}</div>
            <p className="text-xs text-muted-foreground">{state.pomodoroStats.totalMinutes} minutos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Bem-Estar & Foco (TCC)</CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">Métricas dos últimos 7 dias</p>
          
          {!hasData ? (
            <div className="flex items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Sem dados suficientes para análise na última semana.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Taxa de Adesão</p>
                  <div className="text-2xl font-bold text-primary">
                    {adherenceRate}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Média de Humor</p>
                  <div className="text-2xl font-bold text-primary flex items-center gap-2">
                    {avgMood ? (
                      <>
                        {avgMood} <span className="text-xl">{moodEmoji}</span>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Ciclos Concluídos</p>
                  <div className="text-2xl font-bold text-primary">
                    {state.pomodoroStats.focusSessions}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Correlação Produtividade x Bem-Estar</p>
                <div style={{ height: '250px' }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            {inProgressTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa em andamento</p>
            ) : (
              <div className="space-y-2">
                {inProgressTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma nota criada</p>
            ) : (
              <div className="space-y-2">
                {recentNotes.map(note => (
                  <div key={note.id} className="rounded-lg border p-3">
                    <p className="font-medium">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rascunho</CardTitle>
        </CardHeader>
        <CardContent>
          {state.draft ? (
            <div className="rounded-lg bg-muted p-4">
              <p className="line-clamp-3 text-sm">{state.draft}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum rascunho salvo</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
