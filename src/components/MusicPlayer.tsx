import { useEffect, useState } from 'react';
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
  Music,
  FolderOpen,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

export const MusicPlayer = () => {
  const { tracks, isLoading, isConnected, connectLibrary, disconnectLibrary, reloadLibrary } = useMusicLibrary();
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration,
    volume,
    shuffle,
    repeat,
    togglePlayPause,
    playTrack,
    playNext,
    playPrevious,
    seek,
    setVolume,
    setShuffle,
    setRepeat,
    setPlaylist
  } = useMusicPlayer();

  // Atualizar playlist no contexto quando tracks mudam
  useEffect(() => {
    if (tracks.length > 0) {
      setPlaylist(tracks);
      if (!currentTrack) {
        playTrack(tracks[0]);
      }
    }
  }, [tracks]);

  // Formatar tempo
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Carregando
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Music className="h-24 w-24 text-muted-foreground/20 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold mb-3">Carregando Biblioteca...</h2>
        <p className="text-muted-foreground">Aguarde enquanto verificamos sua biblioteca de músicas</p>
      </div>
    );
  }

  // Estado inicial - sem biblioteca conectada
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Music className="h-24 w-24 text-muted-foreground/20 mb-6" />
        <h2 className="text-2xl font-bold mb-3">Player de Música Persistente</h2>
        <p className="text-muted-foreground mb-2 max-w-md">
          Selecione a pasta com seus arquivos de música para começar a ouvir.
        </p>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Suporta MP3, M4A, OGG, WAV e FLAC. Lê automaticamente as informações das músicas (artista, álbum, capa).
        </p>
        <Button 
          size="lg" 
          onClick={connectLibrary}
          className="gap-2"
        >
          <FolderOpen className="h-5 w-5" />
          Conectar Biblioteca de Músicas
        </Button>
      </div>
    );
  }

  // Estado ativo - com biblioteca conectada
  return (
    <div className="flex flex-col h-full">
      {/* Área "Tocando Agora" com Arte do Álbum */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {currentTrack?.artwork ? (
              <img 
                src={currentTrack.artwork} 
                alt={currentTrack.album}
                className="h-full w-full object-cover"
              />
            ) : (
              <Music className="h-10 w-10 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Tocando Agora</p>
            <h3 className="text-lg font-semibold truncate">
              {currentTrack?.title || 'Nenhuma música'}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {currentTrack?.artist} • {currentTrack?.album}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={reloadLibrary}
              title="Recarregar biblioteca"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={disconnectLibrary}
              title="Desconectar biblioteca"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Reprodução */}
      <Card className="flex-1 overflow-hidden mb-4">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Playlist ({tracks.length} músicas)</h3>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-450px)]">
          {tracks.map((track, index) => (
            <button
              key={index}
              onClick={() => playTrack(track)}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 flex items-center gap-3",
                currentTrack?.url === track.url && "bg-primary/10 hover:bg-primary/15"
              )}
            >
              <div className="h-12 w-12 bg-muted rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                {track.artwork ? (
                  <img 
                    src={track.artwork} 
                    alt={track.album}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Music className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  currentTrack?.url === track.url && "text-primary"
                )}>
                  {track.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artist}
                </p>
              </div>
              {currentTrack?.url === track.url && (
                <div className="flex-shrink-0">
                  {isPlaying ? (
                    <Pause className="h-4 w-4 text-primary" />
                  ) : (
                    <Play className="h-4 w-4 text-primary" />
                  )}
                </div>
              )}
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
            onValueChange={(val) => seek(val[0])}
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
            variant={shuffle ? "default" : "outline"}
            size="icon"
            onClick={() => setShuffle(!shuffle)}
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
            variant={repeat ? "default" : "outline"}
            size="icon"
            onClick={() => setRepeat(!repeat)}
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        {/* Controle de Volume */}
        <div className="flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={(val) => setVolume(val[0])}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-12 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </Card>
    </div>
  );
};
