import React, {useState} from 'react';
import SequenceBot from './SequenceBot';

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface DanceContainerProps {
  danceState: any;
}

const bots: any[] = [];
for (var i = 0; i < 8; i++) {
  bots[i] = {
    body: getRandomInt(0, 9),
    head: getRandomInt(0, 6),
  };
}

const DanceContainer: React.FunctionComponent<DanceContainerProps> = ({
  danceState,
}) => {
  const [startingTick, setStartingTick] = useState(new Date().getTime());
  const [currentTick, setCurrentTick] = useState(new Date().getTime());

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
      <div style={{display: 'flex', gap: 10, width: '100%', flexWrap: 'wrap'}}>
        {bots.map((bot, index) => {
          return (
            <SequenceBot
              key={index}
              currentTick={tick}
              danceState={danceState}
              showTimeline={false}
              variations={bot}
            />
          );
        })}
      </div>

      <SequenceBot
        currentTick={tick}
        danceState={danceState}
        showTimeline={true}
        variations={bots[0]}
      />

      <div>{Math.floor(tick)}</div>
    </div>
  );
};

export default DanceContainer;
