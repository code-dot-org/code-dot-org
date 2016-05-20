import color from '../../color';
import FontAwesome from '../FontAwesome';

const styles = {
  collapseButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: color.cyan,
    color: color.white
  },
  collapseIcon: {
    marginRight: 5
  }
};

const CollapserButton = props => (
  <button
      style={styles.collapseButton}
      onClick={props.onClick}>
    <FontAwesome
        icon={props.collapsed ? 'chevron-circle-up' : 'chevron-circle-down'}
        style={styles.collapseIcon}
    />
    {props.collapsed ? 'More' : 'Hide'}
  </button>
);
CollapserButton.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  collapsed: React.PropTypes.bool.isRequired
};

export default CollapserButton;
