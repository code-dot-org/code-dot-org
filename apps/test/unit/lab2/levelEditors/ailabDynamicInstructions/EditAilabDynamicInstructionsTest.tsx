import {act, render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditAilabDynamicInstructions from '@cdo/apps/lab2/levelEditors/ailabDynamicInstructions/EditAilabDynamicInstructions';

const DEFAULTS = {
  results: 'Review the results.',
  datasetView: 'Choose the columns.',
};

function renderEditor(
  initialDynamicInstructions: string | null,
  initialUsesLab2 = true,
  subscribeToUsesLab2?: (onChange: (usesLab2: boolean) => void) => () => void
) {
  const {container} = render(
    <EditAilabDynamicInstructions
      initialDynamicInstructions={initialDynamicInstructions}
      defaults={DEFAULTS}
      initialUsesLab2={initialUsesLab2}
      subscribeToUsesLab2={subscribeToUsesLab2}
    />
  );
  // The submitted value lives in a hidden input, which has no accessible role.
  const selector = '[name="level[dynamic_instructions]"]';
  return () =>
    // eslint-disable-next-line no-restricted-properties
    (container.querySelector(selector) as HTMLInputElement).value;
}

function fakeLab2Checkbox() {
  let listener: ((usesLab2: boolean) => void) | undefined;
  return {
    subscribe: (onChange: (usesLab2: boolean) => void) => {
      listener = onChange;
      return () => (listener = undefined);
    },
    set: (usesLab2: boolean) => act(() => listener?.(usesLab2)),
  };
}

function field(name: string) {
  return screen.getByRole('textbox', {name}) as HTMLTextAreaElement;
}

describe('EditAilabDynamicInstructions', () => {
  it('shows the JSON text area unchanged when Lab 2 is off', () => {
    const original = '{"selectDataset": "Pick one.", "bogus": 3}';
    const saved = renderEditor(original, false);
    expect(
      screen.queryByRole('textbox', {name: 'Testing screen'})
    ).not.toBeInTheDocument();
    expect(saved()).toBe(original);

    fireEvent.change(field('Dynamic instructions JSON'), {
      target: {value: '{"results": "Done."}'},
    });
    expect(saved()).toBe('{"results": "Done."}');
  });

  it('shows saved text in the fields and defaults as placeholders', () => {
    renderEditor('{"results": "How accurate was it?"}');
    expect(field('Testing screen')).toHaveValue('How accurate was it?');
    expect(field('Dataset screen')).toHaveValue('');
    expect(field('Dataset screen')).toHaveAttribute(
      'placeholder',
      'Choose the columns.'
    );
    expect(screen.queryByText(/will be removed/)).not.toBeInTheDocument();
  });

  it('omits keys Lab 2 never shows', () => {
    renderEditor(null);
    expect(
      screen
        .getAllByRole('textbox')
        .map(textbox => textbox.getAttribute('name'))
    ).toEqual([
      'ailab_dynamic_instructions_datasetView',
      'ailab_dynamic_instructions_results',
    ]);
  });

  it('drops unknown keys and non-string values, and lists them', () => {
    const saved = renderEditor(
      '{"trainModel": "Wait.", "selectDataset": "Pick.", "results": 5, "resultsDetails": "Details.", "datasetView": "Look.", "modelSummary": "Done.", "saveModel": ""}'
    );
    expect(screen.getByText(/will be removed/)).toHaveTextContent(
      'trainModel: "Wait."; selectDataset: "Pick."; results: 5; resultsDetails: "Details."; modelSummary: "Done."'
    );
    expect(JSON.parse(saved())).toEqual({datasetView: 'Look.'});
  });

  it('replaces a value that is not valid JSON', () => {
    const saved = renderEditor("{'results': 'Done.'}");
    expect(screen.getByText(/will be removed/)).toHaveTextContent(
      'not valid JSON'
    );
    expect(saved()).toBe('');
  });

  it('adds a key when its field is filled and removes it when cleared', () => {
    const saved = renderEditor(null);
    fireEvent.change(field('Testing screen'), {
      target: {value: 'How **accurate** was it?'},
    });
    expect(JSON.parse(saved())).toEqual({
      results: 'How **accurate** was it?',
    });

    fireEvent.change(field('Testing screen'), {
      target: {value: '  '},
    });
    expect(saved()).toBe('');
  });

  it('switches editors when Lab 2 is toggled, carrying edits across', () => {
    const lab2 = fakeLab2Checkbox();
    const saved = renderEditor(
      '{"results": "Done.", "selectDataset": "Pick."}',
      false,
      lab2.subscribe
    );

    lab2.set(true);
    fireEvent.change(field('Dataset screen'), {
      target: {value: 'Look.'},
    });

    lab2.set(false);
    expect(JSON.parse(field('Dynamic instructions JSON').value)).toEqual({
      results: 'Done.',
      datasetView: 'Look.',
    });

    lab2.set(true);
    expect(field('Testing screen')).toHaveValue('Done.');
    expect(JSON.parse(saved())).toEqual({
      results: 'Done.',
      datasetView: 'Look.',
    });
  });
});
