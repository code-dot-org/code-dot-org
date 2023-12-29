import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';

import {expect} from '../../util/reconfiguredChai';

import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons';

const valuesMap = {};
const onSegmentedButtonsChange = (name, value) => (valuesMap[name] = value);

describe('Design System - Segmented Buttons', () => {
  it('SegmentedButtons - renders with correct button labels', () => {
    render(
      <SegmentedButtons
        selectedButtonValue="label"
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2'},
        ]}
        onChange={value => onSegmentedButtonsChange('label', value)}
      />
    );

    const segmentedButton1 = screen.getByText('Label');
    const segmentedButton2 = screen.getByText('Label2');

    expect(segmentedButton1).to.exist;
    expect(segmentedButton2).to.exist;
    expect(valuesMap.label || 'label').to.equal('label');
  });

  it('SemgentedButtons - changes selected button on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    const onChange = value => {
      onSegmentedButtonsChange('label', value);
      spyOnChange(value);
    };

    const {rerender} = render(
      <SegmentedButtons
        selectedButtonValue="label"
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2'},
        ]}
        onChange={onChange}
      />
    );

    let segmentedButton1 = screen.getByText('Label');
    let segmentedButton2 = screen.getByText('Label2');

    expect(segmentedButton1).to.exist;
    expect(segmentedButton2).to.exist;
    expect(valuesMap.label || 'label').to.equal('label');

    await user.click(segmentedButton2);

    // Re-render after user's first click
    rerender(
      <SegmentedButtons
        selectedButtonValue="label"
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2'},
        ]}
        onChange={onChange}
      />
    );

    segmentedButton1 = screen.getByText('Label');
    segmentedButton2 = screen.getByText('Label2');

    expect(spyOnChange).to.have.been.calledOnce;
    expect(spyOnChange).to.have.been.calledWith('label-2');
    expect(valuesMap.label).to.equal('label-2');

    await user.click(segmentedButton1);

    // Re-render after user's second click
    rerender(
      <SegmentedButtons
        selectedButtonValue="label"
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2'},
        ]}
        onChange={onChange}
      />
    );

    expect(spyOnChange).to.have.been.calledTwice;
    expect(spyOnChange).to.have.been.calledWith('label');
    expect(valuesMap.label).to.equal('label');
  });

  it("SegmentedButtons - renders disabled button, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    const onChange = value => {
      onSegmentedButtonsChange('label', value);
      spyOnChange(value);
    };

    // Initial render
    const {rerender} = render(
      <SegmentedButtons
        selectedButtonValue="label"
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2', disabled: true},
        ]}
        onChange={onChange}
      />
    );

    let segmentedButton1 = screen.getByText('Label');
    let segmentedButton2 = screen.getByText('Label2');

    expect(segmentedButton1).to.exist;
    expect(segmentedButton2).to.exist;
    expect(valuesMap.label || 'label').to.equal('label');

    await user.click(segmentedButton2);

    // Re-render after user's first click
    rerender(
      <SegmentedButtons
        selectedButtonValue="label"
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2', disabled: true},
        ]}
        onChange={onChange}
      />
    );

    segmentedButton1 = screen.getByText('Label');

    expect(spyOnChange).to.not.have.been.called;
    expect(valuesMap.label || 'label').to.equal('label');

    await user.click(segmentedButton1);

    // Re-render after user's second click
    rerender(
      <SegmentedButtons
        selectedButtonValue="label"
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2', disabled: true},
        ]}
        onChange={onChange}
      />
    );

    expect(spyOnChange).to.have.been.called.once;
    expect(spyOnChange).to.have.been.calledWith('label');
  });
});
