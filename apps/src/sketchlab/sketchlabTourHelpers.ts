import {resourcePanelNavigationButtonElementId} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import sketchlabI18n from '@cdo/apps/sketchlab/locale';
export const INITIAL_STEP = 0;
export const STEPS = [
  {
    element: 'label.ToolIcon[title^="Hand"]',
    title: sketchlabI18n.tour_grabAndSelectTitle(),
    intro: sketchlabI18n.tour_grabAndSelectText(),
  },
  {
    element: 'label.ToolIcon[title^="Rectangle"]',
    title: sketchlabI18n.tour_shapeToolsTitle(),
    intro: sketchlabI18n.tour_shapeToolsText(),
  },
  {
    element: 'label.ToolIcon[title^="Arrow"]',
    title: sketchlabI18n.tour_lineAndPenToolsTitle(),
    intro: sketchlabI18n.tour_lineAndPenToolsText(),
  },
  {
    element: 'label.ToolIcon[title^="Text"]',
    title: sketchlabI18n.tour_contentToolsTitle(),
    intro: sketchlabI18n.tour_contentToolsText(),
  },
  {
    element: 'label.ToolIcon[title^="Eraser"]',
    title: sketchlabI18n.tour_eraserToolTitle(),
    intro: sketchlabI18n.tour_eraserToolText(),
  },
  {
    element: '.dropdown-menu-button',
    title: sketchlabI18n.tour_openMenuTitle(),
    intro: sketchlabI18n.tour_openMenuText(),
  },
  {
    title: sketchlabI18n.tour_exportingYourSketchesTitle(),
    intro: `
      <div class="sketchlab-move-vertical">
        <p>${sketchlabI18n.tour_exportingYourSketchesText()}</p>
        <img src="/blockly/media/sketchlab/export-image-button.png" alt="Export PNG button" style="width: 100%; max-width: 500px; border-radius: 8px; margin: 10px 0;" />
      </div>
    `,
  },
  {
    title: sketchlabI18n.tour_saveAsAnImageTitle(),
    intro: `
        <div class="sketchlab-tour-wide-step sketchlab-move-vertical">
          <p>${sketchlabI18n.tour_saveAsAnImageText()}</p>
          <img src="/blockly/media/sketchlab/export-image-dialog.png" alt="Export PNG dialog" style="width: 100%; max-width: 700px; border-radius: 8px; margin: 10px 0;" />
        </div>
      `,
  },
  {
    element: `#${resourcePanelNavigationButtonElementId}`,
    title: sketchlabI18n.tour_moveOnToNextLevelTitle(),
    intro: sketchlabI18n.tour_moveOnToNextLevelText(),
  },
];
