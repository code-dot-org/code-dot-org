import type {SelectorTourAnchor} from './tourAnchors';

// AI Lab marks its own elements with data-tour-anchor. These are the parts
// drawn by design system components, which do not pass the attribute through.
const tab = (
  tabsName: string,
  value: string,
  label: string
): SelectorTourAnchor => ({
  name: `${tabsName}-tab-${value}`,
  label,
  selector: `[role="tab"][aria-controls="${tabsName}-panel-${value}"]`,
});

const dialogCloseButton = (
  name: string,
  closeLabel: string,
  label: string
): SelectorTourAnchor => ({
  name,
  label,
  selector: `[role="dialog"] button[aria-label="${closeLabel}"]`,
});

export const ailabSelectorAnchors: SelectorTourAnchor[] = [
  {
    name: 'workspace-tab-dataset',
    label: 'Dataset tab',
    selector: '#ailab-workspace-tab-datasetView',
  },
  {
    name: 'workspace-tab-testing',
    label: 'Testing tab',
    selector: '#ailab-workspace-tab-results',
  },
  {
    name: 'dataset-layout-table',
    label: 'Table view button',
    selector: '#ailab-dataset-layout-table',
  },
  {
    name: 'dataset-layout-cards',
    label: 'Cards view button',
    selector: '#ailab-dataset-layout-cards',
  },
  tab('ailab-results', 'scorecard', 'Results: Scorecard tab'),
  tab('ailab-results', 'allResults', 'Results: All results tab'),
  tab('ailab-node-rows', 'accuracyCheck', 'Node details: Test rows tab'),
  tab('ailab-node-rows', 'training', 'Node details: Training rows tab'),
  dialogCloseButton(
    'results-close-button',
    'Close results',
    'Results: close button'
  ),
  dialogCloseButton(
    'node-details-close-button',
    'Close node details',
    'Node details: close button'
  ),
];
