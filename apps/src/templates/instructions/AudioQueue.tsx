import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';

interface InlineAudio {
  playAudio: () => void;
}

interface AudioQueueContextProps {
  addToQueue: (inlineAudio: InlineAudio) => void;
  playNextAudio: () => void;
  clearQueue: () => void;
  isPlaying: React.MutableRefObject<boolean>;
}

export const AudioQueueContext = createContext<AudioQueueContextProps>({
  addToQueue: () => {},
  playNextAudio: () => {},
  clearQueue: () => {},
  isPlaying: {current: false},
});

interface AudioQueueProps {
  children: ReactNode;
}

export const AudioQueue: React.FC<AudioQueueProps> = ({children}) => {
  const [audioQueue, setAudioQueue] = useState<InlineAudio[]>([]);
  const isPlaying = useRef<boolean>(false);

  const playNextAudio = useCallback(() => {
    if (audioQueue.length > 0) {
      const inlineAudio = audioQueue.shift();
      isPlaying.current = true;
      inlineAudio?.playAudio();
    }
  }, [audioQueue]);

  const addToQueue = useCallback((inlineAudio: InlineAudio) => {
    setAudioQueue(prevQueue => [...prevQueue, inlineAudio]);
  }, []);

  const clearQueue = useCallback(() => {
    setAudioQueue([]);
  }, []);

  useEffect(() => {
    if (!isPlaying.current) {
      playNextAudio();
    }
  }, [audioQueue, playNextAudio]);

  return (
    <AudioQueueContext.Provider
      value={{addToQueue, playNextAudio, clearQueue, isPlaying}}
    >
      {children}
    </AudioQueueContext.Provider>
  );
};
