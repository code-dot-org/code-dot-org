import React, {useState} from 'react';
import BehaviorBot from './BehaviorBot';

interface DanceContainerProps {
  danceState: any;
}

const DanceContainer: React.FunctionComponent<DanceContainerProps> = ({
  danceState,
}) => {
  const [startingTick, setStartingTick] = useState(new Date().getTime());
  const [currentTick, setCurrentTick] = useState(0);

  React.useEffect(() => {
    console.log(`initializing interval`);
    const interval = setInterval(() => {
      updateTime();
    }, 1000 / 60);

    return () => {
      console.log(`clearing interval`);
      clearInterval(interval);
    };
  }, []); // has no dependency - this will be called on-component-mount

  const updateTime = () => {
    setCurrentTick(new Date().getTime());
  };

  const tick = ((currentTick - startingTick) / 500) % 20;

  return (
    <div id="dance-container">
      <BehaviorBot currentTick={tick} danceState={danceState} />
      <div>{Math.floor(tick)}</div>
    </div>
  );
};

export default DanceContainer;
