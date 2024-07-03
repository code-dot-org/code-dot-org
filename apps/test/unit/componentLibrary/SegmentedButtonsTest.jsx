import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const valuesMap = {};
const onSegmentedButtonsChange = (name, value) => (valuesMap[name] = value);

describe('Design System - Segmented Buttons', () => {
  it('SegmentedButtons - renders with correct button labels', () => {
    // set segmentedButton default value
    onSegmentedButtonsChange('test1', 'label');

    render(
      <SegmentedButtons
        selectedButtonValue={valuesMap.test1}
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2'},
        ]}
        onChange={value => onSegmentedButtonsChange('test1', value)}
      />
    );

    const segmentedButton1 = screen.getByText('Label');
    const segmentedButton2 = screen.getByText('Label2');

    expect(segmentedButton1).to.exist;
    expect(segmentedButton2).to.exist;
    expect(valuesMap.test1).to.equal('label');
  });

  it('SegmentedButtons - changes selected button on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    // set segmentedButton default value
    onSegmentedButtonsChange('test2', 'label');
    const onChange = value => {
      onSegmentedButtonsChange('test2', value);
      spyOnChange(value);
    };

    const {rerender} = render(
      <SegmentedButtons
        selectedButtonValue={valuesMap.test2}
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2'},
        ]}
        onChange={onChange}
      />
    );

    let segmentedButton1 = screen.getByText('Label');
    const segmentedButton2 = screen.getByText('Label2');

    expect(segmentedButton1).to.exist;
    expect(segmentedButton2).to.exist;
    expect(valuesMap.test2).to.equal('label');

    await user.click(segmentedButton2);

    // Re-render after user's first click
    rerender(
      <SegmentedButtons
        selectedButtonValue={valuesMap.test2}
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2'},
        ]}
        onChange={onChange}
      />
    );

    segmentedButton1 = screen.getByText('Label');

    expect(spyOnChange).to.have.been.calledOnce;
    expect(spyOnChange).to.have.been.calledWith('label-2');
    expect(valuesMap.test2).to.equal('label-2');

    await user.click(segmentedButton1);

    // Re-render after user's second click
    rerender(
      <SegmentedButtons
        selectedButtonValue={valuesMap.test2}
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2'},
        ]}
        onChange={onChange}
      />
    );

    expect(spyOnChange).to.have.been.calledTwice;
    expect(spyOnChange).to.have.been.calledWith('label');
    expect(valuesMap.test2).to.equal('label');
  });

  it("SegmentedButtons - renders disabled button, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    // set segmentedButton default value
    onSegmentedButtonsChange('test3', 'label');
    const onChange = value => {
      onSegmentedButtonsChange('test3', value);
      spyOnChange(value);
    };

    // Initial render
    const {rerender} = render(
      <SegmentedButtons
        selectedButtonValue={valuesMap.test3}
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2', disabled: true},
        ]}
        onChange={onChange}
      />
    );

    let segmentedButton1 = screen.getByText('Label');
    const segmentedButton2 = screen.getByText('Label2');

    expect(segmentedButton1).to.exist;
    expect(segmentedButton2).to.exist;
    expect(valuesMap.test3).to.equal('label');

    await user.click(segmentedButton2);

    // Re-render after user's first click
    rerender(
      <SegmentedButtons
        selectedButtonValue={valuesMap.test3}
        buttons={[
          {label: 'Label', value: 'label'},
          {label: 'Label2', value: 'label-2', disabled: true},
        ]}
        onChange={onChange}
      />
    );

    segmentedButton1 = screen.getByText('Label');

    expect(spyOnChange).to.not.have.been.called;
    expect(valuesMap.test3).to.equal('label');

    await user.click(segmentedButton1);

    // Re-render after user's second click
    rerender(
      <SegmentedButtons
        selectedButtonValue={valuesMap.test3}
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
