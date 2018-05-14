import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedVirtualizedDetailView} from '@cdo/apps/templates/sectionProgress/VirtualizedDetailView';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {getStore, registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import {Provider} from 'react-redux';

const studentData = [
  {id: 1, name: 'studentb'},
  {id: 3, name: 'studentc'},
  {id: 0, name: 'studenta'}
];

describe('VirtualizedSummaryView', () => {
  let defaultProps;

  beforeEach(() => {
    stubRedux();
    registerReducers({sectionProgress});
    defaultProps = {
      getLevels: () => {
        return [{id: 789, status: 'perfect'}];
      },
      lessonOfInterest: 1,
      section: {
        id: 1,
        script: {id: 123},
        students: studentData
      },
      scriptData: {
        id: 123,
        stages: [
          {
            id: 456,
            levels: [
              {id: 789}
            ],
          }
        ]
      },
      columnWidths: [150, 100],
      setLessonOfInterest: () => {},
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders a MultiGrid', () => {
    const wrapper = shallow(
      <UnconnectedVirtualizedDetailView
        {...defaultProps}
      />
    );
    expect(wrapper.find('MultiGrid').exists()).to.be.true;
  });

  it('renders a SectionProgressNameCell for each student', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <UnconnectedVirtualizedDetailView
          {...defaultProps}
        />
      </Provider>
    );
    const studentNames = wrapper.find('SectionProgressNameCell');
    expect(studentNames.at(0)).to.have.text(studentData[0].name);
    expect(studentNames.at(1)).to.have.text(studentData[1].name);
    expect(studentNames.at(2)).to.have.text(studentData[2].name);
  });

  it('renders a detail progress cell for each stage for each student', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <UnconnectedVirtualizedDetailView
          {...defaultProps}
        />
      </Provider>
    );
    expect(wrapper.find('StudentProgressDetailCell')).to.have.length(3);
  });
});
