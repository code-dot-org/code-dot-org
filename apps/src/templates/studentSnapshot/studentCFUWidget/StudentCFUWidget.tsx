import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';

interface CFULevel {
  id: number;
  name: string;
  display_name: string;
  type: string;
  key?: string;
  script_level_id: number;
  progression?: string;
  progression_display_name?: string;
}

interface StudentCFUWidgetProps {
  gridWidth?: number;
  gridHeight?: number;
  cfuLevels: CFULevel[];
  isLoading: boolean;
}

/**
 * Temporary CFU widget that simply renders the raw CFU level data.
 *
 * Once designs are finalized, this widget can be updated to render
 * the appropriate UI for Match / Multi / Free Response CFU types.
 */
const StudentCFUWidget: React.FC<StudentCFUWidgetProps> = ({
  gridWidth = 2,
  gridHeight = 2,
  cfuLevels,
  isLoading,
}) => {
  let content: React.ReactNode;
  let scrollable = false;

  if (isLoading) {
    content = <BodyThreeText>Loading CFU data...</BodyThreeText>;
  } else if (!cfuLevels || cfuLevels.length === 0) {
    content = (
      <BodyThreeText>No CFU data available for this lesson.</BodyThreeText>
    );
  } else {
    scrollable = true;
    content = (
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'monospace',
          fontSize: 12,
          margin: 0,
        }}
      >
        {JSON.stringify(cfuLevels, null, 2)}
      </pre>
    );
  }

  return (
    <WidgetTemplate
      widgetName="CFU (raw)"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      loading={isLoading}
      scrollable={scrollable}
    >
      {content}
    </WidgetTemplate>
  );
};

export default StudentCFUWidget;
