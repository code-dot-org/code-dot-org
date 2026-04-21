import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {type StepOptions, type Tour} from 'shepherd.js';

import {resourcePanelNavigationButtonElementId} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import {
  backButton,
  doneButton,
  nextButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

const toElement = (jsx: React.ReactElement): HTMLElement => {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(jsx);
  return div;
};

export const createSketchlabTourSteps = (tour: Tour): StepOptions[] => [
  {
    id: 'hand-tool',
    attachTo: {element: 'label.ToolIcon[title^="Hand"]', on: 'bottom'},
    title: 'Grab and Select Tools',
    text: 'Use the hand tool to move around the canvas. Switch to the pointer (1) tool to select elements or drag to select multiple.',
    buttons: [nextButton(tour)],
  },
  {
    id: 'shape-tools',
    attachTo: {element: 'label.ToolIcon[title^="Rectangle"]', on: 'bottom'},
    title: 'Shape Tools',
    text: 'This square (2) tool and the icons next to it - diamond (3) and circle (4) - let you draw basic shapes for diagrams and layouts.',
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'line-pen-tools',
    attachTo: {element: 'label.ToolIcon[title^="Arrow"]', on: 'bottom'},
    title: 'Line and Pen Tools',
    text: 'The arrow (5) tool connects ideas, the line (6) adds straight connectors, and the pen (7) lets you sketch freeform lines or notes.',
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'content-tools',
    attachTo: {element: 'label.ToolIcon[title^="Text"]', on: 'bottom'},
    title: 'Content Tools',
    text: 'The text (8) tool lets you label your sketch, and the image (9) tool next to it lets you insert pictures or references onto the canvas.',
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'eraser-tool',
    attachTo: {element: 'label.ToolIcon[title^="Eraser"]', on: 'bottom'},
    title: 'Eraser Tool',
    text: "Click the eraser (0) once on any element to remove it. You can't drag to erase — one click per item.",
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'open-menu',
    attachTo: {
      element: '.dropdown-menu-button.main-menu-trigger',
      on: 'bottom',
    },
    title: 'Open the menu',
    text: 'Click the hamburger menu icon to access extra options like exporting your work.',
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'exporting',
    title: 'Exporting your sketches',
    text: toElement(
      <>
        <p>
          From the menu, select Export image (or press Cmd + Shift + E) to open
          export options. Click Next to continue.
        </p>
        <img
          src="/blockly/media/sketchlab/export-image-button.png"
          alt="Export PNG button"
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '8px',
            margin: '10px 0',
          }}
        />
      </>
    ),
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'save-as-image',
    title: 'Save as an image',
    text: toElement(
      <>
        <p>
          Choose the PNG option to save your canvas as an image. You'll use this
          later to share with the AI Tutor.
        </p>
        <img
          src="/blockly/media/sketchlab/export-image-dialog.png"
          alt="Export PNG dialog"
          style={{
            width: '100%',
            maxWidth: '700px',
            borderRadius: '8px',
            margin: '10px 0',
          }}
        />
      </>
    ),
    buttons: [backButton(tour), nextButton(tour)],
  },
  {
    id: 'navigation',
    attachTo: {
      element: `#${resourcePanelNavigationButtonElementId}`,
      on: 'top',
    },
    title: 'Move on to the next level',
    text: "When you're done with your Sketch Lab creation, click Continue to move on to the next level.",
    buttons: [backButton(tour), doneButton(tour)],
  },
];
