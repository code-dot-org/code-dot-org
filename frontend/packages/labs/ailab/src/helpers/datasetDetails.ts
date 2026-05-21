import I18n from '../i18n';
import {DatasetDetails} from '../types';
import {RootState} from '../redux';

/* Helper functions for getting information about the selected dataset. */

export function getDatasetDetails(state: RootState): DatasetDetails {
  const datasetDetails: DatasetDetails = {
    name: state.metadata?.name || '',
    description: getDatasetDescription(state),
    numRows: state.data.length,
    isUserUploaded: isUserUploadedDataset(state),
    potentialUses: getPotentialUses(state),
    potentialMisuses: getPotentialMisuses(state),
  };
  return datasetDetails;
}

function getCardContextAttr(
  state: RootState,
  attr: string,
): string | undefined {
  if (
    state.metadata?.name &&
    state.metadata?.card?.context &&
    state.metadata.card.context[
      attr as keyof typeof state.metadata.card.context
    ]
  ) {
    const datasetId = state.metadata.name;
    const fallback =
      state.metadata.card.context[
        attr as keyof typeof state.metadata.card.context
      ]!;
    return I18n.t(attr, {
      scope: ['datasets', datasetId, 'card', 'context'],
      default: fallback,
    });
  }
  return undefined;
}
function getPotentialUses(state: RootState): string | undefined {
  return getCardContextAttr(state, 'potentialUses');
}

function getPotentialMisuses(state: RootState): string | undefined {
  return getCardContextAttr(state, 'potentialMisuses');
}

export function getDatasetDescription(state: RootState): string {
  // If this a dataset from the internal collection that already has a description, use that.
  if (state.metadata?.name && state.metadata?.card?.description) {
    const datasetId = state.metadata.name;
    const fallback = state.metadata.card.description;
    return (
      I18n.t('description', {
        scope: ['datasets', datasetId, 'card'],
        default: fallback,
      }) || fallback
    );
  } else if (state.trainedModelDetails?.datasetDescription) {
    return state.trainedModelDetails.datasetDescription;
  } else {
    return '';
  }
}

export function isUserUploadedDataset(state: RootState): boolean {
  // The csvfile for internally curated datasets are strings; those uploaded by
  // users are objects. Use data type as a proxy to know which case we're in.
  return typeof state.csvfile === 'object' && state.csvfile !== null;
}
