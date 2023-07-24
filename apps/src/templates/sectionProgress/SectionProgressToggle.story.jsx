import React from 'react';
import {UnconnectedSectionProgressToggle as SectionProgressToggle} from './SectionProgressToggle';
import {ViewType} from './sectionProgressConstants';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

export default {
  title: 'SectionProgressToggle',
  component: SectionProgressToggle,
};

const Template = args => {
  const store = createStore(
    combineReducers({
      isRtl,
    })
  );

  return (
    <Provider store={store}>
      <SectionProgressToggle
        setCurrentView={() => console.log('Toggle view.')}
        scriptId={1}
        {...args}
      />
    </Provider>
  );
};

export const SummaryView = Template.bind({});
SummaryView.args = {currentView: ViewType.SUMMARY};

export const DetailsView = Template.bind({});
DetailsView.args = {currentView: ViewType.DETAIL};

export const StandardsView = Template.bind({});
StandardsView.args = {
  currentView: ViewType.STANDARDS,
  showStandardsToggle: true,
};
