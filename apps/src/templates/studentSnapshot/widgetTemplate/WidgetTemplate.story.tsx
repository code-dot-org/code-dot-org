import {CdoTheme} from '@code-dot-org/component-library/themes';
import {ThemeProvider} from '@mui/material/styles';
import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';

import WidgetTemplate from './index';

const meta: Meta<typeof WidgetTemplate> = {
  component: WidgetTemplate,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `

## CSS Grid
The WidgetTemplate component is designed to work within a **CSS Grid container** and provides a flexible widget system for dashboard layouts.

Example grid setup (used in storybook):
\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* 3 equal columns */
  grid-auto-rows: 200px; /* Fixed row height */
  gap: 12px;
}
\`\`\`

[Learn more about CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
        `.trim(),
      },
    },
  },
  decorators: [
    (Story, context) => {
      const content =
        context.name === 'Multiple Widgets In Grid' ? (
          <Story />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gridAutoRows: '200px',
              gap: '12px',
              minWidth: '600px',
            }}
          >
            <Story />
            <div
              style={{
                backgroundColor: '#f5f5f5',
                border: '1px dashed #ccc',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '14px',
              }}
            >
              Placeholder Widget
            </div>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                border: '1px dashed #ccc',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '14px',
              }}
            >
              Placeholder Widget
            </div>
          </div>
        );

      return <ThemeProvider theme={CdoTheme}>{content}</ThemeProvider>;
    },
  ],
  argTypes: {
    widgetName: {
      control: 'text',
      description: 'The name displayed in the widget header',
    },
    gridWidth: {
      control: {type: 'number', min: 1, max: 4, step: 1},
      description: 'Number of grid columns the widget spans',
    },
    gridHeight: {
      control: {type: 'number', min: 1, max: 4, step: 1},
      description: 'Number of grid rows the widget spans',
    },
    children: {
      control: false,
      description: 'Content to display inside the widget',
    },
    scrollable: {
      control: 'boolean',
      description: 'Whether to show scrollbars when content overflows',
      table: {
        defaultValue: {summary: 'false'},
      },
    },
    loading: {
      control: 'boolean',
      description: 'Whether to show loading spinner instead of content',
      table: {
        defaultValue: {summary: 'false'},
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    widgetName: 'Sample Widget',
    gridWidth: 1,
    gridHeight: 1,
    children: <div>This is the widget content</div>,
  },
};

export const SmallWidget: Story = {
  args: {
    ...Default.args,
    widgetName: 'Small Widget',
    gridWidth: 1,
    gridHeight: 1,
    children: <div>Small widget with minimal content</div>,
  },
};

export const LongWidget: Story = {
  args: {
    ...Default.args,
    widgetName: 'Long Widget',
    gridWidth: 3,
    gridHeight: 1,
    children: (
      <div>
        <p>This is a long widget that spans 3 columns</p>
      </div>
    ),
  },
};

export const BigWidget: Story = {
  args: {
    ...Default.args,
    widgetName: 'Big Widget',
    gridWidth: 2,
    gridHeight: 2,
    children: (
      <div>
        <h4>Big Widget Content</h4>
        <p>This widget takes up 2x2 grid space</p>
        <div style={{marginTop: '16px'}}>
          <p>More content can fit here:</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
      </div>
    ),
  },
};

const MultipleWidgetsInGridComponent: React.FC = () => {
  return (
    <div style={{padding: '20px'}}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridAutoRows: '200px',
          gap: '12px',
          minWidth: '970px',
        }}
      >
        <WidgetTemplate widgetName="Long Widget" gridWidth={3} gridHeight={1}>
          <div>
            <p>Content spanning 3 columns</p>
            <p>
              This widget demonstrates how content flows across multiple grid
              columns.
            </p>
          </div>
        </WidgetTemplate>
        <WidgetTemplate widgetName="Big Widget" gridWidth={2} gridHeight={2}>
          <div>
            <h4>Big Widget Content</h4>
            <p>This widget takes up 2x2 grid space</p>
            <p>
              Perfect for charts, detailed information, or complex controls.
            </p>
          </div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Non-scrollable (default)"
          gridWidth={1}
          gridHeight={1}
        >
          <div
            style={{
              width: '150%',
              padding: '8px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
            }}
          >
            This content is much wider than the widget container, but scrolling
            is disabled (default). The content is mostly hidden as it extends
            beyond the normal widget boundaries.
          </div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Scrollable"
          gridWidth={1}
          gridHeight={1}
          scrollable={true}
        >
          <div
            style={{
              width: '150%',
              padding: '8px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
            }}
          >
            This content is much wider than the widget container and will
            require horizontal scrolling to view completely. The content extends
            beyond the normal widget boundaries.
          </div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 3"
          gridWidth={1}
          gridHeight={1}
        >
          <div>Small content 3</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 4"
          gridWidth={1}
          gridHeight={1}
        >
          <div>Small content 4</div>
        </WidgetTemplate>
      </div>
    </div>
  );
};

export const VerticalScrollWidget: Story = {
  args: {
    ...Default.args,
    widgetName: 'Vertical Scroll Widget',
    gridWidth: 1,
    gridHeight: 1,
    scrollable: true,
    children: (
      <div>
        <h4>Long Content List</h4>
        <p>Content that overflows vertically:</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
          <li>Item 4</li>
          <li>Item 5</li>
          <li>Item 6</li>
          <li>Item 7</li>
          <li>Item 8</li>
          <li>Item 9</li>
          <li>Item 10</li>
          <li>Item 11</li>
          <li>Item 12</li>
          <li>Item 13</li>
          <li>Item 14</li>
          <li>Item 15</li>
        </ul>
        <p>This content requires vertical scrolling.</p>
      </div>
    ),
  },
};

export const WidgetWithScrollDisabled: Story = {
  args: {
    ...Default.args,
    widgetName: 'Non-Scrollable Widget',
    gridWidth: 1,
    gridHeight: 1,
    scrollable: false,
    children: (
      <div
        style={{
          width: '150%',
          padding: '8px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
        }}
      >
        This content is much wider than the widget container, but scrolling is
        disabled (default). The content is mostly hidden as it extends beyond
        the normal widget boundaries.
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
          <li>Item 4</li>
          <li>Item 5</li>
          <li>Item 6</li>
          <li>Item 7</li>
          <li>Item 8</li>
          <li>Item 9</li>
          <li>Item 10</li>
          <li>Item 11</li>
          <li>Item 12</li>
          <li>Item 13</li>
          <li>Item 14</li>
          <li>Item 15</li>
        </ul>
      </div>
    ),
  },
};

export const HorizontalScrollWidget: Story = {
  args: {
    ...Default.args,
    widgetName: 'Horizontal Scroll Widget',
    gridWidth: 1,
    gridHeight: 1,
    scrollable: true,
    children: (
      <div>
        <h4>Wide Content</h4>
        <div
          style={{
            width: '150%',
            padding: '8px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
          }}
        >
          This content is much wider than the widget container and will require
          horizontal scrolling to view completely. The content extends beyond
          the normal widget boundaries.
        </div>
      </div>
    ),
  },
};

export const LoadingWidget: Story = {
  args: {
    ...Default.args,
    widgetName: 'Loading Widget',
    gridWidth: 1,
    gridHeight: 1,
    loading: true,
    children: <div>This content will not be shown when loading is true</div>,
  },
};

export const MultipleWidgetsInGrid: Story = {
  render: () => <MultipleWidgetsInGridComponent />,
  parameters: {
    layout: 'fullscreen',
  },
};
