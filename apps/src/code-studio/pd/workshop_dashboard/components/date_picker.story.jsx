import React from 'react';
import moment from 'moment';
import DatePicker from './date_picker';
import {action} from '@storybook/addon-actions';
import {reduxStore} from '@cdo/storybook/decorators';
import {Provider} from 'react-redux';

export default {
  title: 'WorkshopDashboard/DatePicker',
  component: DatePicker,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <div id="workshop-container" style={{width: 300}}>
      <DatePicker {...args} />
    </div>
  </Provider>
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
