import React, {useState} from 'react';
const ToggleGroup = require('@cdo/apps/templates/ToggleGroup').default;
import color from '@cdo/apps/util/color';
import {CachedWeightsMapping} from './DanceAiClient';
import {
  DropdownTranslations,
  TranslationTuple,
  Translations,
  FieldKey,
} from '../types';

import CachedPalettes from '@cdo/static/dance/ai/model/cached-spacy-palette-map.json';
import CachedBackgrounds from '@cdo/static/dance/ai/model/cached-spacy-background-map.json';
import CachedForegrounds from '@cdo/static/dance/ai/model/cached-spacy-foreground-map.json';

import {
  Chart as ChartJS,
  ChartOptions,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {Bar} from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Result = {[key in FieldKey]: string};

interface AiExplanationViewProps {
  inputs: string[];
  result: Result;
  translations: Translations;
}

interface FieldObject {
  name: string;
  data: CachedWeightsMapping;
  labelTranslations: DropdownTranslations;
}

interface Fields {
  [FieldKey.BACKGROUND_EFFECT]: FieldObject;
  [FieldKey.FOREGROUND_EFFECT]: FieldObject;
  [FieldKey.BACKGROUND_PALETTE]: FieldObject;
}

/**
 * Presents some bar charts explaining how output values were chosen.
 */
const AiExplanationView: React.FunctionComponent<AiExplanationViewProps> = ({
  inputs,
  result,
  translations,
}) => {
  const [currentFieldKey, setCurrentFieldKey] = useState(
    FieldKey.BACKGROUND_EFFECT
  );

  const fields: Fields = {
    [FieldKey.BACKGROUND_EFFECT]: {
      name: 'Background effect',
      data: CachedBackgrounds as CachedWeightsMapping,
      labelTranslations: translations[FieldKey.BACKGROUND_EFFECT],
    },
    [FieldKey.FOREGROUND_EFFECT]: {
      name: 'Foreground effect',
      data: CachedForegrounds as CachedWeightsMapping,
      labelTranslations: translations[FieldKey.FOREGROUND_EFFECT],
    },
    [FieldKey.BACKGROUND_PALETTE]: {
      name: 'Background color',
      data: CachedPalettes as CachedWeightsMapping,
      labelTranslations: translations[FieldKey.BACKGROUND_PALETTE],
    },
  };

  const currentField = fields[currentFieldKey];

  const options: ChartOptions<'bar'> = {
    scales: {
      y: {
        stacked: true,
      },
      x: {
        stacked: true,
        ticks: {
          color: function (context) {
            const translations = currentField.labelTranslations;
            const translation = getTranslation(
              result[currentFieldKey],
              translations
            );

            if (translation && context.tick.label === translation) {
              return 'rgba(54, 162, 235, 1)';
            }
            return '#000000';
          },
        },
      },
    },
  };

  const colors = [
    'rgb(255, 99, 132)',
    'rgb(75, 192, 192)',
    'rgb(53, 162, 235)',
  ];

  const labels = currentField.data.output.map(label => {
    const translations = currentField.labelTranslations;
    const translation = getTranslation(label, translations);

    // if we can't find a translation for the key from the model,
    // display the untranslated key
    return translation || label;
  });

  const emojiAssociations = currentField.data.emojiAssociations;
  const datasets = Object.keys(emojiAssociations)
    .filter((emojiId: string) => {
      return inputs.includes(emojiId);
    })
    .map((emojiId: string, index) => {
      return {
        label: emojiId,
        data: emojiAssociations[emojiId],
        backgroundColor: colors[index],
      };
    });

  const data = {
    labels,
    datasets: datasets,
  };

  const handleFieldClick = (fieldKey: FieldKey) => {
    setCurrentFieldKey(fieldKey);
  };

  return (
    <div>
      <ToggleGroup
        selected={currentFieldKey}
        activeColor={color.teal}
        onChange={handleFieldClick}
      >
        {Object.keys(fields).map((fieldKey, index) => {
          return (
            <button key={index} type="button" value={fieldKey}>
              <div>{fields[fieldKey as FieldKey].name}</div>
            </button>
          );
        })}
      </ToggleGroup>
      <Bar width={800} height={255} options={options} data={data} />
    </div>
  );
};

const getTranslation = (
  key: string,
  translations: DropdownTranslations
): string | undefined => {
  const translationTuple: TranslationTuple | undefined = translations.find(
    translationMapping => translationMapping[1] === key
  );

  return translationTuple ? translationTuple[0] : undefined;
};

export default AiExplanationView;
