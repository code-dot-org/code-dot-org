import React, {PropTypes} from 'react';
import StageDescriptions from './StageDescriptions';

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
    descriptionStudent: 'This is the new description of what the student will see',
    descriptionTeacher: 'This is the new description of what the teacher will see'
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
    children: PropTypes.element,
  };

  componentDidMount() {
    this.refs.child.setState(this.props);
  }

  render() {
    const child = this.props.children;
    return <child.type ref="child" {...child.props}/>;
  }
}

export default storybook => {
  storybook
    .storiesOf('StageDescriptions', module)
    .addStoryTable([
      {
        name:'collapsed stage descriptions',
        story: () => (
          <StageDescriptions
            scriptName="csd2"
            currentDescriptions={currentDescriptions}
          />
        )
      },
      {
        name:'uncollapsed before import',
        story: () => (
          <ModifyState collapsed={false}>
            <StageDescriptions
              scriptName="csd2"
              currentDescriptions={currentDescriptions}
            />
          </ModifyState>
        )
      },
      {
        name:'While importing',
        story: () => (
          <ModifyState
            buttonText="Querying server..."
            collapsed={false}
          >
            <StageDescriptions
              scriptName="csd2"
              currentDescriptions={currentDescriptions}
            />
          </ModifyState>
        )
      },
      {
        name:'stage descriptions with changes after merging',
        description: 'Simulates one of the stages being named slightly differently on CB',
        story: () => (
          <ModifyState
            collapsed={false}
            importedDescriptions={importedDescriptions}
            mismatchedStages={['The internet']}
            buttonText="Imported"
          >
            <StageDescriptions
              scriptName="csd2"
              currentDescriptions={currentDescriptions}
            />
          </ModifyState>
        )
      }
    ]);
};
