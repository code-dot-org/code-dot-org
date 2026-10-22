import {render} from '@testing-library/react';
import React from 'react';

import LabShell from '@cdo/apps/p5lab/spritelab/lab2/views/components/LabShell';

import styles from '@cdo/apps/p5lab/spritelab/lab2/views/sprite-lab2-view.module.scss';

const order = () =>
  Array.from(document.querySelector(`.${styles.tabShell}`)!.children).map(el =>
    el.classList.contains(styles.tabContainer) ? 'bar' : 'content'
  );

describe('LabShell', () => {
  it('puts the bar over the workspace', () => {
    render(<LabShell sceneTabs="tabs">body</LabShell>);
    expect(order()).toEqual(['bar', 'content']);
  });

  it('puts the bar under the workspace when asked', () => {
    render(
      <LabShell sceneTabs="tabs" barAtBottom>
        body
      </LabShell>
    );
    expect(order()).toEqual(['content', 'bar']);
    expect(
      document
        .querySelector(`.${styles.tabContainer}`)!
        .classList.contains(styles.tabContainerBottom)
    ).toBe(true);
  });
});
