import React from 'react';
import moment from 'moment';
import DatePicker from './date_picker';
import {action} from '@storybook/addon-actions';

export default {
  component: DatePicker,
};

const Template = args => (
  // Currently the Bootstrap 3 styles required by React-Bootstrap are
  // only applied inside div#workshop-container.
  // This is to prevent conflicts with other parts of Code Studio using Bootstrap 2.
  // See pd.scss. Without this container div it won't render properly.
  <div id="workshop-container" style={{width: 300}}>
    <DatePicker {...args} />
  </div>
);

export const Basic = Template.bind({});
Basic.args = {
  date: moment(),
  onChange: action('changed'),
};

export const Clearable = Template.bind({});
Clearable.args = {
  date: moment(),
  onChange: action('changed'),
  clearable: true,
};
