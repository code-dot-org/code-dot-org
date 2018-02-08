import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from "../../util/color";
import Radium from 'radium';
import {selectGallery} from './projectsRedux.js';
import {connect} from 'react-redux';
import {Galleries} from './projectConstants';

const styles = {
  container: {
    marginBottom: 20,
    backgroundColor: color.lightest_gray,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.lighter_gray,
    padding: 10,
    height: 36
  },
  pill: {
    ':hover': {
      color: color.teal
    },
    border: 'none',
    borderRadius: 50,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 20,
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    margin: '0 0 0 20px',
    boxShadow: 'none',
    outline: 'none',
    padding: '8px 18px',
    float: 'left',
    cursor: 'pointer',
  },
  selectedPill: {
    ':hover': {
      color: color.white
    },
    backgroundColor: color.teal,
    color: color.white,
    border: 'none'
  }
};

class GallerySwitcher extends Component {
  static propTypes = {
    selectedGallery: PropTypes.string.isRequired,
    selectGallery: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.toggleToGallery = this.toggleToGallery.bind(this);
    this.toggleToMyProjects = this.toggleToMyProjects.bind(this);
  }

  toggleToGallery() {
    this.props.selectGallery(Galleries.PUBLIC);
  }

  toggleToMyProjects() {
    this.props.selectGallery(Galleries.PRIVATE);
  }

  render() {
    return (
      <div style={styles.container} id="uitest-gallery-switcher">
        <div
          key={'private'}
          style={[
            styles.pill,
            this.props.selectedGallery === Galleries.PRIVATE && styles.selectedPill
          ]}
          onClick={this.toggleToMyProjects}
        >
          {i18n.myProjects()}
        </div>
        <div
          key={'public'}
          style={[
            styles.pill,
            this.props.selectedGallery === Galleries.PUBLIC && styles.selectedPill
          ]}
          onClick={this.toggleToGallery}
        >
          {i18n.publicProjects()}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  selectedGallery: state.projects.selectedGallery
}), dispatch => ({
  selectGallery(gallery) {
    dispatch(selectGallery(gallery));
  }
}))(Radium(GallerySwitcher));
