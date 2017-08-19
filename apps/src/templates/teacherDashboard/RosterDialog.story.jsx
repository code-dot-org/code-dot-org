import React from 'react';
import {UnconnectedRosterDialog as RosterDialog} from './RosterDialog';
import { OAuthSectionTypes } from './shapes';

const ExampleDialogButton = React.createClass({
  render() {
    return (
      <div>
        <RosterDialog
          isOpen={!!this.state && this.state.open}
          handleImport={() => this.setState({open: false})}
          handleCancel={() => this.setState({open: false})}
          studioUrl=""
          provider={OAuthSectionTypes.google_classroom}
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
        name: 'No Google Classrooms found',
        description: 'Dialog shown when no Google Classrooms are returned from the API.',
        story: () => (
          <ExampleDialogButton classrooms={[]} />
        )
      },
      {
        name: 'Failed to load classrooms',
        description: 'Dialog shown when an error is returned from the API.',
        story: () => (
          <ExampleDialogButton loadError={{status: 403, message: 'Sample error message.'}} />
        )
      },
      {
        name: 'Clever Classroom',
        description: 'Dialog for choosing a Clever section from the API.',
        story: () => (
          <ExampleDialogButton
            provider={OAuthSectionTypes.clever}
            classrooms={[
              {id: '123', name: 'New Test Classroom', section: '321', enrollment_code: '1000'},
              {id: '456', name: 'Other Test Classroom', section: '3A', enrollment_code: '1001'},
              {id: '101', name: 'Intro to CS', section: '45', enrollment_code: '1002'},
              {id: '102', name: 'Intro to CS', section: '55', enrollment_code: '1003'},
            ]}
          />
        )
      },
      {
        name: 'No Clever sections found',
        description: 'Dialog shown when no Clever sections are returned from the API.',
        story: () => (
          <ExampleDialogButton
            provider={OAuthSectionTypes.clever}
            classrooms={[]}
          />
        )
      },
    ]);
};
