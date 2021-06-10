import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from './locale';
import CraftDialog from './CraftDialog';

/**
 * Dialog for selecting a player in Minecraft tutorials.
 *
 * Note: This component relies on styles defined in apps/style/craft/style.scss.
 * Example: #steve-portrait renders Steve's image, so any players will require
 * a similar CSS selector to render properly.
 */
function PlayerSelectionDialog({
  isOpen,
  players,
  handlePlayerSelection,
  title = i18n.playerSelectLetsGetStarted(),
  titleClassName = 'minecraft-big-yellow-header',
  hideSubtitle = false
}) {
  function renderPlayer(name) {
    const formattedName = name.toLowerCase();
    return (
      <div key={formattedName} className="minecraft-character">
        <h1 className="minecraft-big-yellow-header">{name}</h1>
        <div className="character-portrait" id={`${formattedName}-portrait`} />
        <div
          className="choose-character-button"
          onClick={() => handlePlayerSelection(name)}
        >
          {i18n.selectChooseButton()}
        </div>
      </div>
    );
  }

  return (
    <CraftDialog
      id="craft-popup-player-selection"
      isOpen={isOpen}
      handleClose={() => handlePlayerSelection(undefined)}
    >
      <h1 className={titleClassName} id="getting-started-header">
        {title}
      </h1>
      {!hideSubtitle && (
        <h2 id="select-character-text">{i18n.playerSelectChooseCharacter()}</h2>
      )}
      <div id="choose-character-container">{players.map(renderPlayer)}</div>
    </CraftDialog>
  );
}

PlayerSelectionDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  players: PropTypes.arrayOf(PropTypes.string).isRequired,
  handlePlayerSelection: PropTypes.func.isRequired,
  title: PropTypes.string,
  titleClassName: PropTypes.string,
  hideSubtitle: PropTypes.bool
};

export default connect(state => ({
  isOpen: state.craft.playerSelectionDialogOpen,
  handlePlayerSelection: state.craft.handlePlayerSelection
}))(PlayerSelectionDialog);
