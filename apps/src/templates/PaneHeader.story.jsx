import React from 'react';
import PaneHeader, {PaneSection, PaneButton} from './PaneHeader';

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
              <PaneButton
                headerHasFocus={false}
                iconClass="fa fa-arrow-down"
                label="Button"
                isRtl={false}
              />
            </div>
          </PaneHeader>
        )
      },
      {
        name:'PaneHeader - does not have focus',
        story: () => (
          <PaneHeader
            hasFocus={false}
          >
            <div style={styles.flex}>
              <PaneSection style={styles.header}>
                <span>Section1</span>
              </PaneSection>
              <PaneSection style={styles.header}>
                <span>Section2</span>
              </PaneSection>
              <PaneButton
                headerHasFocus={false}
                iconClass="fa fa-arrow-down"
                label="Button"
                isRtl={false}
              />
            </div>
          </PaneHeader>
        )
      },
      {
        name:'PaneHeader - teacher only',
        story: () => (
          <PaneHeader
            hasFocus={true}
            teacherOnly={true}
          >
            <div style={styles.flex}>
              <PaneSection style={styles.header}>
                <span>Section1</span>
              </PaneSection>
              <PaneSection style={styles.header}>
                <span>Section2</span>
              </PaneSection>
              <PaneButton
                headerHasFocus={false}
                iconClass="fa fa-arrow-down"
                label="Button"
                isRtl={false}
              />
            </div>
          </PaneHeader>
        )
      },
      {
        name:'PaneHeader - teacher only, does not have focus',
        story: () => (
          <PaneHeader
            hasFocus={false}
            teacherOnly={true}
          >
            <div style={styles.flex}>
              <PaneSection style={styles.header}>
                <span>Section1</span>
              </PaneSection>
              <PaneSection style={styles.header}>
                <span>Section2</span>
              </PaneSection>
              <PaneButton
                headerHasFocus={false}
                iconClass="fa fa-arrow-down"
                label="Button"
                isRtl={false}
              />
            </div>
          </PaneHeader>
        )
      },
      {
        name:'PaneHeader - with RTL and LTR buttons',
        story: () => (
          <PaneHeader
            hasFocus={false}
            teacherOnly={true}
          >
            <div style={styles.flex}>
              <PaneButton
                headerHasFocus={false}
                iconClass="fa fa-arrow-down"
                label="ButtonRTL"
                isRtl={true}
              />
              <PaneButton
                headerHasFocus={false}
                iconClass="fa fa-arrow-down"
                label="ButtonLTR"
                isRtl={false}
              />
            </div>
          </PaneHeader>
        )
      },
    ]);
};
