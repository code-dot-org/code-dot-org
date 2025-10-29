// import sketchlabI18n from '@cdo/apps/lab2/locale';

// import {SKETCHLAB_ONBOARDING_TOUR_SEEN} from './constants';
import {resourcePanelNavigationButtonElementId} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
export const INITIAL_STEP = 0;
export const STEPS = [
  {
    element: 'label.ToolIcon[title^="Hand"]',
    title: 'Grab and Select Tools',
    intro:
      'Use the hand tool to move around the canvas. Switch to the pointer (1) tool to select elements or drag to select multiple.',
  },
  {
    element: 'label.ToolIcon[title^="Rectangle"]',
    title: 'Shape Tools',
    intro:
      'This square (2) tool and the icons next to it - diamond (3) and circle (4) - let you draw basic shapes for diagrams and layouts.',
  },
  {
    element: 'label.ToolIcon[title^="Arrow"]',
    title: 'Line and Pen Tools',
    intro:
      'The arrow (5) tool connects ideas, the line (6) adds straight connectors, and the pen (7) lets you sketch freeform lines or notes.',
  },
  {
    element: 'label.ToolIcon[title^="Text"]',
    title: 'Content Tools',
    intro:
      'The text (8) tool lets you label your sketch, and the image (9) tool next to it lets you insert pictures or references onto the canvas.',
  },
  {
    element: 'label.ToolIcon[title^="Eraser"]',
    title: 'Eraser Tool',
    intro:
      "Click the eraser (0) once on any element to remove it. You can't drag to erase — one click per item.",
  },
  {
    element: '.dropdown-menu-button',
    title: 'Open the menu',
    intro:
      'Click the hamburger menu icon to access extra options like exporting your work.',
  },
  {
    title: 'Exporting your sketches',
    intro: `
      <p>From the menu, select Export image (or press Cmd + Shift + E) to open export options. Click Next to continue.</p>
      <img src="/blockly/media/sketchlab/export-image-button.png" alt="Export PNG button" style="width: 100%; max-width: 500px; border-radius: 8px; margin: 10px 0;" />

    `,
  },
  {
    title: 'Save as an image',
    intro: `
        <p>Choose the PNG option to save your canvas as an image. You'll use this later to share with the AI Tutor.</p>
        <img src="/blockly/media/sketchlab/export-image-dialog.png" alt="Export PNG dialog" style="width: 100%; max-width: 500px; border-radius: 8px; margin: 10px 0;" />
      `,
  },
  {
    element: `#${resourcePanelNavigationButtonElementId}`,
    title: 'Move on to the next level',
    intro:
      "When you're done with your Sketch Lab creation, click Continue to move on to the next level.",
  },
];
