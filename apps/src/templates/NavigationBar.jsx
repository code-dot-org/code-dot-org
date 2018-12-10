import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import NavigationBarLink from './NavigationBarLink';

const styles = {
  navBar: {
    height: 50,
    width: '100%',
    backgroundColor: color.purple,
  },
  linkBox: {
    display: 'inline',
    paddingRight: 20,
    paddingLeft: 20,
  },
};

export default class NavigationBar extends React.Component {
  static propTypes = {
    links: PropTypes.array,
    defaultActiveLink: PropTypes.string,
  };

  state = {
    activeLink: this.props.defaultActiveLink,
  };

  changeActiveLink = (linkId) => {
    event.preventDefault();
    this.setState({activeLink: linkId});
  };

  render() {
    const {links} = this.props;

    return (
      <div style={styles.navBar}>
        {links.map(link => (
          <div
            key={link.id}
            style={styles.linkBox}
            onClick={() => this.changeActiveLink(link.id)}
          >
            <NavigationBarLink
              label={link.label}
              active={link.id === this.state.activeLink}
            />
          </div>
        ))}
      </div>
    );
  }
}
