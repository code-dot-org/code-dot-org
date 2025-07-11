import {BarChart} from 'echarts/charts';
import {GridComponent, TooltipComponent} from 'echarts/components';
import * as echarts from 'echarts/core';
import {SVGRenderer} from 'echarts/renderers';
import ReactEChartsCore, {EChartsReactCore} from 'echarts-for-react/lib/core';
import React, {useRef, useState, useMemo, useEffect, useCallback} from 'react';

echarts.use([SVGRenderer, GridComponent, TooltipComponent, BarChart]);

import {FrequencyData, FrequencyDataPoint} from '../types';

const getCSSVariable: (name: string) => string = name =>
  typeof window !== 'undefined'
    ? window.getComputedStyle(document.body).getPropertyValue(`--${name}`) || ''
    : '';

export interface GraphProps {
  frequencyData: FrequencyData;
  data?: FrequencyDataPoint[];
  sourceData?: FrequencyDataPoint[];
  inverted: boolean;
  onUpdate?: () => void;
}

/**
 * This is creating a bar chart with a bar for each letter.
 */
const Graph = (React.FunctionComponent<GraphProps> = ({
  frequencyData,
  data,
  sourceData,
  inverted,
  onUpdate,
}) => {
  const letters = inverted
    ? frequencyData.current.sourceLetters
    : frequencyData.current.letters;
  const defaultData = letters.map(letter => ({
    letter,
    frequency: 0,
  }));

  // Determine the largest value we will ever see; we will fit the plot to
  // ensure that all bars can be animated into the graph and fit.
  const maxY = Math.max(
    frequencyData.current.data.reduce((a, b) =>
      a.frequency > b.frequency ? a : b,
    ).frequency,
    frequencyData.current.sourceData.reduce((a, b) =>
      a.frequency > b.frequency ? a : b,
    ).frequency,
  );

  // Capture the state of the data
  const [plotted, setPlotted] = useState<boolean>(false);
  const [plottedData, setPlottedData] = useState<FrequencyDataPoint[]>(
    data || defaultData,
  );
  const [plottedSourceData, setPlottedSourceData] = useState<
    FrequencyDataPoint[]
  >(sourceData || defaultData);

  // When data changes, animate the plot
  useEffect(() => {
    if (plotted) {
      setPlottedData(data || defaultData);
      setPlottedSourceData(sourceData || defaultData);
    }
  }, [data, sourceData, plotted]);

  const chartRef = useRef<EChartsReactCore | null>(null);

  const handleAfterPlot = useCallback(() => {
    setPlotted(true);

    if (chartRef.current) {
      // Get the positions of the bars after resizing
      const echarts = chartRef.current.getEchartsInstance();
      //const xAxisData = echarts.getOption().xAxis[0].data;
      //const seriesData = echarts.getOption().series[0].data;

      // Get the positions of the bars (x positions based on category)
      const barPositions = frequencyData.current.letters.map(
        letter =>
          echarts.convertToPixel(
            {
              seriesIndex: 0,
              xAxisIndex: 0,
            },
            [letter, 0],
          )[0],
      );

      frequencyData.current.positions = barPositions;
    }

    if (onUpdate) {
      onUpdate();
    }
  }, [setPlotted, frequencyData, onUpdate]);

  const onEvents = useMemo(
    () => ({
      rendered: handleAfterPlot,
    }),
    [handleAfterPlot],
  );

  const isDarkMode = true;

  return (
    <ReactEChartsCore
      echarts={echarts}
      ref={chartRef}
      onEvents={onEvents}
      style={{
        height: '15rem',
      }}
      theme={isDarkMode ? 'dark' : undefined}
      option={{
        darkMode: isDarkMode,
        backgroundColor: 'transparent',
        color: [
          ...(inverted
            ? []
            : [getCSSVariable('background-accent-orange-primary')]),
          getCSSVariable('background-brand-teal-primary'),
        ],
        renderer: 'svg',
        grid: {
          left: '100', // Padding on the left side to accommodate letter labels
          bottom: '3%',
          top: '3%',
          right: '3%',
        },
        xAxis: {
          type: 'category',
          data: letters,
          axisLabel: {
            show: false, // No labels on the x-axis
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
          },
          min: 0,
          max: maxY,
          name: 'Frequency',
          nameLocation: 'middle',
          nameGap: 40,
          inverse: inverted,
        },
        series: [
          ...(inverted
            ? []
            : [
                {
                  data: plottedData.map(item => item.frequency),
                  type: 'bar',
                  name: 'Original',
                  animationDuration: 1000,
                  animationEasing: 'cubicOut',
                  animationDelay: (index: number) => index * 10,
                },
              ]),
          {
            data: plottedSourceData.map(item => item.frequency),
            type: 'bar',
            name: 'Substituted',
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: (index: number) => index * 10,
          },
        ],
        animationDurationUpdate: 1000,
        animationEasingUpdate: 'cubicOut',
        tooltip: {
          trigger: 'axis',
          valueFormatter: (value: number | string, _dataIndex: number) => {
            value = (parseFloat(value) || 0) * 100;
            return `${value.toFixed(0)}%`;
          },
          axisPointer: {
            type: 'shadow',
          },
        },
      }}
    />
  );
});

export default Graph;
