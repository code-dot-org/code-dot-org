import React, {useState} from 'react';

const HomeTest = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      />
      <h1>Benjamin Brooks {count}</h1>
    </>
  );
};

export default HomeTest;
