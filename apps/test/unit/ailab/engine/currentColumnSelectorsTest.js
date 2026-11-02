import {
  getUniqueOptionsCurrentColumn,
  getExtremaCurrentColumn,
  getOptionFrequenciesCurrentColumn,
  isCurrentColumnReadOnly,
  currentColumnContainsOnlyNumbers,
} from '@cdo/apps/ailab/engine/selectors/currentColumnSelectors';

import {
  classificationState,
  classificationRows,
  allNumericalState,
  allNumericalRows,
  premadeDatasetState,
  batCountMax,
  batCountMin,
} from './testData';

describe('derives details about current categorical column', () => {
  test('gets unique options current column', async () => {
    const uniqueOptions = getUniqueOptionsCurrentColumn.resultFunc(
      classificationState.currentColumn,
      classificationRows
    );
    expect(uniqueOptions).toEqual(['cool', 'hot', 'mild']);
  });

  test('gets option frequencies current column', async () => {
    const optionFrequencies = getOptionFrequenciesCurrentColumn.resultFunc(
      classificationState.currentColumn,
      classificationRows
    );
    expect(optionFrequencies).toEqual({hot: 2, mild: 2, cool: 2});
  });

  test('current column does not contain only numbers', () => {
    const containsOnlyNumbers = currentColumnContainsOnlyNumbers.resultFunc(
      classificationState.currentColumn,
      classificationRows
    );
    expect(containsOnlyNumbers).toBe(false);
  });
});

describe('derives details about current numerical column', () => {
  test('gets extrema current column', async () => {
    const extrema = getExtremaCurrentColumn.resultFunc(
      allNumericalState.currentColumn,
      allNumericalRows
    );
    expect(extrema.max).toBe(batCountMax);
    expect(extrema.min).toBe(batCountMin);
    expect(extrema.range).toBe(batCountMax - batCountMin);
  });

  test('current column contains only numbers', () => {
    const containsOnlyNumbers = currentColumnContainsOnlyNumbers.resultFunc(
      allNumericalState.currentColumn,
      allNumericalRows
    );
    expect(containsOnlyNumbers).toBe(true);
  });
});

describe('derives details about current column', () => {
  test('current column is readOnly', async () => {
    const isReadOnly = isCurrentColumnReadOnly.resultFunc(
      premadeDatasetState.currentColumn,
      premadeDatasetState.dataset.metadata
    );
    expect(isReadOnly).toBe(true);
  });

  test('current column is not readOnly', async () => {
    const isReadOnly = isCurrentColumnReadOnly.resultFunc(
      allNumericalState.currentColumn,
      allNumericalState.dataset.metadata
    );
    expect(isReadOnly).toBe(false);
  });
});
