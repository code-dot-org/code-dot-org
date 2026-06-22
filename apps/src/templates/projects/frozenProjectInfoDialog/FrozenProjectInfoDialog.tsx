import Modal from '@code-dot-org/component-library/modal';
import {Typography} from '@mui/material';
import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import i18n from '@cdo/locale';

import {
  FrozenProjectInfoDialogState,
  hideFrozenProjectInfoDialog,
} from './frozenProjectInfoDialogRedux';

const FrozenProjectInfoDialog: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const isOpen = useSelector(
    (state: {frozenProjectInfoDialog: FrozenProjectInfoDialogState}) =>
      state.frozenProjectInfoDialog.isOpen
  );
  const onClose = useCallback(
    () => dispatch(hideFrozenProjectInfoDialog()),
    [dispatch]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      onClose={onClose}
      title={i18n.projectInfo()}
      customContent={
        <div id="dsco-dialog-description">
          <Typography variant="body2" gutterBottom>
            {i18n.congratsProjectSelected()}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {i18n.projectFrozenNotice()}
          </Typography>
          <SafeMarkdown
            markdown={i18n.requestProjectUnfeatured({
              url: '/projects/public',
            })}
          />
        </div>
      }
      primaryButtonProps={{
        onClick: onClose,
        children: i18n.closeDialog(),
        size: 'small',
        type: 'button',
      }}
    />
  );
};

export default FrozenProjectInfoDialog;
