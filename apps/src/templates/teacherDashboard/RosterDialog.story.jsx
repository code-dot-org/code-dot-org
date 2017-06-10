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
          <ExampleDialogButton />
        )
      }
    ]);
};
