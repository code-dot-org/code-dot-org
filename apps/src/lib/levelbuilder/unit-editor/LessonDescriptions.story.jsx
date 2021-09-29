import PropTypes from 'prop-types';
import React from 'react';
import LessonDescriptions from '@cdo/apps/lib/levelbuilder/unit-editor/LessonDescriptions';

const currentDescriptions = [
  {
    name: 'The Internet',
    descriptionStudent: 'This is what the student will see',
    descriptionTeacher: 'This is what the teacher will see'
  },
  {
    name: 'The Need for Addressing',
    descriptionStudent: 'This is what the student will see',
    descriptionTeacher: 'This is what the teacher will see'
  }
];

const importedDescriptions = [
  {
    name: 'The internet',
    descriptionStudent:
      'This is the new description of what the student will see',
    descriptionTeacher:
      'This is the new description of what the teacher will see'
  },
  {
    name: 'The Need for Addressing',
    descriptionStudent: 'This is what the student will see',
    descriptionTeacher: 'This is what the teacher will see'
  }
];

/**
 * Hack that gives us a ref to a child so that we can modify it's state;
 */
class ModifyState extends React.Component {
  static propTypes = {
    children: PropTypes.element
  };

  componentDidMount() {
    this.refs.child.setState(this.props);
  }

  render() {
    const child = this.props.children;
    return <child.type ref="child" {...child.props} />;
  }
}

export default storybook => {
  storybook.storiesOf('LessonDescriptions', module).addStoryTable([
    {
      name: 'collapsed lesson descriptions',
      story: () => (
        <LessonDescriptions
          scriptName="csd2"
          currentDescriptions={currentDescriptions}
          updateLessonDescriptions={() => console.log('update descriptions')}
        />
      )
    },
    {
      name: 'uncollapsed before import',
      story: () => (
        <ModifyState collapsed={false}>
          <LessonDescriptions
            scriptName="csd2"
            currentDescriptions={currentDescriptions}
            updateLessonDescriptions={() => console.log('update descriptions')}
          />
        </ModifyState>
      )
    },
    {
      name: 'While importing',
      story: () => (
        <ModifyState buttonText="Querying server..." collapsed={false}>
          <LessonDescriptions
            scriptName="csd2"
            currentDescriptions={currentDescriptions}
            updateLessonDescriptions={() => console.log('update descriptions')}
          />
        </ModifyState>
      )
    },
    {
      name: 'lesson descriptions with changes after merging',
      description:
        'Simulates one of the lessons being named slightly differently on CB',
      story: () => (
        <ModifyState
          collapsed={false}
          importedDescriptions={importedDescriptions}
          mismatchedLessons={['The internet']}
          buttonText="Imported"
        >
          <LessonDescriptions
            scriptName="csd2"
            currentDescriptions={currentDescriptions}
            updateLessonDescriptions={() => console.log('update descriptions')}
          />
        </ModifyState>
      )
    }
  ]);
};
