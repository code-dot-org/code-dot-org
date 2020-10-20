import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import styleConstants from '@cdo/apps/styleConstants';

const styles = {
  header: {
    borderBottom: '1px solid black'
  },
  icon: {
    marginRight: 10
  },
  editors: {
    padding: 10
  }
};

export default class CollapsibleEditorSection extends Component {
  static propTypes = {
    title: PropTypes.string,
    fullWidth: PropTypes.bool,
    collapsed: PropTypes.bool,
    children: PropTypes.any
  };

  constructor(props) {
    super(props);

    this.state = {
      collapsed: this.props.collapsed || false // Default to open if nothing provided
    };
  }

  render() {
    const {title, fullWidth} = this.props;
    const wrapperStyle = {
      width: fullWidth ? null : styleConstants['content-width']
    };
    return (
      <div style={wrapperStyle}>
        <div style={styles.header}>
          <h2
            onClick={() => {
              this.setState({collapsed: !this.state.collapsed});
            }}
          >
            <FontAwesome
              icon={this.state.collapsed ? 'expand' : 'compress'}
              style={styles.icon}
            />
            {title}
          </h2>
        </div>
        <div style={styles.editors} hidden={this.state.collapsed}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
