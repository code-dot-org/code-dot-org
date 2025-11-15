import _ from 'lodash';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

import styleConstants from '../../styleConstants';
import color from '../../util/color';

const PROJECT_INFO = {
  playlab: {
    label: i18n.projectTypePlaylab(),
    thumbnail: studio('/shared/images/courses/logo_playlab.png'),
  },
  playlab_k1: {
    label: i18n.projectTypePlaylabPreReader(),
    thumbnail: studio('/shared/images/courses/logo_playlab.png'),
  },
  artist: {
    label: i18n.projectTypeArtist(),
    thumbnail: studio('/shared/images/courses/logo_artist.png'),
  },
  artist_k1: {
    label: i18n.projectTypeArtistPreReader(),
    thumbnail: studio('/shared/images/courses/logo_artist.png'),
  },
  applab: {
    label: i18n.projectTypeApplab(),
    thumbnail: studio('/shared/images/courses/logo_applab_square.png'),
  },
  gamelab: {
    label: i18n.projectTypeGamelab(),
    thumbnail: studio('/shared/images/courses/logo_gamelab_square.png'),
  },
  weblab: {
    label: i18n.projectTypeWeblab(),
    thumbnail: studio('/shared/images/courses/logo_weblab.png'),
  },
  calc: {
    label: i18n.projectTypeCalc(),
    thumbnail: studio('/shared/images/courses/logo_calc.png'),
  },
  eval: {
    label: i18n.projectTypeEval(),
    thumbnail: studio('/shared/images/courses/logo_eval.png'),
  },
  frozen: {
    label: i18n.projectTypeFrozen(),
    thumbnail: studio('/shared/images/courses/logo_frozen.png'),
  },
  minecraft_adventurer: {
    label: i18n.projectTypeMinecraftAdventurer(),
    thumbnail: studio('/shared/images/courses/logo_mc.png'),
  },
  minecraft_designer: {
    label: i18n.projectTypeMinecraftDesigner(),
    thumbnail: studio('/shared/images/courses/logo_minecraft.png'),
  },
  minecraft_hero: {
    label: i18n.projectTypeMinecraftHero(),
    thumbnail: studio('/shared/images/courses/logo_minecraft_hero_square.jpg'),
  },
  minecraft_aquatic: {
    label: i18n.projectTypeMinecraftAquatic(),
    thumbnail: studio(
      '/shared/images/courses/logo_minecraft_aquatic_square.jpg'
    ),
  },
  starwars: {
    label: i18n.projectTypeStarwars(),
    thumbnail: studio('/shared/images/courses/logo_starwars.png'),
  },
  starwarsblocks: {
    label: i18n.projectTypeStarwarsBlocks(),
    thumbnail: studio('/shared/images/courses/logo_starwarsblocks.png'),
  },
  flappy: {
    label: i18n.projectTypeFlappy(),
    thumbnail: studio('/shared/images/courses/logo_flappy.png'),
  },
  sports: {
    label: i18n.projectTypeSports(),
    thumbnail: studio('/shared/images/courses/logo_sports.png'),
  },
  basketball: {
    label: i18n.projectTypeBasketball(),
    thumbnail: studio('/shared/images/courses/logo_basketball.png'),
  },
  bounce: {
    label: i18n.projectTypeBounce(),
    thumbnail: studio('/shared/images/courses/logo_bounce.png'),
  },
  infinity: {
    label: i18n.projectTypeInfinity(),
    thumbnail: studio('/shared/images/courses/logo_infinity.png'),
  },
  iceage: {
    label: i18n.projectTypeIceage(),
    thumbnail: studio('/shared/images/courses/logo_iceage.png'),
  },
  gumball: {
    label: i18n.projectTypeGumball(),
    thumbnail: studio('/shared/images/courses/logo_gumball.png'),
  },
  spritelab: {
    label: i18n.projectTypeSpriteLab(),
    thumbnail: studio('/shared/images/courses/logo_spritelab.png'),
  },
  dance: {
    label: i18n.projectTypeDance(),
    thumbnail: studio('/shared/images/courses/logo_dance.png'),
  },
  poetry: {
    label: i18n.projectTypePoetry(),
    thumbnail: studio('/shared/images/courses/logo_poetry.png'),
  },
  music: {
    label: i18n.projectTypeMusic(),
    thumbnail: studio('/shared/images/courses/logo_music.png'),
    urlOverride: '/s/music-intro-2024/reset',
  },
  pythonlab: {
    label: i18n.projectTypePythonlab(),
    thumbnail: studio('/shared/images/courses/logo_pythonlab.png'),
  },
};

const TILES_PER_ROW = 4;

class NewProjectButtons extends React.Component {
  static propTypes = {
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    isRtl: PropTypes.bool,
    description: PropTypes.string,
  };

  render() {
    const {description, isRtl, projectTypes} = this.props;
    const thumbnailStyle = isRtl ? styles.thumbnailRtl : styles.thumbnail;

    return (
      <div style={styles.fullsize}>
        {description && <div style={styles.description}>{description}</div>}
        {_.chunk(projectTypes, TILES_PER_ROW).map(
          (projectTypesRow, rowIndex) => (
            <div style={styles.row} key={rowIndex}>
              {projectTypesRow.map((projectType, index) => (
                <a
                  key={index}
                  href={
                    PROJECT_INFO[projectType].urlOverride ||
                    '/projects/' + projectType + '/new'
                  }
                >
                  <div
                    className="newProject-button-tile"
                    style={[
                      styles.tile,
                      index < TILES_PER_ROW - 1 && styles.tilePadding,
                    ]}
                  >
                    <img
                      style={thumbnailStyle}
                      src={PROJECT_INFO[projectType].thumbnail}
                      alt=""
                      width="70"
                      height="70"
                    />
                    <div style={styles.label}>
                      {PROJECT_INFO[projectType].label}
                    </div>
                  </div>
                </a>
              ))}
              <div style={{clear: 'both'}} />
            </div>
          )
        )}
      </div>
    );
  }
}

const styles = {
  fullsize: {
    width: styleConstants['content-width'],
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    marginBottom: 10,
  },
  tile: {
    width: 214,
    height: 70,
    border: '1px solid ' + color.neutral_dark20,
    borderRadius: 2,
    float: 'left',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: color.neutral_light,
  },
  tilePadding: {
    marginRight: 35,
  },
  thumbnail: {
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    marginRight: 10,
  },
  thumbnailRtl: {
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    marginLeft: 10,
  },
  label: {
    paddingRight: 5,
    color: color.neutral_dark,
  },
  description: {
    paddingRight: 10,
    paddingBottom: 10,
    fontSize: 14,
    ...fontConstants['main-font-semi-bold'],
    color: color.neutral_dark,
  },
};

export default connect(state => ({
  isRtl: state.isRtl,
}))(Radium(NewProjectButtons));
