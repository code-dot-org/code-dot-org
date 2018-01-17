import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";
import styleConstants from '../../styleConstants';
import color from "../../util/color";
import Radium from 'radium';
import _ from 'lodash';

const DEFAULT_PROJECT_TYPES_ADVANCED = [
  'playlab',
  'artist',
  'applab',
  'gamelab'
];

const DEFAULT_PROJECT_TYPES_BASIC = [
  'playlab',
  'artist',
  'minecraft_designer',
  'flappy'
];

const PROJECT_INFO = {
  'playlab': {
    label: i18n.projectTypePlaylab(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_playlab.png"
  },
  'playlab_k1': {
    label: i18n.projectTypePlaylabPreReader(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_playlab.png"
  },
  'artist': {
    label: i18n.projectTypeArtist(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_artist.png"
  },
  'artist_k1': {
    label: i18n.projectTypeArtistPreReader(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_artist.png"
  },
  'applab': {
    label: i18n.projectTypeApplab(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_applab_square.png"
  },
  'gamelab': {
    label: i18n.projectTypeGamelab(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_gamelab_square.png"
  },
  'weblab': {
    label: i18n.projectTypeWeblab(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_weblab.png"
  },
  'calc': {
    label: i18n.projectTypeCalc(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_calc.png"
  },
  'eval': {
    label: i18n.projectTypeEval(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_eval.png"
  },
  'frozen': {
    label: i18n.projectTypeFrozen(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_frozen.png"
  },
  'minecraft_adventurer': {
    label: i18n.projectTypeMinecraftAdventurer(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_mc.png"
  },
  'minecraft_designer': {
    label: i18n.projectTypeMinecraftDesigner(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_minecraft.png"
  },
  'minecraft_hero': {
    label: i18n.projectTypeMinecraftHero(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_minecraft_hero_square.jpg"
  },
  'starwars': {
    label: i18n.projectTypeStarwars(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_starwars.png"
  },
  'starwarsblocks': {
    label: i18n.projectTypeStarwarsBlocks(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_starwarsblocks.png"
  },
  'flappy': {
    label: i18n.projectTypeFlappy(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_flappy.png"
  },
  'sports': {
    label: i18n.projectTypeSports(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_sports.png"
  },
  'basketball': {
    label: i18n.projectTypeBasketball(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_basketball.png"
  },
  'bounce': {
    label: i18n.projectTypeBounce(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_bounce.png"
  },
  'infinity': {
    label: i18n.projectTypeInfinity(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_infinity.png"
  },
  'iceage': {
    label: i18n.projectTypeIceage(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_iceage.png"
  },
  'gumball': {
    label: i18n.projectTypeGumball(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_gumball.png"
  }
};

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
    border: '1px solid ' + color.lighter_gray,
    borderRadius: 2,
    float: 'left',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  tilePadding: {
    marginRight: 35,
  },
  thumbnail: {
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    marginRight: 10
  },
  thumbnailRtl: {
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    marginLeft: 10
  },
  label: {
    paddingRight: 5,
    color: color.teal
  },
  description: {
    paddingRight: 10,
    paddingBottom: 10,
    fontSize: 14,
    fontFamily: '"Gotham 5r"',
    color: color.charcoal,
  }
};

const TILES_PER_ROW = 4;

class NewProjectButtons extends React.Component {
  static propTypes = {
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    isRtl: PropTypes.bool,
    description: PropTypes.string,
    canViewAdvancedTools: PropTypes.bool,
  };

  static defaultProps = {
    canViewAdvancedTools: true
  };

  render() {
    const { canViewAdvancedTools, description, isRtl } = this.props;
    const thumbnailStyle = isRtl ? styles.thumbnailRtl : styles.thumbnail;
    const defaultProjectTypes = canViewAdvancedTools ?
      DEFAULT_PROJECT_TYPES_ADVANCED: DEFAULT_PROJECT_TYPES_BASIC;
    const projectTypes = this.props.projectTypes || defaultProjectTypes;
    return (
      <div style={styles.fullsize}>
        {description && <div style={styles.description}>{description}</div>}
        {
          _.chunk(projectTypes, TILES_PER_ROW).map((projectTypesRow, rowIndex) => (
            <div style={styles.row} key={rowIndex}>
              {
                projectTypesRow.map((projectType, index) => (
                  <a key={index} href={"/projects/" + projectType + "/new"}>
                    <div style={[styles.tile, index < (TILES_PER_ROW - 1) && styles.tilePadding]}>
                      <img style={thumbnailStyle} src={PROJECT_INFO[projectType].thumbnail} />
                      <div style={styles.label}>
                        {PROJECT_INFO[projectType].label}
                      </div>
                    </div>
                  </a>
                ))
              }
              <div style={{clear: 'both'}}/>
            </div>
          ))
        }
      </div>
    );
  }
}

export default connect(state => ({
  isRtl: state.isRtl,
}))(Radium(NewProjectButtons));
