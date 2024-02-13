import React from 'react';
import {render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import LegendItem from '@cdo/apps/templates/sectionProgressV2/LegendItem';
import {ITEM_TYPE} from '@cdo/apps/templates/sectionProgressV2/ItemType';


describe('LegendItem ', () => {
    it('renders with provided label text', () => {
        const labelText = 'Test Label';
        render(<LegendItem labelText={labelText} />);
        expect(screen.getByText(labelText)).to.exist;
    });

    it('renders ProgressIcon with correct itemType', () => {
        const itemType = ITEM_TYPE.VALIDATED;
        render(<LegendItem labelText="Test Label" itemType={itemType} />);
        const progressIcon = screen.getByTestId('progress-icon');
        expect(progressIcon).to.exist;
      });
});