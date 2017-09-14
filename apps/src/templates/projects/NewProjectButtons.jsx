import React, {PropTypes} from 'react';
import i18n from "@cdo/locale";
import styleConstants from '../../styleConstants';
import color from "../../util/color";
import Radium from 'radium';

const DEFAULT_PROJECT_TYPES = [
  'playlab',
  'artist',
  'applab',
  'gamelab'
];

const PROJECT_INFO = {
  'playlab': {
    label: i18n.projectTypePlaylab(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_playlab.png"
  },
  'playlab_k1': {
    label: i18n.projectTypePlaylab(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_playlab.png"
  },
  'artist': {
    label: i18n.projectTypeArtist(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_artist.png"
  },
  'artist_k1': {
    label: i18n.projectTypeArtist(),
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
  'mc': {
    label: i18n.projectTypeMC(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_mc.png"
  },
  'minecraft': {
    label: i18n.projectTypeMinecraft(),
    thumbnail: "/shared/images/fill-70x70/courses/logo_minecraft.png"
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
    width: styleConstants['content-width']
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
    fontSize: 16,
    fontFamily: 'Gotham 3r',
    zIndex: 2,
    color: color.charcoal,
    width: 940
  }
};

const NewProjectButtons = React.createClass({
  propTypes: {
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    isRtl: PropTypes.bool
  },

  render() {
    const { isRtl } = this.props;
    const thumbnailStyle = isRtl ? styles.thumbnailRtl : styles.thumbnail;
    // Using absolute URLs to get this working in storybook.
    const projectTypes = this.props.projectTypes || DEFAULT_PROJECT_TYPES;
    return (
      <div style={styles.fullsize}>
        <div style={styles.description}>{i18n.projectStartNew()}</div>
        <div>
          {
            projectTypes.slice(0,4).map((projectType, index) => (
              <a key={index} href={"/projects/" + projectType + "/new"}>
                <div style={[styles.tile, index < 3 && styles.tilePadding]}>
                  <img style={thumbnailStyle} src={PROJECT_INFO[projectType].thumbnail} />
                  <div style={styles.label}>
                    {PROJECT_INFO[projectType].label}
                  </div>
                </div>
              </a>
            ))
          }
        </div>
      </div>
    );
  }
});

export default Radium(NewProjectButtons);
