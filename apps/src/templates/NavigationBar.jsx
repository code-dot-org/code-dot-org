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
  };

  render() {
    const {links} = this.props;

    return (
      <div style={styles.navBar}>
        {links.map(link => (
          <div
            key={link.url}
            style={styles.linkBox}
          >
            <NavigationBarLink
              label={link.label}
              url={link.url}
            />
          </div>
        ))}
      </div>
    );
  }
}
