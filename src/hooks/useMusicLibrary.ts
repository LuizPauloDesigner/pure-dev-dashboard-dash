import { useState, useEffect, useCallback } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import { toast } from 'sonner';

export interface MusicTrack {
  file: File;
  name: string;
  url: string;
  title: string;
  artist: string;
  album: string;
  artwork?: string;
}

const DB_NAME = 'MusicLibraryDB';
const DB_VERSION = 1;
const STORE_NAME = 'musicDirectory';

// Inicializar IndexedDB
const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const useMusicLibrary = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

  // Carregar handle salvo do IndexedDB
  const loadSavedDirectory = useCallback(async () => {
    try {
      const db = await initDB();
      const savedHandle = await db.get(STORE_NAME, 'directoryHandle');
      
      if (savedHandle) {
        // Verificar se ainda temos permissão
        const permission = await savedHandle.queryPermission({ mode: 'read' });
        if (permission === 'granted') {
          setDirectoryHandle(savedHandle);
          await loadTracksFromDirectory(savedHandle);
        } else {
          // Tentar solicitar permissão novamente
          const newPermission = await savedHandle.requestPermission({ mode: 'read' });
          if (newPermission === 'granted') {
            setDirectoryHandle(savedHandle);
            await loadTracksFromDirectory(savedHandle);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar biblioteca salva:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Extrair metadados usando jsmediatags
  const extractMetadata = async (file: File): Promise<Partial<MusicTrack>> => {
    return new Promise((resolve) => {
      // @ts-ignore - jsmediatags é carregado via CDN
      if (typeof window.jsmediatags === 'undefined') {
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Artista Desconhecido',
          album: 'Álbum Desconhecido',
        });
        return;
      }

      // @ts-ignore
      window.jsmediatags.read(file, {
        onSuccess: (tag: any) => {
          const tags = tag.tags;
          let artwork: string | undefined;

          if (tags.picture) {
            const { data, format } = tags.picture;
            const byteArray = new Uint8Array(data);
            const blob = new Blob([byteArray], { type: format });
            artwork = URL.createObjectURL(blob);
          }

          resolve({
            title: tags.title || file.name.replace(/\.[^/.]+$/, ''),
            artist: tags.artist || 'Artista Desconhecido',
            album: tags.album || 'Álbum Desconhecido',
            artwork,
          });
        },
        onError: () => {
          resolve({
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Artista Desconhecido',
            album: 'Álbum Desconhecido',
          });
        },
      });
    });
  };

  // Carregar músicas de um diretório
  const loadTracksFromDirectory = async (handle: FileSystemDirectoryHandle) => {
    try {
      const musicFiles: MusicTrack[] = [];
      
      // @ts-ignore - values() existe mas pode não estar nos types
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const file = await (entry as FileSystemFileHandle).getFile();
          if (/\.(mp3|m4a|ogg|wav|flac)$/i.test(file.name)) {
            const metadata = await extractMetadata(file);
            musicFiles.push({
              file,
              name: file.name,
              url: URL.createObjectURL(file),
              title: metadata.title || file.name,
              artist: metadata.artist || 'Artista Desconhecido',
              album: metadata.album || 'Álbum Desconhecido',
              artwork: metadata.artwork,
            });
          }
        }
      }

      if (musicFiles.length === 0) {
        toast.error('Nenhum arquivo de áudio encontrado nesta pasta');
        return;
      }

      setTracks(musicFiles);
      toast.success(`${musicFiles.length} músicas carregadas da biblioteca`);
    } catch (error) {
      console.error('Erro ao carregar músicas:', error);
      toast.error('Erro ao carregar biblioteca de músicas');
    }
  };

  // Carregar músicas usando input tradicional (fallback)
  const loadTracksFromFiles = async (files: FileList) => {
    try {
      const musicFiles: MusicTrack[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (/\.(mp3|m4a|ogg|wav|flac)$/i.test(file.name)) {
          const metadata = await extractMetadata(file);
          musicFiles.push({
            file,
            name: file.name,
            url: URL.createObjectURL(file),
            title: metadata.title || file.name,
            artist: metadata.artist || 'Artista Desconhecido',
            album: metadata.album || 'Álbum Desconhecido',
            artwork: metadata.artwork,
          });
        }
      }

      if (musicFiles.length === 0) {
        toast.error('Nenhum arquivo de áudio encontrado');
        return;
      }

      setTracks(musicFiles);
      toast.success(`${musicFiles.length} músicas carregadas`);
    } catch (error) {
      console.error('Erro ao carregar músicas:', error);
      toast.error('Erro ao carregar arquivos de áudio');
    }
  };

  // Conectar nova biblioteca
  const connectLibrary = async () => {
    try {
      // Verificar se estamos em um iframe cross-origin (onde File System Access API não funciona)
      const isInIframe = window.self !== window.top;
      
      // @ts-ignore - showDirectoryPicker existe mas não está nos types padrão
      const hasFileSystemAccess = 'showDirectoryPicker' in window;

      // Se não está em iframe e tem suporte, tenta usar File System Access API
      if (!isInIframe && hasFileSystemAccess) {
        try {
          // @ts-ignore
          const handle = await window.showDirectoryPicker({
            mode: 'read',
          });

          // Salvar handle no IndexedDB
          const db = await initDB();
          await db.put(STORE_NAME, handle, 'directoryHandle');

          setDirectoryHandle(handle);
          await loadTracksFromDirectory(handle);
          return;
        } catch (fsError: any) {
          // Se falhar (ex: SecurityError em iframe), cai no fallback abaixo
          if (fsError.name === 'AbortError') {
            return; // Usuário cancelou
          }
          console.warn('File System Access API falhou, usando fallback:', fsError);
        }
      }

      // Fallback: usar input file tradicional
      const input = document.createElement('input');
      input.type = 'file';
      // @ts-ignore - webkitdirectory é suportado mas não está nos types
      input.webkitdirectory = true;
      input.multiple = true;
      input.accept = 'audio/*';
      
      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          await loadTracksFromFiles(target.files);
        }
      };
      
      input.click();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao conectar biblioteca:', error);
        toast.error('Erro ao conectar biblioteca de músicas');
      }
    }
  };

  // Desconectar biblioteca
  const disconnectLibrary = async () => {
    try {
      const db = await initDB();
      await db.delete(STORE_NAME, 'directoryHandle');
      setDirectoryHandle(null);
      setTracks([]);
      toast.info('Biblioteca desconectada');
    } catch (error) {
      console.error('Erro ao desconectar biblioteca:', error);
    }
  };

  // Recarregar biblioteca
  const reloadLibrary = async () => {
    if (directoryHandle) {
      await loadTracksFromDirectory(directoryHandle);
    }
  };

  // Carregar biblioteca salva na inicialização
  useEffect(() => {
    loadSavedDirectory();
  }, [loadSavedDirectory]);

  return {
    tracks,
    isLoading,
    isConnected: directoryHandle !== null || tracks.length > 0,
    connectLibrary,
    disconnectLibrary,
    reloadLibrary,
  };
};
