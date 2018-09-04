import React from 'react';
import color from "../../../util/color";
import i18n from '@cdo/locale';
import SectionSelector from './SectionSelector';

const styles = {
  selectSectionLabel: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    color: color.dark_charcoal,
    marginTop: 15,
    marginBottom: 4,
  },
  sectionSelector: {
    width: 350,
    height: 45,
    fontSize: 18,
    marginBottom: 15,
  },
};

export default class LabeledSectionSelector extends React.Component {
  render() {
    return (
      <div>
        <div>
          <div style={styles.selectSectionLabel}>{i18n.selectSectionLabel()}</div>
          <SectionSelector style={styles.sectionSelector}/>
        </div>
      </div>
    );
  }
}
