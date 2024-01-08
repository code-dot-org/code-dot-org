import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

export const AudioQueueContext = createContext();

export const AudioQueue = ({children}) => {
  const [audioQueue, setAudioQueue] = useState([]);
  const isPlaying = useRef(false);

  const playNextAudio = useCallback(() => {
    if (audioQueue.length > 0) {
      const inlineAudio = audioQueue.shift();
      inlineAudio.playAudio().then(() => {
        isPlaying.current = true;
      });
    }
    isPlaying.current = false;
  }, [audioQueue]);

  const addToQueue = inlineAudio => {
    setAudioQueue(prevQueue => [...prevQueue, inlineAudio]);
  };

  const clearQueue = () => {
    setAudioQueue([]);
    isPlaying.current = false;
  };

  useEffect(() => {
    if (!isPlaying.current) {
      playNextAudio();
    }
  }, [audioQueue, playNextAudio]);

  return (
    <AudioQueueContext.Provider value={{addToQueue, playNextAudio, clearQueue}}>
      {children}
    </AudioQueueContext.Provider>
  );
};

AudioQueue.propTypes = {
  children: PropTypes.node.isRequired,
};
