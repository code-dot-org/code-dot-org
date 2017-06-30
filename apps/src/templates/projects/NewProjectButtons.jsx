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
    width: 1000
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
  }
};

const NewProjectButtons = React.createClass({
  renderButtons() {
    return  (
      <div>
        {
          DEFAULT_PROJECT_TYPES.slice(0,4).map((object, index) => (
            <div key={index} style={[styles.tile, index < 3 && styles.tilePadding]}>
              <a href={"/p/" + object.type + "/new"}>
                <img style={styles.thumbnail} src={"/shared/images/fill-70x70/courses/logo_" + object.type + ".png"} />
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
        <h3>Start a new project</h3>
        {this.renderButtons()}
      </div>
    );
  }
});

export default Radium(NewProjectButtons);
