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
  <PaneHeader>
    <div style={styles.flex}>
      <PaneSection style={styles.header}>
        <span>Section1</span>
      </PaneSection>
      <PaneSection style={styles.header}>
        <span>Section2</span>
      </PaneSection>
      <PaneButton
        headerHasFocus={true}
        iconProps={{iconName: 'arrow-down', iconStyle: 'solid'}}
        label="Button"
        isRtl={false}
      />
    </div>
  </PaneHeader>
);

export const DoesNotHaveFocus = () => (
  <PaneHeader>
    <div style={styles.flex}>
      <PaneSection style={styles.header}>
        <span>Section1</span>
      </PaneSection>
      <PaneSection style={styles.header}>
        <span>Section2</span>
      </PaneSection>
      <PaneButton
        headerHasFocus={false}
        iconProps={{iconName: 'arrow-down', iconStyle: 'solid'}}
        label="Button"
        isRtl={false}
      />
    </div>
  </PaneHeader>
);

export const TeacherOnlyWithFocus = () => (
  <PaneHeader>
    <div style={styles.flex}>
      <PaneSection style={styles.header}>
        <span>Section1</span>
      </PaneSection>
      <PaneSection style={styles.header}>
        <span>Section2</span>
      </PaneSection>
      <PaneButton
        headerHasFocus={true}
        iconProps={{iconName: 'arrow-down', iconStyle: 'solid'}}
        label="Button"
        isRtl={false}
      />
    </div>
  </PaneHeader>
);

export const TeacherOnlyWithoutFocus = () => (
  <PaneHeader>
    <div style={styles.flex}>
      <PaneSection style={styles.header}>
        <span>Section1</span>
      </PaneSection>
      <PaneSection style={styles.header}>
        <span>Section2</span>
      </PaneSection>
      <PaneButton
        headerHasFocus={false}
        iconProps={{iconName: 'arrow-down', iconStyle: 'solid'}}
        label="Button"
        isRtl={false}
      />
    </div>
  </PaneHeader>
);

export const WithRTLAndLTRButtons = () => (
  <PaneHeader>
    <div style={styles.flex}>
      <PaneButton
        headerHasFocus={false}
        iconProps={{iconName: 'arrow-down', iconStyle: 'solid'}}
        label="ButtonRTL"
        isRtl={true}
      />
      <PaneButton
        headerHasFocus={false}
        iconProps={{iconName: 'arrow-down', iconStyle: 'solid'}}
        label="ButtonLTR"
        isRtl={false}
      />
    </div>
  </PaneHeader>
);
