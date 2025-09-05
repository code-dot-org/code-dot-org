import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';

import {
  BarChartGroup,
  SimpleBarChart,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/surveys/components/BarChartGroup';

// Keep these in sync with the component
const barColors = [
  'var(--sentiment-success-50, #3EA33E)',
  'var(--accent-orange-50, #FFB42E)',
  'var(--accent-strawberry-50, #ED6060)',
  'var(--brand-teal-50, #0093A4)',
  'var(--brand-purple-50, #8c52ba)',
  'var(--brand-aqua-50, #3cfff7)',
];

const sampleData = [
  {label: '0–2', value: 9},
  {label: '3–7', value: 12},
  {label: '8–15', value: 1},
  {label: '8–15', value: 1},
  {label: '16+', value: 2},
  {label: '20', value: 2},
  {label: '30+', value: 2},
  {label: '16+', value: 0},
];

// Utility: get the bar shape nodes Recharts renders (<path> or <rect>)
const getBarNodes = (container: HTMLElement) =>
  // eslint-disable-next-line no-restricted-properties
  container.querySelectorAll<SVGElement>(
    '.recharts-bar-rectangle path, .recharts-bar-rectangle rect'
  );

describe('BarChartGroup', () => {
  const renderComponent = (
    props: Partial<React.ComponentProps<typeof BarChartGroup>> = {}
  ) =>
    render(
      <BarChartGroup
        title="Years Teaching"
        data={sampleData}
        {...props}
        xAxisLabel="YEARS TAUGHT"
        yAxisLabel="RESPONSES"
      />
    );

  it('shows axis titles', () => {
    renderComponent();
    expect(screen.getByText('RESPONSES')).toBeInTheDocument();
    expect(screen.getByText('YEARS TAUGHT')).toBeInTheDocument();
  });

  it('renders the expected x-axis tick labels', () => {
    renderComponent();
    // These are SVG <text> nodes
    ['0–2', '3–7', '8–15', '16+', '20', '30+'].forEach(tick => {
      expect(screen.getAllByText(tick).length).toBeGreaterThan(0);
    });
  });

  it('renders a value label for every datum (including 0)', () => {
    renderComponent();
    // Check that each value appears at least once as a text node.
    // (They’re drawn by <LabelList> via your ValueLabel.)
    const values = sampleData.map(d => String(d.value));
    values.forEach(v => {
      expect(screen.getAllByText(v).length).toBeGreaterThan(0);
    });
  });

  it('renders exactly one bar per datum, in the expected color order', () => {
    const {container} = renderComponent();
    const bars = getBarNodes(container);
    const nonZero = sampleData.filter(d => d.value > 0);
    expect(bars.length).toBe(nonZero.length);

    bars.forEach((node, i) => {
      const expected = barColors[i % barColors.length];
      expect(node.getAttribute('fill')).toBe(expected);
    });
  });
});

describe('SimpleBarChart', () => {
  it('accepts custom size (width/height) and data', () => {
    const customData = [
      {label: 'A', value: 3},
      {label: 'B', value: 0},
    ];

    const {container} = render(
      <SimpleBarChart
        width={500}
        height={220}
        data={customData}
        xAxisLabel="YEARS TAUGHT"
        yAxisLabel="RESPONSES"
      />
    );

    // const svg = container.querySelector('svg');
    const svg = screen
      .getByText('YEARS TAUGHT')
      .closest('svg') as SVGSVGElement;

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '500');
    expect(svg).toHaveAttribute('height', '220');

    // ticks / value labels exist
    expect(screen.getAllByText('A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('B').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);

    // Recharts omits zero-height bars -> count only positives
    const bars = getBarNodes(container);
    const positiveCount = customData.filter(d => d.value > 0).length;
    expect(bars.length).toBe(positiveCount);
  });
});
