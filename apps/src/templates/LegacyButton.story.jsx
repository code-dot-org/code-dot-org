import React from 'react';
import LegacyButton, {BUTTON_TYPES, style} from './LegacyButton';
import { withInfo } from '@storybook/addon-info';

const docs = {
  "default": 'Use for actions that don\'t need to be the focus of the page',
  cancel: 'Use to cancel an action, e.g. in a modal dialog',
  primary: 'Use to identify primary action in a set of buttons',
  danger: 'Use for destructive actions or actions with serious repercussions, e.g. deleting data',
  action: 'Use to provide differentiated visual weight for secondary actions',
};

export default storybook => {
  storybook
    .storiesOf('LegacyButton', module)
    .add(
      'overview',
      withInfo('')(() =>
        <div>
          <h1>Intro</h1>
          <p>
            LegacyButtons come in many different shapes and sizes! Some aspects of buttons
            that are worth mentioning:
          </p>
          <ul>
            <li>They have a min width of {`${style.base.minWidth}px`}</li>
            <li>
              They come in a number of different semantic styles:{' '}
              {Object.keys(BUTTON_TYPES).join(', ')}
            </li>
          </ul>
          <h1>Types</h1>
          <table style={{backgroundColor: 'white', textAlign: 'center'}}>
            <thead>
            <tr>
              <th>Type</th>
              <th style={{width: 300}}>Usage</th>
              <th>Appearance</th>
              <th>Large Size</th>
              <th>Left arrow</th>
              <th>Right arrow</th>
            </tr>
            </thead>
            <tbody>
            {Object.keys(BUTTON_TYPES).map(type => (
               <tr key={type}>
                 <td>{type}</td>
                 <td style={{textAlign: 'left'}}>{docs[type]}</td>
                 <td><LegacyButton type={type}>{type}</LegacyButton></td>
                 <td><LegacyButton type={type} size="large">{type}</LegacyButton></td>
                 <td>
                   <LegacyButton type={type} size="large" arrow="left">{type}</LegacyButton>
                 </td>
                 <td>
                   <LegacyButton type={type} size="large" arrow="right">{type}</LegacyButton>
                 </td>
               </tr>
             ))}
            </tbody>
          </table>
        </div>
      )
    );
};
