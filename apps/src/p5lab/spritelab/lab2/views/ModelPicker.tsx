/**
 * Chooses which trained AI Lab model this project predicts with.
 *
 * The list comes from /api/v1/ml_models/names, which is scoped to the
 * signed-in user and answers an anonymous request with the ownerless
 * models. An empty list is therefore the normal state for a signed-out
 * student, not an error.
 */

import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';
import React, {useCallback, useEffect, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {fetchModelCards} from '../ai/traits/modelApi';
import {availablePlaceholders} from '../ai/traits/traitPrompt';
import {setAvailableModels, setModelCard} from '../redux/spriteLab2Redux';

import moduleStyles from './trait-editor.module.scss';

interface ModelPickerProps {
  /** The model this project stored, applied once the list arrives. */
  modelId?: string;
  onModelIdChange: (modelId: string | undefined) => void;
  /** Image prompt with {Feature name} placeholders. */
  promptTemplate?: string;
  onPromptTemplateChange?: (template: string) => void;
}

const NONE = '';

const ModelPicker: React.FunctionComponent<ModelPickerProps> = ({
  modelId,
  onModelIdChange,
  promptTemplate,
  onPromptTemplateChange,
}) => {
  const dispatch = useAppDispatch();
  const models = useAppSelector(state => state.spriteLab2?.availableModels);
  const chosen = useAppSelector(state => state.spriteLab2?.modelCard);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchModelCards()
      .then(cards => {
        if (cancelled) {
          return;
        }
        dispatch(setAvailableModels(cards));
        // Reopening a project: the stored id means nothing until the list
        // can say which model it is.
        const stored = modelId && cards.find(c => c.modelId === modelId);
        if (stored) {
          dispatch(setModelCard(stored));
        }
      })
      .catch(() => !cancelled && setError('Could not load your models.'));
    return () => {
      cancelled = true;
    };
    // Runs once: a later change to modelId came from this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const choose = useCallback(
    (id: string) => {
      const card = (models || []).find(c => c.modelId === id);
      dispatch(setModelCard(card));
      onModelIdChange(card?.modelId);
    },
    [dispatch, models, onModelIdChange]
  );

  if (error) {
    return <div className={moduleStyles.empty}>{error}</div>;
  }

  return (
    <div className={moduleStyles.picker}>
      <SimpleDropdown
        name="aiModel"
        labelText="AI model"
        size="s"
        selectedValue={chosen?.modelId || NONE}
        onChange={event => choose(event.target.value)}
        items={[
          {
            value: NONE,
            text: (models || []).length
              ? 'No model'
              : 'No trained models on this account',
          },
          ...(models || []).map(card => ({
            value: card.modelId,
            text: card.name,
          })),
        ]}
      />
      {chosen && (
        <span className={moduleStyles.note}>
          {chosen.fields.length} features, predicts {chosen.labelName}
        </span>
      )}
      {chosen && onPromptTemplateChange && (
        <div className={moduleStyles.templateField}>
          <TextField
            name="imagePromptTemplate"
            label="Image prompt"
            size="s"
            value={promptTemplate || ''}
            placeholder="A houseplant with {Leaf spots} spots"
            onChange={event => onPromptTemplateChange(event.target.value)}
          />
          <span className={moduleStyles.note}>
            Use {availablePlaceholders(chosen).join(' ')} to draw an image from
            an image&apos;s own feature values.
          </span>
        </div>
      )}
    </div>
  );
};

export default ModelPicker;
