import React from 'react';
import LegendItem from './LegendItem';
import './section-progress-refresh.scss';
import {StrongText} from '@cdo/apps/componentLibrary/typography';

export default function LevelTypesBox() {
  return (
    <div className="legend">
      <div className="headerContainer">
        <StrongText>Level Types</StrongText>
      </div>
      <div>
        <div className="icons">
          <div>
            <div>
              <LegendItem iconId="star" labelText="Assessment level" />
            </div>
            <div>
              <LegendItem iconId="split" labelText="Choice level" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
