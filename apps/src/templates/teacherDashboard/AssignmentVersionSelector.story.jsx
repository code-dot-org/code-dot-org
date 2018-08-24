import React from 'react';
import {action} from '@storybook/addon-actions';
import AssignmentVersionSelector from './AssignmentVersionSelector';

const styles = {
 dropdown: {
    padding: '0.3em',
  },
};

const defaultVersions = [
  {
    year: '2019',
    title: "19'-20'",
    isStable: false,
    locales: [],
  }, {
    year: '2018',
    title: "18'-19'",
    isStable: true,
    isRecommended: true,
    isSelected: false,
    locales: ['English'],
  }, {
    year: '2017',
    title: "17'-18'",
    isStable: true,
    isRecommended: false,
    isSelected: true,
    locales: ['English', 'French', 'Spanish'],
  }
];

export default storybook => {
  storybook
    .storiesOf('AssignmentVersionSelector', module)
    .addStoryTable([
      {
        name: 'with popup menu',
        story: () => {
          return (
            <AssignmentVersionSelector
              dropdownStyle={styles.dropdown}
              onChangeVersion={action('onChangeVersion')}
              versions={defaultVersions}
            />
          );
        }
      }, {
        name: 'with popup menu, disabled',
        story: () => {
          return (
            <AssignmentVersionSelector
              dropdownStyle={styles.dropdown}
              onChangeVersion={action('onChangeVersion')}
              versions={defaultVersions}
              disabled
            />
          );
        }
      }
    ]);
};
