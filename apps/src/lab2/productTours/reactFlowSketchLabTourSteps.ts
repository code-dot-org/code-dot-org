import {type StepOptions, type Tour} from 'shepherd.js';

import {
  backButton,
  doneButton,
  nextButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

// aria-labels the React Flow toolbar and canvas controls render on their
// buttons. Tour steps attach to these rather than the unstable useId()-based
// ids so a copy or markup tweak in Toolbar.tsx surfaces here as a broken step.
const TOOLBAR_BUTTON = {
  select: 'button[aria-label="Select tool"]',
  addRectangle: 'button[aria-label="Add rectangle"]',
  addText: 'button[aria-label="Add text"]',
  addArrow: 'button[aria-label="Add arrow"]',
  addImage: 'button[aria-label="Add image"]',
  undo: 'button[aria-label="Undo"]',
  zoomIn: 'button[aria-label="Zoom in"]',
} as const;

// The per-shape toolbar that opens when a shape node is selected. Adding a
// shape auto-selects it and opens this toolbar, which is how the interactive
// step below knows the user completed the task.
const SHAPE_TOOLBAR = '[role="toolbar"][aria-label="Shape style"]';

export const createReactFlowSketchLabTourSteps = (
  tour: Tour
): StepOptions[] => {
  // Watches for the shape toolbar to appear so the "add a shape" step can
  // advance itself once the user drops a shape on the canvas.
  let shapeToolbarObserver: MutationObserver | null = null;

  return [
    {
      id: 'grab-select-tools',
      attachTo: {element: TOOLBAR_BUTTON.select, on: 'right'},
      title: 'Grab and select tools',
      text: 'Use the select tool to click elements or drag a box to select several at once. Switch to the hand tool below it to pan around the canvas.',
      buttons: [nextButton(tour)],
    },
    {
      id: 'shape-tools',
      attachTo: {element: TOOLBAR_BUTTON.addRectangle, on: 'right'},
      title: 'Shapes',
      text: 'These buttons add shapes — rectangle, triangle, circle, and diamond — for building diagrams and layouts.',
      buttons: [backButton(tour), nextButton(tour)],
    },
    {
      id: 'text-tool',
      attachTo: {element: TOOLBAR_BUTTON.addText, on: 'right'},
      title: 'Text',
      text: 'Add a text box to label parts of your sketch or jot down notes.',
      buttons: [backButton(tour), nextButton(tour)],
    },
    {
      id: 'arrow-tool',
      attachTo: {element: TOOLBAR_BUTTON.addArrow, on: 'right'},
      title: 'Arrow',
      text: 'Add an arrow to connect ideas. Drag either end onto a shape to connect elements on the canvas, and double-click the arrow to add a label.',
      buttons: [backButton(tour), nextButton(tour)],
    },
    {
      id: 'image-tool',
      attachTo: {element: TOOLBAR_BUTTON.addImage, on: 'right'},
      title: 'Image',
      text: 'Upload a picture or reference image and drop it onto the canvas.',
      buttons: [backButton(tour), nextButton(tour)],
    },
    {
      id: 'add-a-shape',
      attachTo: {element: TOOLBAR_BUTTON.addRectangle, on: 'right'},
      title: 'Try adding a shape',
      text: 'Your turn — click here to add a rectangle to the canvas.',
      buttons: [backButton(tour), nextButton(tour)],
      when: {
        show() {
          shapeToolbarObserver = new MutationObserver(() => {
            if (document.querySelector(SHAPE_TOOLBAR)) {
              tour.next();
            }
          });
          shapeToolbarObserver.observe(document.body, {
            childList: true,
            subtree: true,
          });
        },
        hide() {
          shapeToolbarObserver?.disconnect();
          shapeToolbarObserver = null;
        },
      },
    },
    {
      id: 'shape-toolbar',
      attachTo: {element: SHAPE_TOOLBAR, on: 'left'},
      title: 'Style your shape',
      text: 'Whenever a shape is selected, this toolbar appears. Use it to change the fill and border colors, size, rotation, and text styling.',
      buttons: [backButton(tour), nextButton(tour)],
    },
    {
      id: 'undo-redo',
      attachTo: {element: TOOLBAR_BUTTON.undo, on: 'left'},
      title: 'Undo and redo',
      text: 'Made a mistake? Undo reverses your last change, and redo brings it back.',
      buttons: [backButton(tour), nextButton(tour)],
    },
    {
      id: 'zoom-controls',
      attachTo: {element: TOOLBAR_BUTTON.zoomIn, on: 'left'},
      title: 'Zoom controls',
      text: 'Zoom in and out to focus on details, or use zoom to fit to frame your whole sketch on screen.',
      buttons: [backButton(tour), doneButton(tour)],
    },
  ];
};
