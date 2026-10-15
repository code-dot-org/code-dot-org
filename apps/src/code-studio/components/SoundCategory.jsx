import PropTypes from 'prop-types';
import React from 'react';

/**
 * A component for displaying a sound category.
 */
export default class SoundCategory extends React.Component {
  static propTypes = {
    displayName: PropTypes.string,
    category: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
  };

  selectCategory = () => this.props.onSelect(this.props.category);

  render() {
    return (
      <div style={styles.category} onClick={this.selectCategory}>
        {this.props.displayName}
      </div>
    );
  }
}

const styles = {
  category: {
    backgroundColor: 'var(--background-brand-purple-primary)',
    border: 'solid 0px',
    borderRadius: 5,
    width: 175,
    padding: 10,
    margin: 10,
    color: 'var(--text-neutral-white-fixed)',
    float: 'left',
    cursor: 'pointer',
  },
  categoryArea: {
    width: '100%',
  },
};
