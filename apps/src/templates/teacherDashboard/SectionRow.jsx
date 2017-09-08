import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import Button from '@cdo/apps/templates/Button';
import {styles as tableStyles} from '@cdo/apps/templates/studioHomepages/SectionsTable';

const styles = {
  link: tableStyles.link,
  col: tableStyles.col,
  courseCol: {
    minWidth: 200,
  },
  lightRow: tableStyles.lightRow,
  darkRow: tableStyles.darkRow,
  row: tableStyles.row,
  rightButton: {
    marginLeft: 5
  },
  sectionCodeNone: {
    color: color.light_gray,
    fontSize: 16,
  },
  nowrap: {
    whiteSpace: 'nowrap'
  },
  currentUnit: {
    marginTop: 10
  },
  colButton: {
    paddingTop: 20,
    paddingLeft: 20,
  }
};

/**
 * Our base buttons (Edit and delete).
 */
export const EditOrDelete = ({canDelete, onEdit, onDelete}) => (
  <div style={styles.nowrap}>
    <Button
      text={i18n.edit()}
      onClick={onEdit}
      color={Button.ButtonColor.gray}
    />
    {canDelete && (
      <Button
        style={{marginLeft: 5}}
        text={i18n.delete()}
        onClick={onDelete}
        color={Button.ButtonColor.red}
      />
    )}
  </div>
);
EditOrDelete.propTypes = {
  canDelete: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/**
 * Buttons for confirming whether or not we want to delete a section
 */
export const ConfirmDelete = ({onClickYes, onClickNo}) => (
  <div style={styles.nowrap}>
    <div>{i18n.deleteConfirm()}</div>
    <Button
      text={i18n.yes()}
      onClick={onClickYes}
      color={Button.ButtonColor.red}
    />
    <Button
      text={i18n.no()}
      style={styles.rightButton}
      onClick={onClickNo}
      color={Button.ButtonColor.gray}
    />
  </div>
);
ConfirmDelete.propTypes = {
  onClickYes: PropTypes.func.isRequired,
  onClickNo: PropTypes.func.isRequired,
};
