import {useRef, useEffect} from 'react';

// This function is taken from the react docs as a way to mimic common componentDidMount logic
// see: https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
const usePrevious = value => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

export default usePrevious;
