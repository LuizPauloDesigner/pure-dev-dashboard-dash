import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Music,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useApp } from '@/contexts/AppContext';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';

export const MusicPlayerBar = () => {
  const { getAllTracks } = useMusicLibrary();
  const tracks = getAllTracks();
  
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setPlaylist
  } = useMusicPlayer();
  
  const { setCurrentTab } = useApp();
  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem('mini-player-visible');
    return saved !== 'false';
  });

  // Atualizar playlist quando tracks mudarem
  useEffect(() => {
    if (tracks.length > 0) {
      setPlaylist(tracks);
    }
  }, [tracks, setPlaylist]);

  useEffect(() => {
    localStorage.setItem('mini-player-visible', String(isVisible));
  }, [isVisible]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isVisible) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#1a1a1a] border-b border-primary/20 h-[25px]">
        <button
          onClick={() => setIsVisible(true)}
          className="w-full h-full py-1 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
        >
          <ChevronDown className="h-3 w-3" />
          Mostrar Player
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#1a1a1a] border-b border-primary/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 h-[70px]">
          {/* Album Art & Track Info */}
          <button
            onClick={() => setCurrentTab('musica')}
            className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
          >
            <div className="h-12 w-12 bg-primary/10 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
              {currentTrack?.artwork ? (
                <img 
                  src={currentTrack.artwork} 
                  alt={currentTrack.album}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Music className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                {currentTrack?.title || 'Nenhuma música'}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {currentTrack?.artist || 'Selecione uma música'}
              </p>
            </div>
          </button>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={playPrevious}
                className="h-8 w-8 hover:bg-primary/10"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                onClick={togglePlayPause}
                className="h-10 w-10 bg-primary hover:bg-primary/90"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={playNext}
                className="h-8 w-8 hover:bg-primary/10"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative group">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={(val) => seek(val[0])}
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    "[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                  )}
                />
              </div>
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Hide Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="ml-auto h-8 w-8 hover:bg-primary/10"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
