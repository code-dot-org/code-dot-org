import React from 'react';
import i18n from '@cdo/locale';
import LegendItem from './LegendItem';
import './section-progress-refresh.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function LevelTypesBox() {
  return (
    <div className="legend">
      <div className="headerContainer">
        <StrongText>{i18n.levelTypes()}</StrongText>
      </div>
      <div>
        <div className="icons">
          <div>
            <div>
              <LegendItem
                fontAwesomeId="star"
                labelText={i18n.assessmentLevel()}
              />
            </div>
            <div>
              <LegendItem
                fontAwesomeId="split"
                labelText={i18n.choiceLevel()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
