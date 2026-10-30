import {render, screen} from '@testing-library/react';
import React from 'react';

import {ITEM_TYPE} from '@cdo/apps/templates/sectionProgressV2/ItemType';
import LegendItem from '@cdo/apps/templates/sectionProgressV2/LegendItem';

describe('LegendItem ', () => {
  it('renders with provided label text', () => {
    const labelText = 'Test Label';
    render(<LegendItem labelText={labelText} itemType={ITEM_TYPE.VALIDATED} />);
    screen.getByText(labelText);
  });

  it('renders ProgressIcon', () => {
    const itemType = ITEM_TYPE.VALIDATED;
    render(<LegendItem labelText="Test Label" itemType={itemType} />);
    screen.getByLabelText(itemType['title']);
  });
});
