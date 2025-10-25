import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Timer, Coffee, Eye, Droplet } from 'lucide-react';

interface ActiveBreakModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  duration: number;
  breakType: 'short' | 'long';
}

export const ActiveBreakModal = ({ 
  isOpen, 
  onComplete, 
  onSkip, 
  duration,
  breakType 
}: ActiveBreakModalProps) => {
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
              <div className="flex items-start gap-3 p-3 rounded-md bg-card border">
                <Coffee className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Alongue o pescoço e os ombros</p>
                  <p className="text-sm text-muted-foreground">
                    Faça movimentos circulares suaves por 30 segundos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-card border">
                <Droplet className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Beba um copo d'água</p>
                  <p className="text-sm text-muted-foreground">
                    Mantenha-se hidratado para melhor concentração
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-card border">
                <Eye className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Descanse os olhos</p>
                  <p className="text-sm text-muted-foreground">
                    Olhe para algo distante por 20 segundos (regra 20-20-20)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={onComplete} 
              size="lg"
              className="w-full text-lg h-12"
            >
              ✓ Pausa Concluída e Retornar
            </Button>
            
            <Button 
              onClick={onSkip} 
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Pular Pausa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
