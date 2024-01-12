import PropTypes from 'prop-types';
import React from 'react';
import {Heading1, Heading6} from '@cdo/apps/componentLibrary/typography';
import ProgressTableV2 from './ProgressTableV2';
import {loadUnitProgress} from '../sectionProgress/sectionProgressLoader';
import {getCurrentUnitData} from '../sectionProgress/sectionProgressRedux';
import {connect} from 'react-redux';
import {unitDataPropType} from '../sectionProgress/sectionProgressConstants';
import styles from './progress-table-v2.module.scss';

function SectionProgressV2({
  scriptId,
  sectionId,
  unitData,
  isLoadingProgress,
  isRefreshingProgress,
}) {
  const levelDataInitialized = React.useMemo(() => {
    return unitData && !isLoadingProgress && !isRefreshingProgress;
  }, [unitData, isLoadingProgress, isRefreshingProgress]);

  React.useEffect(() => {
    console.log('lfm', unitData, isLoadingProgress, isRefreshingProgress);
    if (!unitData && !isLoadingProgress && !isRefreshingProgress) {
      loadUnitProgress(scriptId, sectionId);
    }
  }, [unitData, isLoadingProgress, isRefreshingProgress, scriptId, sectionId]);

  return (
    <div>
      <Heading1>Progress</Heading1>
      <div className={styles.title}>
        <Heading6 className={styles.titleStudents}>Students</Heading6>
        <Heading6 className={styles.titleUnitSelector}>
          UNIT SELECTOR GOES HERE
        </Heading6>
      </div>
      {levelDataInitialized && <ProgressTableV2 />}
    </div>
  );
}

SectionProgressV2.propTypes = {
  scriptId: PropTypes.number,
  sectionId: PropTypes.number,
  unitData: unitDataPropType,
  isLoadingProgress: PropTypes.bool.isRequired,
  isRefreshingProgress: PropTypes.bool.isRequired,
};

export const UnconnectedSectionProgressV2 = SectionProgressV2;

export default connect(state => ({
  scriptId: state.unitSelection.scriptId,
  sectionId: state.teacherSections.selectedSectionId,
  unitData: getCurrentUnitData(state),
  isLoadingProgress: state.sectionProgress.isLoadingProgress,
  isRefreshingProgress: state.sectionProgress.isRefreshingProgress,
}))(SectionProgressV2);
