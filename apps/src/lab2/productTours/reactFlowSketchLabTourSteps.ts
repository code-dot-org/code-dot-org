import {offset} from '@floating-ui/dom';
import {type StepOptions, type Tour} from 'shepherd.js';

import {
  backButton,
  doneButton,
  nextButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {
  TOUR_GROUP,
  TOUR_GROUP_ATTR,
} from '@cdo/apps/sketchlab/reactFlow/constants';

const TOOLBAR_BUTTON = {
  addText: 'button[aria-label="Add text"]',
  addArrow: 'button[aria-label="Add arrow"]',
  addImage: 'button[aria-label="Add image"]',
  addRectangle: 'button[aria-label="Add rectangle"]',
} as const;

// Wrappers around related buttons, so a step highlights the whole set it
// describes rather than one button. Toolbar.tsx / CanvasControls.tsx render
// these attributes.
const groupSelector = (group: string) => `[${TOUR_GROUP_ATTR}="${group}"]`;
const TOOLBAR_GROUP = {
  selectionTools: groupSelector(TOUR_GROUP.selectionTools),
  shapeTools: groupSelector(TOUR_GROUP.shapeTools),
  undoRedo: groupSelector(TOUR_GROUP.undoRedo),
  zoom: groupSelector(TOUR_GROUP.zoom),
} as const;

const SHAPE_TOOLBAR = '[role="toolbar"][aria-label="Shape style"]';

export const createReactFlowSketchLabTourSteps = (
  tour: Tour
): StepOptions[] => {
  // Watches for the shape toolbar to appear so the "add a shape" step can
  // advance itself once the user drops a shape on the canvas.
  let shapeToolbarObserver: MutationObserver | null = null;

  const stopWatchingForShapeToolbar = () => {
    shapeToolbarObserver?.disconnect();
    shapeToolbarObserver = null;
  };

  // The step's hide() runs on step-to-step navigation, but cancel/complete
  // tear steps down via destroy() with no hide event, so the observer would
  // keep watching the whole document. Clean up on those events too.
  tour.on('complete', stopWatchingForShapeToolbar);
  tour.on('cancel', stopWatchingForShapeToolbar);

  return [
    {
      id: 'sketchlab-welcome',
      title: 'Welcome to Sketch Lab',
      text: 'Sketch Lab is a place where you can sketch your ideas with shapes, images and text.',
      buttons: [nextButton(tour)],
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    },
    {
      id: 'grab-select-tools',
      attachTo: {element: TOOLBAR_GROUP.selectionTools, on: 'right'},
      title: 'Grab and select tools',
      text: "Use the select tool to click on elements. Use the hand tool to move the canvas around. Looking for keyboard navigation? Try pressing '/' after you finish the tour.",
      buttons: [nextButton(tour)],
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    },
    {
      id: 'shape-tools',
      attachTo: {element: TOOLBAR_GROUP.shapeTools, on: 'right'},
      title: 'Shapes',
      text: 'These buttons add shapes to your canvas. You can double click or press enter on a shape to add text.',
      buttons: [backButton(tour), nextButton(tour)],
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    },
    {
      id: 'text-tool',
      attachTo: {element: TOOLBAR_BUTTON.addText, on: 'right'},
      title: 'Text',
      text: 'Add a text box to label parts of your sketch or add notes.',
      buttons: [backButton(tour), nextButton(tour)],
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    },
    {
      id: 'arrow-tool',
      attachTo: {element: TOOLBAR_BUTTON.addArrow, on: 'right'},
      title: 'Arrow',
      text: 'Add an arrow to your canvas. Arrows can be unattached, or you can drag either end onto a shape, text or image to connect elements on the canvas.',
      buttons: [backButton(tour), nextButton(tour)],
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    },
    {
      id: 'image-tool',
      attachTo: {element: TOOLBAR_BUTTON.addImage, on: 'right'},
      title: 'Image',
      text: 'Upload an image to drop it onto the canvas.',
      buttons: [backButton(tour), nextButton(tour)],
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    },
    {
      id: 'add-a-shape',
      attachTo: {element: TOOLBAR_BUTTON.addRectangle, on: 'right'},
      title: 'Try adding a shape',
      text: 'Your turn! Click on the rectangle button to add a new rectangle to the canvas.',
      buttons: [backButton(tour)],
      when: {
        show() {
          // If the toolbar is already visible, advance right away.
          if (document.querySelector(SHAPE_TOOLBAR)) {
            stopWatchingForShapeToolbar();
            tour.next();
            return;
          }
          shapeToolbarObserver = new MutationObserver(() => {
            if (document.querySelector(SHAPE_TOOLBAR)) {
              stopWatchingForShapeToolbar();
              // Advance when the shape toolbar shows up.
              tour.next();
            }
          });
          shapeToolbarObserver.observe(document.body, {
            childList: true,
            subtree: true,
          });
        },
        hide() {
          stopWatchingForShapeToolbar();
        },
      },
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    },
    {
      id: 'shape-toolbar',
      attachTo: {element: SHAPE_TOOLBAR, on: 'left'},
      title: 'Style your shape',
      text: 'Whenever an element is selected, its toolbar appears. Use it to change colors, styling, or rotation. You can also duplicate the element, send it to the front or back of the canvas, or delete it.',
      // Trying to go back here gets you into a weird state since you've already added a shape, so only allow next.
      buttons: [nextButton(tour)],
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    },
    {
      id: 'undo-redo',
      attachTo: {element: TOOLBAR_GROUP.undoRedo, on: 'left'},
      title: 'Undo and redo',
      text: 'You can go backward and forward in your history with the undo and redo buttons.',
      buttons: [backButton(tour), nextButton(tour)],
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    },
    {
      id: 'zoom-controls',
      attachTo: {element: TOOLBAR_GROUP.zoom, on: 'left'},
      title: 'Zoom controls',
      text: 'You can zoom in and out here, or use zoom to fit to frame your whole sketch on screen.',
      buttons: [backButton(tour), doneButton(tour)],
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    },
  ];
};
