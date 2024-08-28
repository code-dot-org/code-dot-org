import React from 'react';

import PaneHeader, {PaneSection, PaneButton} from './PaneHeader';

const styles = {
  header: {
    borderLeft: 'thick solid white',
    paddingLeft: 30,
    paddingRight: 30,
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};

export default {
  component: PaneHeader,
};

export const HasFocus = () => (
  <PaneHeader hasFocus={true}>
    <div style={styles.flex}>
      <PaneSection style={styles.header}>
        <span>Section1</span>
      </PaneSection>
      <PaneSection style={styles.header}>
        <span>Section2</span>
      </PaneSection>
      <PaneButton
        headerHasFocus={true}
        iconClass="fa fa-arrow-down"
        label="Button"
        isRtl={false}
      />
    </div>
  </PaneHeader>
);

export const DoesNotHaveFocus = () => (
  <PaneHeader hasFocus={false}>
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
);

export const TeacherOnlyWithFocus = () => (
  <PaneHeader hasFocus={true} teacherOnly={true}>
    <div style={styles.flex}>
      <PaneSection style={styles.header}>
        <span>Section1</span>
      </PaneSection>
      <PaneSection style={styles.header}>
        <span>Section2</span>
      </PaneSection>
      <PaneButton
        headerHasFocus={true}
        iconClass="fa fa-arrow-down"
        label="Button"
        isRtl={false}
      />
    </div>
  </PaneHeader>
);

export const TeacherOnlyWithoutFocus = () => (
  <PaneHeader hasFocus={false} teacherOnly={true}>
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
);

export const WithRTLAndLTRButtons = () => (
  <PaneHeader hasFocus={false} teacherOnly={true}>
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
);
