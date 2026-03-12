import {type StepOptions, type Tour} from 'shepherd.js';

import {resourcePanelNavigationButtonElementId} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import {
  backButton,
  doneButton,
  nextButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import sketchlabI18n from '@cdo/apps/sketchlab/locale';

export const createSketchlabTourSteps = (tour: Tour): StepOptions[] => [
  {
    id: 'hand-tool',
    attachTo: {element: 'label.ToolIcon[title^="Hand"]', on: 'bottom'},
    title: sketchlabI18n.tour_grabAndSelectTitle(),
    text: sketchlabI18n.tour_grabAndSelectText(),
    buttons: [nextButton(tour)],
  },
  {
    id: 'shape-tools',
    attachTo: {element: 'label.ToolIcon[title^="Rectangle"]', on: 'bottom'},
    title: sketchlabI18n.tour_shapeToolsTitle(),
    text: sketchlabI18n.tour_shapeToolsText(),
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'line-pen-tools',
    attachTo: {element: 'label.ToolIcon[title^="Arrow"]', on: 'bottom'},
    title: sketchlabI18n.tour_lineAndPenToolsTitle(),
    text: sketchlabI18n.tour_lineAndPenToolsText(),
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'content-tools',
    attachTo: {element: 'label.ToolIcon[title^="Text"]', on: 'bottom'},
    title: sketchlabI18n.tour_contentToolsTitle(),
    text: sketchlabI18n.tour_contentToolsText(),
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'eraser-tool',
    attachTo: {element: 'label.ToolIcon[title^="Eraser"]', on: 'bottom'},
    title: sketchlabI18n.tour_eraserToolTitle(),
    text: sketchlabI18n.tour_eraserToolText(),
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'open-menu',
    attachTo: {
      element: '.dropdown-menu-button.main-menu-trigger',
      on: 'bottom',
    },
    title: sketchlabI18n.tour_openMenuTitle(),
    text: sketchlabI18n.tour_openMenuText(),
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'exporting',
    title: sketchlabI18n.tour_exportingYourSketchesTitle(),
    text: `<p>${sketchlabI18n.tour_exportingYourSketchesText()}</p><img src="/blockly/media/sketchlab/export-image-button.png" alt="Export PNG button" style="width: 100%; max-width: 500px; border-radius: 8px; margin: 10px 0;" />`,
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'save-as-image',
    title: sketchlabI18n.tour_saveAsAnImageTitle(),
    text: `<p>${sketchlabI18n.tour_saveAsAnImageText()}</p><img src="/blockly/media/sketchlab/export-image-dialog.png" alt="Export PNG dialog" style="width: 100%; max-width: 700px; border-radius: 8px; margin: 10px 0;" />`,
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'navigation',
    attachTo: {
      element: `#${resourcePanelNavigationButtonElementId}`,
      on: 'top',
    },
    title: sketchlabI18n.tour_moveOnToNextLevelTitle(),
    text: sketchlabI18n.tour_moveOnToNextLevelText(),
    buttons: [backButton(tour), doneButton(tour)],
  },
];
