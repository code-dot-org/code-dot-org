import React from 'react';
import PublicKeyCryptographyWidget from './PublicKeyCryptographyWidget';
import AliceInstructions from './AliceInstructions';
import EveInstructions from './EveInstructions';
import BobInstructions from './BobInstructions';

// Stylesheet that adjusts integer dropdown styles
import '@cdo/apps/../style/publicKeyCryptography/publicKeyCryptography.scss';

export default storybook => {
  storybook
    .storiesOf('Public Key Cryptography Widget', module)
    .withReduxStore()
    .add('Characters view', () => <PublicKeyCryptographyWidget />)
    .add(`Alice's Instructions`, () => <AliceInstructions />)
    .add(`Eve's Instructions`, () => <EveInstructions />)
    .add(`Bob's Instructions`, () => <BobInstructions />);
};
