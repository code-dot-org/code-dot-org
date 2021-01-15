import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import color from '@cdo/apps/util/color';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';

const defaultProps = {
  level: {
    id: '1',
    levelNumber: 1,
    status: LevelStatus.perfect,
    url: '/foo/bar',
    name: 'level_name',
    progression: 'progression_name',
    progressionDisplayName: 'progression_display_name'
  },
  disabled: false
};

describe('ProgressBubble', () => {
  it('renders an anchor tag when we have a url', () => {
    const wrapper = shallow(<ProgressBubble {...defaultProps} />);

    assert(wrapper.is('a'));
  });

  it('does not render an anchor tag when we have no url', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          url: ''
        }}
      />
    );

    assert(wrapper.is('div'));
  });

  it('does not render an anchor tag if we are disabled', () => {
    const wrapper = shallow(
      <ProgressBubble {...defaultProps} disabled={true} />
    );

    assert(wrapper.is('div'));
  });

  it('shows letter in bubble when level has a letter', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          letter: 'a'
        }}
      />
    );

    expect(wrapper.find('#test-bubble-letter')).to.have.lengthOf(1);
  });

  it('has a green background when we have perfect status and not assessment', () => {
    const wrapper = shallow(<ProgressBubble {...defaultProps} />);

    const tooltipDiv = wrapper.find('div').at(1);
    const div = tooltipDiv.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_perfect);
  });

  it('has a purple background when level status is LevelStatus.completed_assessment, is an assessment level ', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          kind: LevelKind.assessment,
          status: LevelStatus.completed_assessment
        }}
      />
    );

    const tooltipDiv = wrapper.find('div').at(1);
    const div = tooltipDiv.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_submitted);
  });

  it('has a white background when we are disabled', () => {
    const wrapper = shallow(
      <ProgressBubble {...defaultProps} disabled={true} />
    );

    const tooltipDiv = wrapper.find('div').at(1);
    const div = tooltipDiv.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_not_tried);
  });

  it('has green border and white background for in progress level', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          status: LevelStatus.attempted
        }}
      />
    );
    const tooltipDiv = wrapper.find('div').at(1);
    const div = tooltipDiv.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_not_tried);
    assert.equal(div.props().style.borderColor, color.level_perfect);
  });

  it('has a green border and light green background for too many blocks level', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          status: LevelStatus.passed
        }}
      />
    );
    const tooltipDiv = wrapper.find('div').at(1);
    const div = tooltipDiv.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_passed);
    assert.equal(div.props().style.borderColor, color.level_perfect);
  });

  it('has a purple background for submitted level', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          kind: LevelKind.assessment,
          status: LevelStatus.submitted
        }}
      />
    );
    const tooltipDiv = wrapper.find('div').at(1);
    const div = tooltipDiv.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_submitted);
    assert.equal(div.props().style.borderColor, color.level_submitted);
    assert.equal(div.props().style.color, color.white);
  });

  it('has a red background for review_rejected', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          kind: LevelKind.peer_review,
          status: LevelStatus.review_rejected
        }}
      />
    );
    const tooltipDiv = wrapper.find('div').at(1);
    const div = tooltipDiv.find('div').at(1);
    assert.equal(
      div.props().style.backgroundColor,
      color.level_review_rejected
    );
    assert.equal(div.props().style.borderColor, color.level_review_rejected);
    assert.equal(div.props().style.color, color.white);
  });

  it('has a green background for review_accepted', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          kind: LevelKind.peer_review,
          status: LevelStatus.review_accepted
        }}
      />
    );
    const tooltipDiv = wrapper.find('div').at(1);
    const div = tooltipDiv.find('div').at(1);
    assert.equal(div.props().style.backgroundColor, color.level_perfect);
    assert.equal(div.props().style.borderColor, color.level_perfect);
    assert.equal(div.props().style.color, color.white);
  });

  it('renders a diamond for concept levels', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          isConceptLevel: true
        }}
      />
    );
    const tooltipDiv = wrapper.find('div').at(1);
    const div = tooltipDiv.find('div').at(1);
    assert.equal(div.props().style.transform, 'rotate(45deg)');
  });

  it('renders a small diamond for concept levels when smallBubble is true ', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        smallBubble={true}
        level={{
          ...defaultProps.level,
          isConceptLevel: true
        }}
      />
    );
    const tooltipDiv = wrapper.find('div').at(1);
    const div = tooltipDiv.find('div').at(1);
    assert.equal(div.props().style.transform, 'rotate(45deg)');
    assert.equal(div.props().style.borderRadius, 2);
  });

  it('uses name when specified', () => {
    const wrapper = shallow(<ProgressBubble {...defaultProps} />);
    assert.equal(wrapper.find('TooltipWithIcon').props().text, '1. level_name');
  });

  it('uses progression display name when no name is specified', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          name: ''
        }}
      />
    );
    assert.equal(
      wrapper.find('TooltipWithIcon').props().text,
      '1. progression_display_name'
    );
  });

  it('renders a small bubble if smallBubble is true', () => {
    const wrapper = shallow(
      <ProgressBubble {...defaultProps} smallBubble={true} />
    );
    const tooltipDiv = wrapper.find('div').at(1);
    assert.equal(
      tooltipDiv
        .find('div')
        .at(1)
        .props().style.width,
      9
    );
  });

  it('shows assessment icon on assessment level', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={{
          ...defaultProps.level,
          kind: LevelKind.assessment
        }}
      />
    );

    expect(wrapper.find('SmallAssessmentIcon')).to.have.lengthOf(1);
  });

  it('does not show assessment icon on bubble on assessment level, if smallBubble is true', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        smallBubble={true}
        level={{
          ...defaultProps.level,
          kind: LevelKind.assessment
        }}
      />
    );

    expect(wrapper.find('SmallAssessmentIcon')).to.have.lengthOf(0);
  });

  it('does not show assessment icon on bubble on assessment level if hideAssessmentIcon is true', () => {
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        hideAssessmentIcon={true}
        level={{
          ...defaultProps.level,
          kind: LevelKind.assessment
        }}
      />
    );

    expect(wrapper.find('SmallAssessmentIcon')).to.have.lengthOf(0);
  });

  it('renders a progress pill for unplugged lessons', () => {
    const unpluggedLevel = {
      id: '1',
      status: LevelStatus.perfect,
      kind: LevelKind.unplugged,
      url: '/foo/bar',
      isUnplugged: true
    };
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={unpluggedLevel}
        smallBubble={false}
      />
    );
    assert.equal(wrapper.find('ProgressPill').length, 1);
    assert(!!wrapper.find('ProgressPill').props().tooltip);
  });

  it('does not render a progress pill for unplugged when small', () => {
    const unpluggedLevel = {
      id: '1',
      status: LevelStatus.perfect,
      kind: LevelKind.unplugged,
      url: '/foo/bar',
      isUnplugged: true
    };
    const wrapper = shallow(
      <ProgressBubble
        {...defaultProps}
        level={unpluggedLevel}
        smallBubble={true}
      />
    );
    assert.equal(wrapper.find('ProgressPill').length, 0);
  });

  describe('href', () => {
    let fakeLocation;

    beforeEach(() => {
      fakeLocation = document.createElement('a');
    });

    it('links to the level url', () => {
      fakeLocation.href = 'http://studio.code.org/s/csd3-2019/stage/3/puzzle/7';
      const wrapper = shallow(
        <ProgressBubble
          {...defaultProps}
          currentLocation={fakeLocation}
          level={{
            ...defaultProps.level,
            url: '/my/test/url'
          }}
        />
      );
      assert.equal(wrapper.find('a').prop('href'), '/my/test/url');
    });

    it('includes the section_id in the queryparams if selectedSectionId is present', () => {
      fakeLocation.href = 'http://studio.code.org/s/csd3-2019/stage/3/puzzle/7';
      const wrapper = shallow(
        <ProgressBubble
          {...defaultProps}
          currentLocation={fakeLocation}
          selectedSectionId="12345"
        />
      );
      assert.include(wrapper.find('a').prop('href'), 'section_id=12345');
    });

    it('includes the user_id in the queryparams if selectedStudentId is present', () => {
      fakeLocation.href = 'http://studio.code.org/s/csd3-2019/stage/3/puzzle/7';
      const wrapper = shallow(
        <ProgressBubble
          {...defaultProps}
          currentLocation={fakeLocation}
          selectedSectionId="12345"
          selectedStudentId="207"
        />
      );
      assert.include(wrapper.find('a').prop('href'), 'user_id=207');
    });

    it('preserves the queryparams of the current location', () => {
      fakeLocation.href =
        'http://studio.code.org/s/csd3-2019/stage/3/puzzle/7?section_id=212&user_id=559';
      const wrapper = shallow(
        <ProgressBubble {...defaultProps} currentLocation={fakeLocation} />
      );
      const href = wrapper.find('a').prop('href');
      assert.include(href, 'section_id=212');
      assert.include(href, 'user_id=559');
    });

    it('if queryParam section_id and selectedSectionId are present, selectedSectionId wins', () => {
      fakeLocation.href =
        'http://studio.code.org/s/csd3-2019/stage/3/puzzle/7?section_id=212&user_id=559';
      const wrapper = shallow(
        <ProgressBubble
          {...defaultProps}
          currentLocation={fakeLocation}
          selectedSectionId="12345"
        />
      );
      const href = wrapper.find('a').prop('href');
      assert.notInclude(href, 'section_id=212');
      assert.include(href, 'section_id=12345');
      assert.include(href, 'user_id=559');
    });
  });

  describe('currentLocation', () => {
    // The currentLocation prop exists to provide a testing hook for functionality
    // that depends on the window.location global.
    it('defaults to window.location if not provided', () => {
      assert.notProperty(defaultProps, 'currentLocation');
      const wrapper = shallow(<ProgressBubble {...defaultProps} />);
      assert.strictEqual(
        wrapper.instance().props.currentLocation,
        window.location
      );
    });

    it('can be explicitly set to an anchor object', () => {
      const fakeLocation = document.createElement('a');
      fakeLocation.href =
        'http://studio.code.org/s/csd3-2019/stage/3/puzzle/7?section_id=212&user_id=559';
      const wrapper = shallow(
        <ProgressBubble {...defaultProps} currentLocation={fakeLocation} />
      );
      assert.strictEqual(
        wrapper.instance().props.currentLocation,
        fakeLocation
      );
    });
  });
});
