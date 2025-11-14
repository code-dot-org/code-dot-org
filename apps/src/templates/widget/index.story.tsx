import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Widget from './index';

export default {
  component: Widget,
} as Meta;

const Template: StoryFn<typeof Widget> = args => (
  <Widget
    {...args}
    onRefresh={() => alert('Refresh clicked!')}
    onSettings={() => alert('Settings clicked!')}
  />
);

export const BasicWidget = Template.bind({});
BasicWidget.args = {
  title: 'Basic Widget',
  children: 'This is a basic widget with simple text content',
};

export const StudentProgressWidget = Template.bind({});
StudentProgressWidget.args = {
  title: 'Student Progress',
  children: (
    <div className="text-black space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium">Completed:</span>
        <span className="text-green-700 font-bold">24/30</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium">In Progress:</span>
        <span className="text-yellow-700 font-bold">4/30</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium">Not Started:</span>
        <span className="text-red-700 font-bold">2/30</span>
      </div>
    </div>
  ),
};

export const AssignmentOverviewWidget = Template.bind({});
AssignmentOverviewWidget.args = {
  title: 'Assignment Overview',
  children: (
    <div className="text-black space-y-2">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="font-semibold text-sm">Math Quiz</h4>
        <p className="text-xs text-gray-700">Due: Today</p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="font-semibold text-sm">Science Lab Report</h4>
        <p className="text-xs text-gray-700">Due: Tomorrow</p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="font-semibold text-sm">Reading Assignment</h4>
        <p className="text-xs text-gray-700">Due: Friday</p>
      </div>
    </div>
  ),
};
