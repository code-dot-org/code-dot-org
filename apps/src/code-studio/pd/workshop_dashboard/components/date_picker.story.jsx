import React from 'react';
import moment from 'moment';
import DatePicker from './date_picker';
import {action} from '@storybook/addon-actions';

export default storybook => {
  return storybook
    .storiesOf('DatePicker', module)
    .addDecorator((story) => (
      // Currently the Bootstrap 3 styles required by React-Bootstrap are only applied inside div#workshop-container.
      // This is to prevent conflicts with other parts of Code Studio using Bootstrap 2.
      // See pd.scss. Without this container div it won't render properly.
      <div id="workshop-container" style={{width:300}}>
        {story()}
      </div>
    ))
    .add(
      'Basic',
      () => (
        <DatePicker
          date={moment()}
          onChange={action('changed')}
        />
      )
    )
    .add(
      'Clearable',
      () => (
        <DatePicker
          date={moment()}
          onChange={action('changed')}
          clearable
        />
      )
    );
};
