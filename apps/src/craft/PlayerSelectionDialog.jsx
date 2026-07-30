import {
  Box,
  Button as MuiButton,
  Typography as MuiTypography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import alexImg from '../../static/craft/Sliced_Parts/Alex_Character_Select.png';
import steveImg from '../../static/craft/Sliced_Parts/Steve_Character_Select.png';

import CraftDialog from './CraftDialog';
import i18n from './locale';

const characterSelectImg = {
  steve: {
    src: steveImg,
    alt: '',
  },
  alex: {
    src: alexImg,
    alt: '',
  },
};

/**
 * Dialog for selecting a player in Minecraft tutorials.
 */
function PlayerSelectionDialog({
  isOpen,
  players,
  handlePlayerSelection,
  title = i18n.playerSelectLetsGetStarted(),
  titleClassName = 'minecraft-big-yellow-header',
  hideSubtitle = false,
}) {
  function renderPlayer(name) {
    const formattedName = name.toLowerCase();
    return (
      <Box
        key={formattedName}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <MuiTypography component="h1" variant="h3" sx={{color: '#f4d00b'}}>
          {name}
        </MuiTypography>
        <Box>
          <img
            alt={characterSelectImg[formattedName].alt}
            src={characterSelectImg[formattedName].src}
            id={`${formattedName}-portrait`}
            style={{maxHeight: 270}}
          />
        </Box>
        <MuiButton
          variant="contained"
          color="secondary"
          size="medium"
          onClick={() => handlePlayerSelection(name)}
        >
          {i18n.selectChooseButton()}
        </MuiButton>
      </Box>
    );
  }

  return (
    <CraftDialog
      id="craft-popup-player-selection"
      isOpen={isOpen}
      handleClose={() => handlePlayerSelection(undefined)}
      style={{
        minWidth: '50%',
      }}
    >
      <MuiTypography
        component="h1"
        variant="h3"
        id="getting-started-header"
        sx={{color: '#f4d00b'}}
      >
        {title}
      </MuiTypography>
      {!hideSubtitle && (
        <MuiTypography component="h2" variant="h4" id="select-character-text">
          {i18n.playerSelectChooseCharacter()}
        </MuiTypography>
      )}
      <Box
        id="choose-character-container"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          alignItems: 'stretch',
          justifyContent: 'space-around',
          mt: 2,
        }}
      >
        {players.map(renderPlayer)}
      </Box>
    </CraftDialog>
  );
}

PlayerSelectionDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  players: PropTypes.arrayOf(PropTypes.string).isRequired,
  handlePlayerSelection: PropTypes.func.isRequired,
  title: PropTypes.string,
  titleClassName: PropTypes.string,
  hideSubtitle: PropTypes.bool,
};

export default connect(state => ({
  isOpen: state.craft.playerSelectionDialogOpen,
  handlePlayerSelection: state.craft.handlePlayerSelection,
}))(PlayerSelectionDialog);
