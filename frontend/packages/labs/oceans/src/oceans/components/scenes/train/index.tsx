import {faBan, faCheck, faTrash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Box, IconButton} from '@mui/material';
import * as React from 'react';

import aiBotBody from '@/assets/images/ai-bot/ai-bot-body.png';
import aiBotHead from '@/assets/images/ai-bot/ai-bot-head.png';
import counterIcon from '@/assets/images/polaroid-icon.png';
import {Body, Button} from '@/oceans/components/common';
import {
  buildClassificationAnnouncement,
  formatItemsClassified,
} from '@/oceans/components/scenes/train/announcement';
import {AppMode, Modes} from '@/oceans/constants';
import helpers from '@/oceans/helpers';
import I18n from '@/oceans/i18n';
import modeHelpers from '@/oceans/modeHelpers';
import train from '@/oceans/models/train';
import {getState, setState} from '@/oceans/state';
import {
  cornerIconButtonBaseSx,
  orangeCornerButtonSx,
  srOnlySx,
} from '@/oceans/styles/layout';

/** CSS transition applied to the bot head when it opens/closes. */
const BOT_HEAD_TRANSITION = 'transform 500ms';

interface TrainState {
  headOpen: boolean;
  /** Most recent classification label, announced via the live region. */
  announcement: string;
}

class Train extends React.Component<Record<string, never>, TrainState> {
  state: TrainState = {
    headOpen: false,
    announcement: '',
  };

  render() {
    const state = getState();
    const yesButtonText =
      state.appMode === AppMode.CreaturesVTrash ? I18n.t('yes') : state.word;
    const noButtonText =
      state.appMode === AppMode.CreaturesVTrash
        ? I18n.t('no')
        : I18n.t('notWord', {word: state.word});
    const resetTrainingFunction = () => {
      helpers.resetTraining(state);
      setState({showConfirmationDialog: false});
    };

    return (
      <Body>
        <Box
          component="div"
          sx={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '180%',
            color: 'var(--ocean-color-white)',
            whiteSpace: 'nowrap',
          }}
        >
          {state.trainingQuestion}
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: '30%',
            right: '-2%',
            width: '30%',
            direction: 'ltr',
          }}
        >
          <Box
            component="img"
            src={aiBotHead}
            alt=""
            sx={[
              {
                transition: BOT_HEAD_TRANSITION,
                left: '3%',
                width: '43%',
                top: '0%',
                position: 'absolute',
                direction: 'ltr',
              },
              this.state.headOpen
                ? {
                    transform: 'rotate(90deg)',
                    transformOrigin: 'bottom right',
                  }
                : {},
            ]}
          />
          <Box
            component="img"
            src={aiBotBody}
            alt=""
            sx={{width: '49%', marginTop: '30%', direction: 'ltr'}}
          />
        </Box>

        {/* role=figure: inspectable display widget; aria-label names it without live-region noise. */}
        <Box
          role="figure"
          aria-label={formatItemsClassified(state.yesCount + state.noCount)}
          data-testid="training-count"
          sx={{
            position: 'absolute',
            top: '2%',
            right: '7%',
            backgroundColor: 'var(--ocean-color-transparent-black)',
            color: 'var(--ocean-color-neon-blue)',
            borderRadius: '33px',
            minWidth: '7%',
            height: '5%',
            padding: '1% 2.5%',
            textAlign: 'right',
          }}
        >
          <Box
            component="img"
            src={counterIcon}
            alt=""
            sx={{float: 'left', height: '100%'}}
          />
          {/* Hide inner number from AT; parent aria-label reads it. */}
          <Box component="span" aria-hidden="true" sx={{fontSize: '90%'}}>
            {Math.min(999, state.yesCount + state.noCount)}
          </Box>
        </Box>

        {/* Screen-reader announcement for the most recent classification. */}
        <Box role="status" aria-live="polite" aria-atomic="true" sx={srOnlySx}>
          {this.state.announcement}
        </Box>

        {/* Classification buttons: No (left) then Yes (right) — natural Tab order. */}
        <Box
          sx={{
            position: 'absolute',
            top: '83%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button
            sx={{
              '&:hover': {
                backgroundColor: 'var(--ocean-color-red)',
                color: 'var(--ocean-color-white)',
              },
            }}
            onClick={() => {
              const succeeded = train.onClassifyFish(false);
              const announcement = succeeded
                ? buildClassificationAnnouncement(
                    getState().yesCount + getState().noCount,
                  )
                : this.state.announcement;
              this.setState({headOpen: true, announcement});
            }}
            sound={'no'}
          >
            <FontAwesomeIcon icon={faBan} />
            &nbsp; &nbsp;
            {noButtonText}
          </Button>
          <Button
            guideDismissFocus
            sx={{
              marginLeft: '10px',
              '&:hover': {
                backgroundColor: 'var(--ocean-color-green)',
                color: 'var(--ocean-color-white)',
              },
            }}
            onClick={() => {
              const succeeded = train.onClassifyFish(true);
              const announcement = succeeded
                ? buildClassificationAnnouncement(
                    getState().yesCount + getState().noCount,
                  )
                : this.state.announcement;
              this.setState({headOpen: true, announcement});
            }}
            sound={'yes'}
          >
            <FontAwesomeIcon icon={faCheck} />
            &nbsp; &nbsp;
            {yesButtonText}
          </Button>
        </Box>

        {/* Continue button — before Erase in DOM for Tab order. */}
        <Button
          sx={orangeCornerButtonSx}
          onClick={() => modeHelpers.toMode(Modes.Predicting)}
        >
          {I18n.t('continue')}
        </Button>

        <IconButton
          aria-label={I18n.t('erase')}
          onClick={() => {
            setState({
              showConfirmationDialog: true,
              confirmationDialogOnYes: resetTrainingFunction,
            });
          }}
          sx={[
            cornerIconButtonBaseSx,
            {
              width: '2.4%',
              '&:hover, &:focus-visible': {
                backgroundColor: 'var(--ocean-color-red)',
                color: 'var(--ocean-color-white)',
              },
            },
          ]}
        >
          <FontAwesomeIcon
            icon={faTrash}
            style={{display: 'block', margin: 'auto', height: '100%'}}
            aria-hidden
          />
        </IconButton>
      </Body>
    );
  }
}

export default Train;
