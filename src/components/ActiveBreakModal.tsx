import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Timer, Coffee, Eye, Droplet, Dumbbell, Wind } from 'lucide-react';

interface ActiveBreakModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  duration: number;
  breakType: 'short' | 'long';
}

const EXERCISE_SUGGESTIONS = [
  {
    icon: Coffee,
    title: 'Alongue o pescoço e os ombros',
    description: 'Faça movimentos circulares suaves por 30 segundos',
  },
  {
    icon: Droplet,
    title: 'Beba um copo d\'água',
    description: 'Mantenha-se hidratado para melhor concentração',
  },
  {
    icon: Eye,
    title: 'Descanse os olhos',
    description: 'Olhe para algo distante por 20 segundos (regra 20-20-20)',
  },
  {
    icon: Dumbbell,
    title: 'Levante e estique as pernas',
    description: 'Faça alguns passos ou agachamentos leves',
  },
  {
    icon: Wind,
    title: 'Respire profundamente',
    description: '5 respirações profundas pelo nariz e solte pela boca',
  },
];

export const ActiveBreakModal = ({ 
  isOpen, 
  onComplete, 
  onSkip, 
  duration,
  breakType 
}: ActiveBreakModalProps) => {
  // Pega 3 sugestões aleatórias
  const randomExercises = EXERCISE_SUGGESTIONS
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <Dialog open={isOpen} modal>
      <DialogContent 
        className="max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
            🛑 PAUSA ATIVA OBRIGATÓRIA
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Timer className="h-5 w-5" />
              <span className="text-lg font-semibold">
                Pausa {breakType === 'short' ? 'Curta' : 'Longa'} - {duration} minutos
              </span>
            </div>
            <p className="text-lg text-muted-foreground">
              Cuide do seu corpo e da sua mente. Mova-se um pouco!
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Sugestões de Atividades:</h3>
            
            <div className="space-y-3">
              {randomExercises.map((exercise, index) => {
                const Icon = exercise.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-card border">
                    <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{exercise.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={onComplete} 
              size="lg"
              className="w-full text-lg h-12"
            >
              ✓ Pausa Concluída (+15 Pontos)
            </Button>
            
            <Button 
              onClick={onSkip} 
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Pular Pausa (-5 Pontos)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
