import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import NavigationBarLink from './NavigationBarLink';

const styles = {
  navBar: {
    height: 50,
    width: '100%',
    backgroundColor: color.purple,
    marginBottom: 20
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

  changeActiveLink = (linkId, linkUrl) => {
    event.preventDefault();
    this.setState({activeLink: linkId});
    window.history.replaceState(null, null, linkUrl);
  };

  render() {
    const {links} = this.props;

    return (
      <div style={styles.navBar}>
        {links.map(link => (
          <div
            key={link.id}
            style={styles.linkBox}
            onClick={() => this.changeActiveLink(link.id, link.url)}
          >
            <NavigationBarLink
              label={link.label}
              active={link.url === this.state.activeLink}
            />
          </div>
        ))}
      </div>
    );
  }
}
