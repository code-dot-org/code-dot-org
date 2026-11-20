import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import header from '@cdo/apps/code-studio/header';
import AuthoredTourEditor from '@cdo/apps/lab2/productTours/authored/editor/AuthoredTourEditor';
import {
  AuthoredTour,
  TourReference,
  TourUsage,
} from '@cdo/apps/lab2/productTours/authored/types';

const mockLevelProperties: {
  id: number;
  name: string;
  appName: string;
  productTourLibrary?: AuthoredTour[];
  tourReferences?: TourReference[];
  productTourUsage?: TourUsage;
} = {id: 7, name: 'Level 7', appName: 'ailab'};

jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (
    selector: (state: {lab: {levelProperties: unknown}}) => unknown
  ) => selector({lab: {levelProperties: mockLevelProperties}}),
}));

jest.mock('@cdo/apps/code-studio/header', () => ({
  __esModule: true,
  default: {showLevelBuilderSaveButton: jest.fn()},
}));

const savedChanges = (): {
  tourReferences: TourReference[];
  tours: AuthoredTour[];
  deletedTourIds: string[];
} => {
  const calls = (header.showLevelBuilderSaveButton as jest.Mock).mock.calls;
  const [getChanges] = calls[calls.length - 1];
  return getChanges();
};

const sharedTour: AuthoredTour = {
  id: 'shared',
  name: 'Training a model',
  steps: [{id: 'step-1', title: 'Welcome', text: 'Hello'}],
};

const level8 = {
  id: 8,
  name: 'Level 8',
  label: 'unit-8 · Lesson 1 · Level 2',
  url: '/s/unit-8/lessons/1/levels/2',
};

const openMenu = (label: string) =>
  fireEvent.click(screen.getByLabelText(label));

describe('AuthoredTourEditor', () => {
  beforeEach(() => {
    mockLevelProperties.productTourLibrary = undefined;
    mockLevelProperties.tourReferences = undefined;
    mockLevelProperties.productTourUsage = undefined;
    document.body.innerHTML =
      '<div data-tour-anchor="train-panel" data-tour-label="Train panel"><b>Train</b></div>';
  });

  it('saves references and edited tours in one request', () => {
    render(<AuthoredTourEditor />);
    const [, headerText, saveUrl] = (
      header.showLevelBuilderSaveButton as jest.Mock
    ).mock.calls[0];
    expect(headerText).toBe('Levelbuilder: edit product tours');
    expect(saveUrl).toBe('/levels/7/update_product_tours');
    expect(savedChanges()).toEqual({
      tourReferences: [],
      tours: [],
      deletedTourIds: [],
    });
  });

  it('creates a tour in edit mode with a step that points at the lab', () => {
    render(<AuthoredTourEditor />);
    fireEvent.click(screen.getByText('Library'));
    fireEvent.click(screen.getByText('Create a new tour'));
    expect(screen.getByText('Edit tour')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tour 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Add step'));
    expect(screen.getByText('Edit step')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Title'), {
      target: {value: 'Train your model'},
    });
    fireEvent.click(screen.getByText('Pick a part of the lab'));
    fireEvent.click(document.querySelector('[data-tour-anchor] b')!);
    expect(screen.getAllByText('Train panel').length).toBeGreaterThan(0);

    const {tourReferences, tours} = savedChanges();
    expect(tourReferences).toEqual([]);
    expect(tours).toHaveLength(1);
    expect(tours[0].steps[0]).toMatchObject({
      anchor: 'train-panel',
      anchorLabel: 'Train panel',
      title: 'Train your model',
    });
  });

  it('does not pass a pick click on to the lab', () => {
    const onLabClick = jest.fn();
    document
      .querySelector('[data-tour-anchor]')!
      .addEventListener('click', onLabClick);
    render(<AuthoredTourEditor />);
    fireEvent.click(screen.getByText('Library'));
    fireEvent.click(screen.getByText('Create a new tour'));
    fireEvent.click(screen.getByText('Add step'));
    fireEvent.click(screen.getByText('Pick a part of the lab'));
    fireEvent.click(document.querySelector('[data-tour-anchor] b')!);
    expect(onLabClick).not.toHaveBeenCalled();
  });

  it('previews a library tour read-only and adds it to the level', () => {
    mockLevelProperties.productTourLibrary = [sharedTour];
    render(<AuthoredTourEditor />);
    expect(screen.getByText('No tours on this level')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Add from library'));
    fireEvent.click(screen.getByText('Training a model'));
    expect(screen.getByText('Preview tour')).toBeInTheDocument();
    expect(screen.queryByText('Add step')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Welcome'));
    expect(screen.getByText('Preview step')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeDisabled();
    expect(
      screen.queryByText('Pick a part of the lab')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Back'));
    fireEvent.click(screen.getByText('Add to level'));
    expect(screen.queryByText('Add to level')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Back'));
    fireEvent.click(screen.getByText('This level'));
    openMenu('Training a model options');
    fireEvent.click(screen.getByText('Start automatically'));

    expect(savedChanges()).toEqual({
      tourReferences: [{id: 'shared', autoStart: true}],
      tours: [],
      deletedTourIds: [],
    });
  });

  it('edits an unshared tour without asking', () => {
    mockLevelProperties.productTourLibrary = [sharedTour];
    render(<AuthoredTourEditor />);
    fireEvent.click(screen.getByText('Library'));
    fireEvent.click(screen.getByText('Training a model'));
    openMenu('Tour options');
    fireEvent.click(screen.getByText('Edit tour'));
    expect(screen.queryByText('Edit a shared tour?')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Training a model')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Done editing'));
    expect(screen.getByText('Preview tour')).toBeInTheDocument();
  });

  it('offers a copy before editing a tour other levels use', () => {
    mockLevelProperties.productTourLibrary = [sharedTour];
    mockLevelProperties.tourReferences = [{id: 'shared', autoStart: true}];
    mockLevelProperties.productTourUsage = {shared: [level8]};
    render(<AuthoredTourEditor />);
    openMenu('Training a model options');
    fireEvent.click(screen.getByText('Edit tour'));
    expect(screen.getByText('Edit a shared tour?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Make a copy'));
    expect(
      screen.getByDisplayValue('Training a model (copy)')
    ).toBeInTheDocument();

    const {tourReferences, tours} = savedChanges();
    expect(tours).toHaveLength(1);
    expect(tours[0].id).not.toBe('shared');
    expect(tours[0].steps).toEqual(sharedTour.steps);
    expect(tourReferences).toEqual([{id: tours[0].id, autoStart: true}]);
  });

  it('lists the levels that use a tour and will not delete it', () => {
    mockLevelProperties.productTourLibrary = [sharedTour];
    mockLevelProperties.productTourUsage = {shared: [level8]};
    render(<AuthoredTourEditor />);
    fireEvent.click(screen.getByText('Library'));
    expect(screen.getByText('1 step • Used in 1 level')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Training a model'));
    expect(screen.getByText(level8.label)).toBeInTheDocument();

    openMenu('Tour options');
    fireEvent.click(screen.getByText('Edit tour'));
    fireEvent.click(screen.getByText('Edit for all levels'));
    openMenu('Tour options');
    expect(
      screen.getByText('Delete tour (used on other levels)').closest('button')
    ).toBeDisabled();
  });
});
