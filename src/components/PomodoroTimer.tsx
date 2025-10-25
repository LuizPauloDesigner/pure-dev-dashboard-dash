import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { ActiveBreakModal } from './ActiveBreakModal';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroTimer = () => {
  const { updatePomodoroStats, state, addWellnessBreak } = useApp();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [pendingBreakType, setPendingBreakType] = useState<'short' | 'long'>('short');
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return TIMER_DURATIONS[mode];
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'focus') {
      updatePomodoroStats({
        focusSessions: state.pomodoroStats.focusSessions + 1,
        totalMinutes: state.pomodoroStats.totalMinutes + 25,
      });
      toast.success('Sessão de foco concluída!');
      
      // Disparar modal de Pausa Ativa
      const breakType = (state.pomodoroStats.focusSessions + 1) % 4 === 0 ? 'long' : 'short';
      setPendingBreakType(breakType);
      setShowBreakModal(true);
    } else {
      toast.info('Pausa concluída!');
      changeMode('focus');
    }
    
    // Play notification sound
    new Audio('/notification.mp3').play().catch(() => {});
  };

  const handleBreakComplete = () => {
    const breakDuration = pendingBreakType === 'short' ? 5 : 15;
    
    addWellnessBreak({
      dataHora: new Date().toISOString(),
      tipoCiclo: pendingBreakType,
      adesaoStatus: 'Concluida',
      duracaoPausa: breakDuration,
    });
    
    setShowBreakModal(false);
    changeMode(pendingBreakType === 'short' ? 'shortBreak' : 'longBreak');
    toast.success('Pausa ativa concluída! Continue assim!');
  };

  const handleBreakSkip = () => {
    const breakDuration = pendingBreakType === 'short' ? 5 : 15;
    
    addWellnessBreak({
      dataHora: new Date().toISOString(),
      tipoCiclo: pendingBreakType,
      adesaoStatus: 'Pulada',
      duracaoPausa: breakDuration,
    });
    
    setShowBreakModal(false);
    changeMode(pendingBreakType === 'short' ? 'shortBreak' : 'longBreak');
    toast.info('Pausa ignorada. Lembre-se de cuidar da sua saúde!');
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_DURATIONS[newMode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="hidden md:flex items-center gap-2 rounded-lg border bg-card p-2">
        <Timer className="h-4 w-4 text-primary" />
        <span className="font-mono text-sm font-medium min-w-[4rem]">
          {formatTime(timeLeft)}
        </span>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={toggleTimer}
          >
            {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={resetTimer}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <ActiveBreakModal
        isOpen={showBreakModal}
        onComplete={handleBreakComplete}
        onSkip={handleBreakSkip}
        duration={pendingBreakType === 'short' ? 5 : 15}
        breakType={pendingBreakType}
      />
    </>
  );
};
