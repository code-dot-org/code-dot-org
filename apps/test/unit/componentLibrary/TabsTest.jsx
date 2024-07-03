import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon';

import Tabs from '@cdo/apps/componentLibrary/tabs';



const valuesMap = {};
const onSelectedTabChange = (name, value) => (valuesMap[name] = value);

describe('Design System - Tabs', () => {
  it('Tabs - renders with correct tabs labels', () => {
    // set segmentedButton default value
    onSelectedTabChange('test1', 'tab1');

    render(
      <Tabs
        defaultSelectedTabValue={valuesMap.test1}
        tabs={[
          {text: 'tab1', value: 'tab1', tabContent: <div>tab1 content</div>},
          {text: 'tab2', value: 'tab2', tabContent: <div>tab2 content</div>},
        ]}
        onChange={value => onSelectedTabChange('test1', value)}
        name={'test1'}
      />
    );

    const tab1 = screen.getByText('tab1');
    const tab2 = screen.getByText('tab2');

    expect(tab1).toBeDefined();
    expect(tab2).toBeDefined();
    expect(valuesMap.test1).toBe('tab1');
    expect(screen.getByText('tab1 content')).toBeDefined();
  });

  it('Tabs - changes selected tab on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    // set tab default value
    onSelectedTabChange('test2', 'tab1');
    const onChange = value => {
      onSelectedTabChange('test2', value);
      spyOnChange(value);
    };

    const TabsToRender = () => (
      <Tabs
        defaultSelectedTabValue={valuesMap.test1}
        tabs={[
          {text: 'tab1', value: 'tab1', tabContent: <div>tab1 content</div>},
          {text: 'tab2', value: 'tab2', tabContent: <div>tab2 content</div>},
        ]}
        onChange={onChange}
        name={'test2'}
      />
    );

    const {rerender} = render(<TabsToRender />);

    let tab1 = screen.getByText('tab1');
    const tab2 = screen.getByText('tab2');

    expect(tab1).toBeDefined();
    expect(tab2).toBeDefined();
    expect(valuesMap.test2).toBe('tab1');

    await user.click(tab2);

    // Re-render after user's first click
    rerender(<TabsToRender />);

    tab1 = screen.getByText('tab1');

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith('tab2');
    expect(valuesMap.test2).toBe('tab2');

    await user.click(tab1);

    // Re-render after user's second click
    rerender(<TabsToRender />);

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange).toHaveBeenCalledWith('tab1');
    expect(valuesMap.test2).toBe('tab1');
  });

  it("Tabs - renders disabled tab, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    // set segmentedButton default value
    onSelectedTabChange('test3', 'tab1');
    const onChange = value => {
      onSelectedTabChange('test3', value);
      spyOnChange(value);
    };

    const TabsToRender = () => (
      <Tabs
        defaultSelectedTabValue={valuesMap.test1}
        tabs={[
          {text: 'tab1', value: 'tab1', tabContent: <div>tab1 content</div>},
          {
            text: 'tab2',
            value: 'tab2',
            tabContent: <div>tab2 content</div>,
            disabled: true,
          },
        ]}
        onChange={onChange}
        name={'test3'}
      />
    );

    // Initial render
    const {rerender} = render(<TabsToRender />);

    let tab1 = screen.getByText('tab1');
    const tab2 = screen.getByText('tab2');

    expect(tab1).toBeDefined();
    expect(tab2).toBeDefined();
    expect(valuesMap.test3).toBe('tab1');

    await user.click(tab2);

    // Re-render after user's first click
    rerender(<TabsToRender />);

    tab1 = screen.getByText('tab1');

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(valuesMap.test3).toBe('tab1');

    await user.click(tab1);

    // Re-render after user's second click
    rerender(<TabsToRender />);

    expect(spyOnChange).toHaveBeenCalled().once;
    expect(spyOnChange).toHaveBeenCalledWith('tab1');
  });

  it('Tabs - renders with tooltip and displays it on hover', async () => {
    const user = userEvent.setup();
    onSelectedTabChange('test4', 'tab1');

    const TabsToRender = () => (
      <Tabs
        defaultSelectedTabValue={valuesMap.test4}
        tabs={[
          {
            text: 'tab1',
            value: 'tab1',
            tabContent: <div>tab1 content</div>,
            tooltip: {text: 'Tooltip for tab1', tooltipId: 'tooltip1'},
          },
          {text: 'tab2', value: 'tab2', tabContent: <div>tab2 content</div>},
        ]}
        onChange={value => onSelectedTabChange('test4', value)}
        name={'test4'}
      />
    );

    const {rerender} = render(<TabsToRender />);

    let tab1 = screen.getByText('tab1');
    let tooltip = screen.queryByText('Tooltip for tab1');
    expect(tab1).toBeDefined();
    expect(tooltip).toBeFalsy();

    await user.hover(tab1);

    rerender(<TabsToRender />);

    tooltip = screen.queryByText('Tooltip for tab1');

    expect(tooltip).toBeDefined();
  });
});
