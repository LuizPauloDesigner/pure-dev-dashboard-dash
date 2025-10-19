import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, FileText, Code, Timer } from 'lucide-react';

export const Dashboard = () => {
  const { state, currentProject } = useApp();

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
