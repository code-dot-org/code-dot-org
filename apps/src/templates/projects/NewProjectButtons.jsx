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
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_playlab.png"
  },
  'artist': {
    label: i18n.projectTypeArtist(),
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_artist.png"
  },
  'applab': {
    label: i18n.projectTypeApplab(),
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_applab_square.png"
  },
  'gamelab': {
    label: i18n.projectTypeGamelab(),
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_gamelab_square.png"
  },
  'weblab': {
    label: i18n.projectTypeWeblab(),
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_weblab.png"
  },
  'calc': {
    label: i18n.projectTypeCalc(),
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_calc.png"
  },
  'eval': {
    label: i18n.projectTypeEval(),
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_eval.png"
  },
  'frozen': {
    label: i18n.projectTypeFrozen(),
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_frozen.png"
  },
  'mc': {
    label: i18n.projectTypeMC(),
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_mc.png"
  },
  'minecraft': {
    label: i18n.projectTypeMinecraft(),
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_minecraft.png"
  },
  'starwars': {
    label: i18n.projectTypeStarwars(),
    thumbnail: "http://studio.code.org/shared/images/fill-70x70/courses/logo_starwars.png"
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
    marginLeft: 10
  },
  tilePadding: {
    marginRight: 18,
  },
  thumbnail: {
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2
  },
  label: {
    padding: 10
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
    projectTypes: PropTypes.arrayOf(PropTypes.string)
  },

  render() {
    // Using absolute URLs to get this working in storybook.
    const projectTypes = this.props.projectTypes || DEFAULT_PROJECT_TYPES;
    return (
      <div style={styles.fullsize}>
        <div style={styles.description}>{i18n.projectStartNew()}</div>
        <div>
          {
            projectTypes.slice(0,4).map((projectType, index) => (
              <div key={index} style={[styles.tile, index < 3 && styles.tilePadding]}>
                <a href={"/p/" + projectType + "/new"}>
                  <img style={styles.thumbnail} src={PROJECT_INFO[projectType].thumbnail} />
                  <span style={styles.label}>
                    {PROJECT_INFO[projectType].label}
                  </span>
                </a>
              </div>
            ))
          }
        </div>
      </div>
    );
  }
});

export default Radium(NewProjectButtons);
