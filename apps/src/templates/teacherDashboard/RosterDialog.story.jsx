import React from 'react';
import RosterDialog from './RosterDialog';

const ExampleDialogButton = React.createClass({
  render() {
    return (
      <div>
        <RosterDialog
          isOpen={!!this.state && this.state.open}
          handleClose={() => this.setState({open: false})}
          {...this.props}
        />
        <button onClick={() => this.setState({open: true})}>
          Open the example dialog
        </button>
      </div>
    );
  }
});

export default storybook => {
  return storybook
    .storiesOf('RosterDialog', module)
    .addStoryTable([
      {
        name: 'Select a Classroom',
        description: 'Dialog for choosing a Google Classroom from the API.',
        story: () => (
          <ExampleDialogButton
            classrooms={[
              {id: '123', name: 'New Test Classroom', section: 'Section 1', enrollment_code: '19uag24'},
              {id: '456', name: 'Other Test Classroom', section: 'Section 3A', enrollment_code: 't108sh5'},
              {id: '101', name: 'Intro to CS', section: 'Section A', enrollment_code: 'rt508yg'},
              {id: '102', name: 'Intro to CS', section: 'Section B', enrollment_code: '12gjl42'},
            ]}
          />
        )
      },
      {
        name: 'Classrooms loading',
        description: 'Dialog shown when data is loading from the API.',
        story: () => (
          <ExampleDialogButton />
        )
      },
      {
        name: 'No classrooms found',
        description: 'Dialog shown when no Google Classrooms are returned from the API.',
        story: () => (
          <ExampleDialogButton classrooms={[]} />
        )
      }
    ]);
};
