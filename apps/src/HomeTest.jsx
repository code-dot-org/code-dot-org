import React, {useState} from 'react';
import EmojiIcon from '@cdo/apps/dance/ai/EmojiIcon';
window.EmojiIcon = require('@cdo/apps/dance/ai/EmojiIcon');

const HomeTest = () => {
  // const HomeTest: React.FunctionComponent = () => {
  //   const [count, setCount] = useState<number>(0);
  const [count, setCount] = useState(0);

  return (
    <>
      <button
        type={'button'}
        onClick={() => {
          setCount(count + 1);
        }}
      />
      <h1>Seth {count}</h1>
      <EmojiIcon item={{id: 'cyclone', emoji: '🌀'}} />
    </>
  );
};

export default HomeTest;
