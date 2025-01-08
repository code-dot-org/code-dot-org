import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import Tabs, {TabsProps} from '@cdo/apps/componentLibrary/tabs';

describe('Design System - Tabs', () => {
  const valuesMap: Record<string, string> = {};
  const onSelectedTabChange = (name: string, value: string): void => {
    valuesMap[name] = value;
  };

  const renderTabs = (props: TabsProps) => {
    const Wrapper: React.FC = () => {
      const [selectedTab, setSelectedTab] = useState<string>(
        props.defaultSelectedTabValue || ''
      );

      const handleChange = (value: string) => {
        setSelectedTab(value);
        props.onChange && props.onChange(value);
      };

      return (
        <Tabs
          {...props}
          defaultSelectedTabValue={selectedTab}
          onChange={handleChange}
        />
      );
    };

    return render(<Wrapper />);
  };

  it('renders with correct tabs labels', () => {
    onSelectedTabChange('test1', 'tab1');

    renderTabs({
      defaultSelectedTabValue: valuesMap.test1,
      tabs: [
        {text: 'tab1', value: 'tab1', tabContent: <div>tab1 content</div>},
        {text: 'tab2', value: 'tab2', tabContent: <div>tab2 content</div>},
      ],
      onChange: value => onSelectedTabChange('test1', value),
      name: 'test1',
    });

    const tab1 = screen.getByText('tab1');
    const tab2 = screen.getByText('tab2');

    expect(tab1).toBeInTheDocument();
    expect(tab2).toBeInTheDocument();
    expect(valuesMap.test1).toBe('tab1');
    expect(screen.getByText('tab1 content')).toBeInTheDocument();
  });

  it('changes selected tab on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    onSelectedTabChange('test2', 'tab1');

    const onChange = (value: string) => {
      onSelectedTabChange('test2', value);
      spyOnChange(value);
    };

    renderTabs({
      defaultSelectedTabValue: valuesMap.test2,
      tabs: [
        {text: 'tab1', value: 'tab1', tabContent: <div>tab1 content</div>},
        {text: 'tab2', value: 'tab2', tabContent: <div>tab2 content</div>},
      ],
      onChange,
      name: 'test2',
    });

    const tab1 = screen.getByText('tab1');
    const tab2 = screen.getByText('tab2');

    expect(tab1).toBeInTheDocument();
    expect(tab2).toBeInTheDocument();
    expect(valuesMap.test2).toBe('tab1');

    await user.click(tab2);

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith('tab2');
    expect(valuesMap.test2).toBe('tab2');

    await user.click(tab1);

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange).toHaveBeenCalledWith('tab1');
    expect(valuesMap.test2).toBe('tab1');
  });

  it("renders disabled tab, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    onSelectedTabChange('test3', 'tab1');

    renderTabs({
      defaultSelectedTabValue: valuesMap.test3,
      tabs: [
        {text: 'tab1', value: 'tab1', tabContent: <div>tab1 content</div>},
        {
          text: 'tab2',
          value: 'tab2',
          tabContent: <div>tab2 content</div>,
          disabled: true,
        },
      ],
      onChange: spyOnChange,
      name: 'test3',
    });

    const tab1 = screen.getByText('tab1');
    const tab2 = screen.getByText('tab2');

    expect(tab1).toBeInTheDocument();
    expect(tab2).toBeInTheDocument();
    expect(valuesMap.test3).toBe('tab1');

    await user.click(tab2);

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(valuesMap.test3).toBe('tab1');
  });

  it('renders with tooltip and displays it on hover', async () => {
    const user = userEvent.setup();

    onSelectedTabChange('test4', 'tab1');

    renderTabs({
      defaultSelectedTabValue: valuesMap.test4,
      tabs: [
        {
          text: 'tab1',
          value: 'tab1',
          tabContent: <div>tab1 content</div>,
          tooltip: {text: 'Tooltip for tab1', tooltipId: 'tooltip1'},
        },
        {text: 'tab2', value: 'tab2', tabContent: <div>tab2 content</div>},
      ],
      onChange: value => onSelectedTabChange('test4', value),
      name: 'test4',
    });

    const tab1 = screen.getByText('tab1');
    let tooltip = screen.queryByText('Tooltip for tab1');

    expect(tab1).toBeInTheDocument();
    expect(tooltip).not.toBeInTheDocument();

    await user.hover(tab1);

    tooltip = screen.getByText('Tooltip for tab1');

    expect(tooltip).toBeInTheDocument();
  });
});
