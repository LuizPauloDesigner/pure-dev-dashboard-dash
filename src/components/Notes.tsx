import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Star, Trash2, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export const Notes = () => {
  const { state, currentProject, addNote, updateNote, deleteNote } = useApp();
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const projectNotes = state.notes.filter(note => note.projectId === currentProject);
  const currentNote = selectedNote ? state.notes.find(n => n.id === selectedNote) : null;

  const handleNew = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    if (selectedNote) {
      updateNote(selectedNote, { title, content });
      toast.success('Nota atualizada');
    } else {
      addNote({ projectId: currentProject, title, content, isFavorite: false });
      toast.success('Nota criada');
    }
    setIsEditing(false);
  };

  const handleSelect = (noteId: string) => {
    const note = state.notes.find(n => n.id === noteId);
    if (note) {
      setSelectedNote(noteId);
      setTitle(note.title);
      setContent(note.content);
      setIsEditing(false);
    }
  };

  const handleToggleFavorite = (noteId: string) => {
    const note = state.notes.find(n => n.id === noteId);
    if (note) {
      updateNote(noteId, { isFavorite: !note.isFavorite });
    }
  };

  const handleDelete = (noteId: string) => {
    deleteNote(noteId);
    if (selectedNote === noteId) {
      setSelectedNote(null);
      setTitle('');
      setContent('');
    }
    toast.success('Nota deletada');
  };

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Minhas Notas</CardTitle>
            <Button size="icon" variant="ghost" onClick={handleNew}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {projectNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma nota</p>
          ) : (
            projectNotes.map(note => (
              <div
                key={note.id}
                className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-colors ${
                  selectedNote === note.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                }`}
                onClick={() => handleSelect(note.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(note.id);
                  }}
                  className="shrink-0"
                >
                  <Star
                    className={`h-4 w-4 ${note.isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {(isEditing || selectedNote) && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Editor</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título da nota"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isEditing}
                />
                <Textarea
                  placeholder="Escreva sua nota em Markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] font-mono"
                  disabled={!isEditing}
                />
              </CardContent>
            </Card>

            {content && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!isEditing && !selectedNote && (
          <Card>
            <CardContent className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Selecione ou crie uma nota</p>
                <Button onClick={handleNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Nota
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
