import React, {useState} from 'react';
import EmojiIcon from '@cdo/apps/dance/ai/EmojiIcon';

const HomeTest: React.FunctionComponent = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <>
      <button
        type={'button'}
        onClick={() => {
          setCount(count + 1);
        }}
      />
      <h1>Ben {count}</h1>
      <EmojiIcon item={{id: 'cyclone', emoji: '🌀'}} />
    </>
  );
};

export default HomeTest;
