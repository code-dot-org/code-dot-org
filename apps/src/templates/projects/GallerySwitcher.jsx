import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from "../../util/color";
import Radium from 'radium';

export const Galleries = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
};

const styles = {
  container: {
    marginBottom: 20,
    width: '100%',
    backgroundColor: color.lightest_gray,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.lighter_gray,
    padding: 10,
    marginLeft: 25,
    height: 36
  },
  pill: {
    border: 'none',
    borderRadius: 50,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 12,
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    margin: '0 0 0 20px',
    boxShadow: 'none',
    outline: 'none',
    padding: '8px 18px'
  },
  selectedPill: {
    backgroundColor: color.teal,
    color: color.white
  }
};

class GallerySwitcher extends Component {
  static propTypes = {
    initialGallery: PropTypes.oneOf(Object.keys(Galleries)).isRequired,
    showGallery: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.toggleGallery = this.toggleGallery.bind(this);

    this.state = {
      // The source of truth for which gallery is displayed. This state should
      // live in the parent component, once there is one.
      gallery: props.initialGallery,
    };
  }

  toggleGallery() {
    const gallery = this.state.gallery === Galleries.PRIVATE ?
      Galleries.PUBLIC : Galleries.PRIVATE;

    this.props.showGallery(gallery);
    this.setState({gallery});
  }

  render() {
    return (
      <div style={styles.container}>
        <button
          style={[styles.pill, this.state.gallery === Galleries.PRIVATE && styles.selectedPill]}
          onClick={this.toggleGallery}
        >
          {i18n.myProjects()}
        </button>
        <button
          style={[styles.pill, this.state.gallery === Galleries.PUBLIC && styles.selectedPill]}
          onClick={this.toggleGallery}
        >
          {i18n.publicGallery()}
        </button>
      </div>
    );
  }
}
export default Radium(GallerySwitcher);
