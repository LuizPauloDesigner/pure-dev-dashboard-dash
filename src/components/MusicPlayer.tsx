import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Shuffle, 
  Repeat,
  FolderOpen,
  Music
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface MusicFile {
  file: File;
  name: string;
  url: string;
}

export const MusicPlayer = () => {
  const { state, setMusicPlayerVolume, setMusicPlayerShuffle, setMusicPlayerRepeat } = useApp();
  const [playlist, setPlaylist] = useState<MusicFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar pasta de músicas
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const audioFiles = files.filter(file => 
      /\.(mp3|m4a|ogg|wav|flac)$/i.test(file.name)
    );

    const musicFiles: MusicFile[] = audioFiles.map(file => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setPlaylist(musicFiles);
    if (musicFiles.length > 0) {
      setCurrentIndex(0);
    }
  };

  // Tocar música
  const playMusic = (index: number) => {
    if (audioRef.current && playlist[index]) {
      audioRef.current.src = playlist[index].url;
      audioRef.current.volume = state.musicPlayerVolume;
      audioRef.current.play();
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Próxima música
  const playNext = () => {
    let nextIndex;
    if (state.musicPlayerShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    playMusic(nextIndex);
  };

  // Música anterior
  const playPrevious = () => {
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playMusic(prevIndex);
  };

  // Atualizar progresso
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Atualizar duração
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Quando a música termina
  const handleEnded = () => {
    if (state.musicPlayerRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      playNext();
    }
  };

  // Buscar na música
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  // Controle de volume
  const handleVolumeChange = (value: number[]) => {
    const volume = value[0];
    setMusicPlayerVolume(volume);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  // Formatar tempo
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Inicializar primeira música quando playlist carrega
  useEffect(() => {
    if (playlist.length > 0 && audioRef.current) {
      audioRef.current.src = playlist[0].url;
      audioRef.current.volume = state.musicPlayerVolume;
    }
  }, [playlist, state.musicPlayerVolume]);

  // Estado inicial - sem playlist
  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Music className="h-24 w-24 text-muted-foreground/20 mb-6" />
        <h2 className="text-2xl font-bold mb-3">Player de Música</h2>
        <p className="text-muted-foreground mb-2 max-w-md">
          Selecione uma pasta do seu computador contendo arquivos de música.
        </p>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          ⚠️ <strong>Importante:</strong> Devido às restrições de segurança do navegador, 
          você precisará selecionar a pasta novamente sempre que recarregar a página.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          // @ts-ignore - webkitdirectory é suportado mas não está nos types
          webkitdirectory="true"
          directory="true"
          multiple
          onChange={handleFolderSelect}
          className="hidden"
        />
        <Button 
          size="lg" 
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <FolderOpen className="h-5 w-5" />
          Selecionar Pasta de Músicas
        </Button>
      </div>
    );
  }

  // Estado ativo - com playlist
  return (
    <div className="flex flex-col h-full">
      {/* Área "Tocando Agora" */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Tocando Agora</p>
            <h3 className="text-lg font-semibold truncate">
              {playlist[currentIndex]?.name || 'Nenhuma música'}
            </h3>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Trocar Pasta
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            // @ts-ignore
            webkitdirectory="true"
            directory="true"
            multiple
            onChange={handleFolderSelect}
            className="hidden"
          />
        </div>
      </Card>

      {/* Lista de Reprodução */}
      <Card className="flex-1 overflow-hidden mb-4">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Playlist ({playlist.length} músicas)</h3>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
          {playlist.map((music, index) => (
            <button
              key={index}
              onClick={() => playMusic(index)}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 flex items-center gap-3",
                currentIndex === index && "bg-primary/10 hover:bg-primary/15"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded flex items-center justify-center flex-shrink-0",
                currentIndex === index ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {currentIndex === index && isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </div>
              <span className={cn(
                "truncate",
                currentIndex === index && "font-medium"
              )}>
                {music.name}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Controles de Reprodução */}
      <Card className="p-6">
        {/* Barra de Progresso */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controles Principais */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant={state.musicPlayerShuffle ? "default" : "outline"}
            size="icon"
            onClick={() => setMusicPlayerShuffle(!state.musicPlayerShuffle)}
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={playPrevious}
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            size="lg"
            onClick={togglePlayPause}
            className="h-12 w-12"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={playNext}
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <Button
            variant={state.musicPlayerRepeat ? "default" : "outline"}
            size="icon"
            onClick={() => setMusicPlayerRepeat(!state.musicPlayerRepeat)}
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        {/* Controle de Volume */}
        <div className="flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[state.musicPlayerVolume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-12 text-right">
            {Math.round(state.musicPlayerVolume * 100)}%
          </span>
        </div>
      </Card>

      {/* Elemento de áudio oculto */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
    </div>
  );
};
