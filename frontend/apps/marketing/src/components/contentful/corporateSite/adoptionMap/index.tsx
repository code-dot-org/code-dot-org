// Export the Component Definition for use in Contentful Studio
import {Suspense} from 'react';

export {AdoptionMapContentfulComponentDefinition} from './AdoptionMapContentfulDefinition';
import AdoptionMap, {AdoptionMapMapProps} from './AdoptionMap';

const AdoptionMapSuspense = (props: AdoptionMapMapProps) => {
  return (
    <Suspense fallback={<div aria-live="polite">Loading adoption map...</div>}>
      <AdoptionMap {...props} />
    </Suspense>
  );
};

export default AdoptionMapSuspense;
