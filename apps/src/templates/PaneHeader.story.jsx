import React from 'react';
import PaneHeader, {PaneSection} from './PaneHeader';

const styles = {
  header: {
    borderLeft: "thick solid white",
    paddingLeft: 30,
    paddingRight: 30,
    color: 'white'
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between'
  }
};

export default storybook => {

  storybook
    .storiesOf('PaneHeaders with PaneSections', module)
    .addStoryTable([
      {
        name:'PaneHeader - has focus',
        story: () => (
          <PaneHeader hasFocus={true}>
            <div style={styles.flex}>
              <PaneSection style={styles.header}>
                <span>Section1</span>
              </PaneSection>
              <PaneSection style={styles.header}>
                <span>Section2</span>
              </PaneSection>
            </div>
          </PaneHeader>
        )
      },
      {
        name:'PaneHeader - does not have focus',
        story: () => (
          <PaneHeader hasFocus={false}>
            <div style={styles.flex}>
              <PaneSection style={styles.header}>
                <span>Section1</span>
              </PaneSection>
              <PaneSection style={styles.header}>
                <span>Section2</span>
              </PaneSection>
            </div>
          </PaneHeader>
        )
      },
      {
        name:'PaneHeader - teacher only',
        story: () => (
          <PaneHeader hasFocus={true} teacherOnly={true}>
            <div style={styles.flex}>
              <PaneSection style={styles.header}>
                <span>Section1</span>
              </PaneSection>
              <PaneSection style={styles.header}>
                <span>Section2</span>
              </PaneSection>
            </div>
          </PaneHeader>
        )
      },
    ]);
};
