import {useRef} from 'react';
type PerformanceBucket = {[key: string]: unknown};

/**
 * This is a debugging hook and should **never** be used in production.
 * (It's not particularly harmful to use it, but it's not beneficial)
 *
 * In a react component, it's important not to change props/state values unless necessary, so as to prevent unnecessary re-renders.
 * But those changes can sometimes be difficult to track down. This hook comes to the rescue. Hand it an object with th values you
 * want to monitor, and it will log out to the screen (in a group). Optionally, give a name to the component in the second argument.
 *
 * Then use this data to figure out what values you need to memoize or put in a callback or otherwise not change so as to improve
 * your rendering performance.
 *
 * Delete it before committing, please.
 *
 * @param params An object containing key-value pairs representing the props to track.
 *   - Key: The name of the prop.
 *   - Value: The initial value of the prop.
 * @param component (optional) The name of the component where the performance is being measured. Defaults to "unnamed component".
 *
 * @example
 * ```tsx
 * import { useRef } from 'react';
 * import { usePerformance } from './usePerformance'; // Assuming usePerformance is exported

 * function MyComponent( { someProp, anotherProp, thirdProp} ) {
 *
 *   // will log out when these values change
 *   usePerformance({ someProp, anotherProp, thirdProp }, "My Cool Component");

 *   // ... component logic

 *   return (
 *     // ... JSX
 *   );
 * }
 * ```
 */
export const usePerformance = (
  params: PerformanceBucket,
  component: string = 'unnamed component'
) => {
  const bucket = useRef<PerformanceBucket>({});
  console.group(`performance check on ${component}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== bucket.current[key]) {
      console.log(
        `${key} ${bucket.current[key] === undefined ? 'added' : 'changed'}!`
      );
      bucket.current[key] = params[key];
    } else {
      console.log(`${key} is unchanged`);
    }
  });
  console.groupEnd();
};
