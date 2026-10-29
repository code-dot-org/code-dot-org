import {render} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import Guide from '../index';

describe('Guide', () => {
  it('takes a fixed width in px, and hands its panel to a ref', () => {
    const panelRef = createRef<HTMLDivElement>();
    render(
      <Guide id="g" width={400} panelRef={panelRef}>
        Hello
      </Guide>,
    );
    expect(panelRef.current?.id).toBe('g');
    expect(panelRef.current?.style.width).toBe('400px');
  });

  it('drops the fixed width while collapsed, to fit its controls', () => {
    const panelRef = createRef<HTMLDivElement>();
    render(
      <Guide width={400} collapsed panelRef={panelRef}>
        Hello
      </Guide>,
    );
    expect(panelRef.current?.style.width).toBe('');
    expect(panelRef.current?.className).toMatch(/Collapsed/);
  });
});
