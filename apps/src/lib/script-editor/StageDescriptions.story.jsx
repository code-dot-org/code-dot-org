import React from 'react';
import StageDescriptions from './StageDescriptions';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '4px 6px',
  color: '#555',
  border: '1px solid #ccc',
  borderRadius: 4
};

const currentByStage = {
  'The Internet': {
    studentDescription: 'This is what the student will see',
    teacherDescription: 'This is what the teacher will see'
  },
  'The Need for Addressing': {
    studentDescription: 'This is what the student will see',
    teacherDescription: 'This is what the teacher will see'
  }
};

const importedByStage={
  'The Internet': {
    studentDescription: 'This is the new description of what the student will see',
    teacherDescription: 'This is the new description of what the teacher will see'
  },
  'The Need for Addressing': {
    studentDescription: 'This is what the student will see',
    teacherDescription: 'This is what the teacher will see'
  }
};

/**
 * Hack that gives us a ref to a child so that we can modify it's state;
 */
const ModifyState = React.createClass({
  propTypes: {
    children: React.PropTypes.element,
  },

  componentDidMount() {
    this.refs.child.setState(this.props);
  },

  render() {
    const child = this.props.children;
    return <child.type ref="child" {...child.props}/>;
  }
});


export default storybook => {
  storybook
    .storiesOf('StageDescriptions', module)
    .addStoryTable([
      {
        name:'stage descriptions',
        story: () => (
          <StageDescriptions
            inputStyle={inputStyle}
            currentByStage={currentByStage}
          />
        )
      },
      {
        name:'While merging',
        story: () => (
          <ModifyState isImporting={true}>
            <StageDescriptions
              inputStyle={inputStyle}
              currentByStage={currentByStage}
            />
          </ModifyState>
        )
      },
      {
        name:'stage descriptions with changes after merging',
        story: () => (
          <ModifyState
            importedByStage={importedByStage}
            hasImported={true}
          >
            <StageDescriptions
              inputStyle={inputStyle}
              currentByStage={currentByStage}
            />
          </ModifyState>
        )
      }
    ]);
};
