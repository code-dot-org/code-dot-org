import React, {useState} from 'react';
const ToggleGroup = require('@cdo/apps/templates/ToggleGroup').default;
import color from '@cdo/apps/util/color';
import {CachedWeightsMapping} from './DanceAiClient';

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

enum FieldKey {
  BACKGROUND_EFFECT = 'backgroundEffect',
  FOREGROUND_EFFECT = 'foregroundEffect',
  BACKGROUND_PALETTE = 'backgroundColor',
}

type Result = {[key in FieldKey]: string};

interface AiExplanationViewProps {
  inputs: string[];
  result: Result;
  backgroundMapping: [string, string][];
  foregroundMapping: [string, string][];
  paletteMapping: [string, string][];
}

interface FieldObject {
  name: string;
  data: CachedWeightsMapping;
  labelTranslations: [string, string][];
}

interface Fields {
  [FieldKey.BACKGROUND_EFFECT]: FieldObject;
  [FieldKey.FOREGROUND_EFFECT]: FieldObject;
  [FieldKey.BACKGROUND_PALETTE]: FieldObject;
}

// block has translated values
// keys from model results won't be translated (but are what are used here, i think, as labels

/**
 * Presents some bar charts explaining how output values were chosen.
 */
const AiExplanationView: React.FunctionComponent<AiExplanationViewProps> = ({
  inputs,
  result,
  backgroundMapping,
  foregroundMapping,
  paletteMapping,
}) => {
  console.log(backgroundMapping);
  const [currentFieldKey, setCurrentFieldKey] = useState(
    FieldKey.BACKGROUND_EFFECT
  );

  const fields: Fields = {
    [FieldKey.BACKGROUND_EFFECT]: {
      name: 'Background effect',
      data: CachedBackgrounds as CachedWeightsMapping,
      labelTranslations: backgroundMapping,
    },
    [FieldKey.FOREGROUND_EFFECT]: {
      name: 'Foreground effect',
      data: CachedForegrounds as CachedWeightsMapping,
      labelTranslations: foregroundMapping,
    },
    [FieldKey.BACKGROUND_PALETTE]: {
      name: 'Background palette',
      data: CachedPalettes as CachedWeightsMapping,
      labelTranslations: paletteMapping,
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
            // result[currentFieldKey] => 'disco_ball'
            // context.tick.label => Colors
            // mapping between disco_ball -> colors only in currentField.labelTranslations
            const translations = currentField.labelTranslations;
            const translationTuple = translations.find(
              translationMapping =>
                translationMapping[1] === result[currentFieldKey]
            );

            if (
              translationTuple &&
              context.tick.label === translationTuple[0]
            ) {
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
    const translationTuple = translations.find(
      translationMapping => translationMapping[1] === label
    );

    // if we can't find a translation for the key from the model,
    // display the untranslated key
    const translatedString = translationTuple ? translationTuple[0] : label;
    return translatedString;
  });

  // to do: refactor into shared function
  // const findTranslation = (value, mapping) => {};

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

export default AiExplanationView;
