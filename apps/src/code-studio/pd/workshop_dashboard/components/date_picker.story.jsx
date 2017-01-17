import React from 'react';
import moment from 'moment';
import DatePicker from './date_picker';

export default storybook => {
  return storybook
    .storiesOf('DatePicker', module)
    .add(
      'Basic',
      // Currently the Bootstrap 3 styles required by React-Bootstrap are only applied inside div#workshop-container.
      // This is to prevent conflicts with other parts of Code Studio using Bootstrap 2.
      // See pd.scss. Without this container div it won't render properly.
      () => (
        <div id="workshop-container">
          <DatePicker
            date={moment()}
            onChange={storybook.action('changed')}
          />
        </div>
      )
    );
};
