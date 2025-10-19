import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Music, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface MusicFile {
  file: File;
  name: string;
  url: string;
}

export const MusicPlayerBar = () => {
  const { state, setMusicPlayerVolume, setMusicPlayerShuffle, setMusicPlayerRepeat } = useApp();
  const [playlist, setPlaylist] = useState<MusicFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualizar volume quando muda no estado
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.musicPlayerVolume;
    }
  }, [state.musicPlayerVolume]);

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const audioFiles = files.filter(file => 
      /\.(mp3|m4a|ogg|wav|flac)$/i.test(file.name)
    );
    
    if (audioFiles.length === 0) {
      toast.error('Nenhum arquivo de áudio encontrado');
      return;
    }

    const musicFiles: MusicFile[] = audioFiles.map(file => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(file)
    }));
    
    setPlaylist(musicFiles);
    setCurrentTrack(0);
    
    // Carregar primeira música
    if (audioRef.current && musicFiles.length > 0) {
      audioRef.current.src = musicFiles[0].url;
      audioRef.current.volume = state.musicPlayerVolume;
    }
    
    toast.success(`${audioFiles.length} músicas carregadas`);
  };

  const playTrack = (index: number) => {
    if (!audioRef.current || index < 0 || index >= playlist.length) return;
    
    const musicFile = playlist[index];
    audioRef.current.src = musicFile.url;
    audioRef.current.play()
      .then(() => {
        setCurrentTrack(index);
        setIsPlaying(true);
      })
      .catch(error => {
        console.error('Erro ao tocar música:', error);
        toast.error('Erro ao tocar música');
      });
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (currentTrack === -1 && playlist.length > 0) {
      playTrack(0);
    } else if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error('Erro ao tocar:', error);
          toast.error('Erro ao reproduzir');
        });
    }
  };

  const handlePrevious = () => {
    if (currentTrack > 0) {
      playTrack(currentTrack - 1);
    } else if (playlist.length > 0) {
      playTrack(playlist.length - 1);
    }
  };

  const handleNext = () => {
    if (state.musicPlayerShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playTrack(randomIndex);
    } else if (currentTrack < playlist.length - 1) {
      playTrack(currentTrack + 1);
    } else if (state.musicPlayerRepeat) {
      playTrack(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (state.musicPlayerRepeat) {
      playTrack(currentTrack);
    } else {
      handleNext();
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTrackName = currentTrack >= 0 && playlist[currentTrack] 
    ? playlist[currentTrack].name
    : 'Nenhuma música selecionada';

  if (playlist.length === 0) {
    return (
      <div className="sticky top-16 z-40 w-full border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Music className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Player de Música</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            // @ts-ignore - webkitdirectory é suportado mas não está nos tipos
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderSelect}
            className="hidden"
            accept="audio/*"
          />
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Selecionar Pasta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <div className="sticky top-16 z-40 w-full border-b bg-card/95 backdrop-blur">
        <div className="container px-4 py-2">
          <div className="flex items-center gap-4">
            {/* Controles principais */}
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={handlePrevious}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={handleNext}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Informação da música e barra de progresso */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{currentTrackName}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
            </div>

            {/* Controles secundários */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant={state.musicPlayerShuffle ? "default" : "ghost"}
                onClick={() => setMusicPlayerShuffle(!state.musicPlayerShuffle)}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={state.musicPlayerRepeat ? "default" : "ghost"}
                onClick={() => setMusicPlayerRepeat(!state.musicPlayerRepeat)}
              >
                <Repeat className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2 w-32">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={[state.musicPlayerVolume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setMusicPlayerVolume(value[0] / 100)}
                  className="cursor-pointer"
                />
              </div>

              <Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="outline">
                    <Music className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Playlist ({playlist.length} músicas)</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-96">
                    <div className="space-y-1">
                      {playlist.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            playTrack(index);
                            setPlaylistDialogOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-lg hover:bg-accent transition-colors ${
                            currentTrack === index ? 'bg-accent font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                           <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                            <span className="flex-1 truncate">{file.name}</span>
                            {currentTrack === index && isPlaying && (
                              <Play className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
