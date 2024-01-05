import React, {createContext, useContext, useState} from 'react';
import PropTypes from 'prop-types';
const AudioQueueContext = createContext();

export const AudioQueue = ({children}) => {
  const [audioQueue, setAudioQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playNextAudio = () => {
    if (audioQueue.length > 0) {
      const inlineAudio = audioQueue.shift();
      inlineAudio.playAudio().then(() => {
        setIsPlaying(true);
      });

      inlineAudio.addEventListener('ended', () => {
        setIsPlaying(false);
        playNextAudio();
      });
    } else {
      setIsPlaying(false);
    }
  };

  const addToQueue = inlineAudio => {
    setAudioQueue(prevQueue => [...prevQueue, inlineAudio]);

    if (!isPlaying) {
      playNextAudio();
    }
  };

  return (
    <AudioQueueContext.Provider value={{addToQueue}}>
      {children}
    </AudioQueueContext.Provider>
  );
};

AudioQueue.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAudioQueue = () => {
  return useContext(AudioQueueContext);
};
