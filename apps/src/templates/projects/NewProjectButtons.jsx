import React from 'react';
import i18n from "@cdo/locale";
import color from "../../util/color";
import Radium from 'radium';

const DEFAULT_PROJECT_TYPES = [
  {
    type: 'playlab',
    label: i18n.projectTypePlaylab()
  },
  {
    type: 'artist',
    label: i18n.projectTypeArtist()
  },
  {
    type: 'applab',
    label: i18n.projectTypeApplab()
  },
  {
    type: 'gamelab',
    label: i18n.projectTypeGamelab()
  }
];

const styles = {
  fullsize: {
    width: 970
  },
  tile: {
    width: 214,
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

// Renders a static list of project types. V2 of this component will have
// configurable project types.
const NewProjectButtons = React.createClass({
  renderButtons() {
    // Using absolute URLs to get this working in storybook.
    return  (
      <div>
        {
          DEFAULT_PROJECT_TYPES.slice(0,4).map((object, index) => (
            <div key={index} style={[styles.tile, index < 3 && styles.tilePadding]}>
              <a href={"/p/" + object.type + "/new"}>
                <img style={styles.thumbnail} src={"http://studio.code.org/shared/images/fill-70x70/courses/logo_" + object.type + ".png"} />
                <span style={styles.label}>
                  {object.label}
                </span>
              </a>
            </div>
          ))
        }
      </div>
    );
  },

  render() {
    return (
      <div style={styles.fullsize}>
        <div style={styles.description}>{i18n.projectStartNew()}</div>
        {this.renderButtons()}
      </div>
    );
  }
});

export default Radium(NewProjectButtons);
