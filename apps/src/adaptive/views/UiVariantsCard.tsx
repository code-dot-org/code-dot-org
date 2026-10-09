import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Typography as MuiTypography} from '@mui/material';
import React from 'react';

import {
  EDGE_SHAPES,
  EdgeShape,
  LAYOUT_MODES,
  LayoutMode,
  NODE_SHAPES,
  NodeShape,
  useUiVariants,
} from './uiVariants';

import shared from './shared.module.scss';

/** Controls for the map's UI experiments; see uiVariants. */
const UiVariantsCard: React.FunctionComponent = () => {
  const {variants, setVariant} = useUiVariants();
  return (
    <div className={shared.card}>
      <MuiTypography variant="overline1">UI Variants</MuiTypography>
      <SimpleDropdown
        name="ui-variant-layout"
        labelText="Layout"
        items={LAYOUT_MODES}
        selectedValue={variants.layoutMode}
        onChange={e => setVariant('layoutMode', e.target.value as LayoutMode)}
        size="s"
      />
      <Checkbox
        name="ui-variant-show-edges"
        label="Show all dependency lines"
        checked={variants.showEdges}
        onChange={e => setVariant('showEdges', e.target.checked)}
        size="s"
      />
      <Checkbox
        name="ui-variant-show-focus-edges"
        label="Show lines into the selected checkpoint only"
        checked={variants.showFocusEdges}
        onChange={e => setVariant('showFocusEdges', e.target.checked)}
        disabled={variants.showEdges}
        size="s"
      />
      <SimpleDropdown
        name="ui-variant-edge-shape"
        labelText="Line shape"
        items={EDGE_SHAPES}
        selectedValue={variants.edgeShape}
        onChange={e => setVariant('edgeShape', e.target.value as EdgeShape)}
        // Radial and honeycomb have no rows or columns for a shape to follow.
        disabled={
          !variants.showEdges ||
          variants.layoutMode === 'radial' ||
          variants.layoutMode === 'honeycomb'
        }
        size="s"
      />
      <Checkbox
        name="ui-variant-highlight-incoming"
        label="Highlight lines into the selected checkpoint"
        checked={variants.highlightIncomingEdges}
        onChange={e => setVariant('highlightIncomingEdges', e.target.checked)}
        disabled={!variants.showEdges}
        size="s"
      />
      <SimpleDropdown
        name="ui-variant-node-shape"
        labelText="Checkpoint shape"
        items={NODE_SHAPES}
        selectedValue={variants.nodeShape}
        onChange={e => setVariant('nodeShape', e.target.value as NodeShape)}
        size="s"
      />
      <Checkbox
        name="ui-variant-status-badge"
        label="Status icon as a corner badge"
        checked={variants.statusBadge}
        onChange={e => setVariant('statusBadge', e.target.checked)}
        size="s"
      />
    </div>
  );
};

export default UiVariantsCard;
