import I18n from '../i18n';

export function getLocalizedValue(
  value: string | number,
  datasetId: string,
): string | number {
  if (typeof value === 'number') {
    return value;
  }

  if (Number.isFinite(+(value || NaN))) {
    return value;
  }

  return (
    I18n.t(value, {
      scope: ['datasets', datasetId, 'values'],
      default: value,
    }) || value
  );
}
