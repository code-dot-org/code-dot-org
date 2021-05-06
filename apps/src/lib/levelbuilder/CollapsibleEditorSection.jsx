import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import styleConstants from '@cdo/apps/styleConstants';

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
    const editorsStyle = {
      ...styles.editors,
      width: fullWidth ? null : styleConstants['content-width']
    };
    return (
      <div>
        <div style={styles.header}>
          <h2
            onClick={() => {
              this.setState({collapsed: !this.state.collapsed});
            }}
            style={styles.title}
          >
            <FontAwesome
              icon={this.state.collapsed ? 'expand' : 'compress'}
              style={styles.icon}
            />
            {title}
          </h2>
        </div>
        <div style={editorsStyle} hidden={this.state.collapsed}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

const styles = {
  header: {
    borderBottom: '1px solid rgb(204, 204, 204)'
  },
  icon: {
    marginRight: 10
  },
  editors: {
    padding: 10
  },
  title: {
    fontSize: 20
  }
};
