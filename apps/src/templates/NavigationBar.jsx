import React, { PropTypes } from 'react';
import _ from 'lodash';
import color from "@cdo/apps/util/color";
import FontAwesome from './FontAwesome';
import NavigationBarLink from './NavigationBarLink';

const styles = {
  navBar: {
    height: 50,
    width: '100%',
    backgroundColor: color.purple,
    marginBottom: 20,
  },
  linksBox: {
    overflow: 'auto',
    whiteSpace: 'nowrap',
    display: 'inline',
    float: 'left',
    width: 920
  },
  linkBox: {
    display: 'inline',
    paddingRight: 20,
    paddingLeft: 20,
  },
  chevron: {
    fontSize: 20,
    lineHeight: '50px',
    color: color.white,
    textDecoration: 'none',
    cursor: 'pointer',
    height: 50,
    width: 25,
    backgroundColor: color.purple,
    paddingLeft: 10,
    paddingRight: 10,
    display: 'inline',
    float: 'left'
  }
};

export default class NavigationBar extends React.Component {
  static propTypes = {
    links: PropTypes.array.isRequired,
  };

  state = {
    listPosition: "start"
  };

  scrollForward = () => {
    const lastLink = _.last(this.props.links);
    if (lastLink && lastLink.url) {
      const element = document.getElementById(lastLink.url);
      element.scrollIntoView({block: "end", behavior: "smooth"});
      this.setState({listPosition: "end"});
    }
  };

  scrollBackward = () => {
    const firstLink = _.first(this.props.links);
    if (firstLink && firstLink.url) {
      const element = document.getElementById(firstLink.url);
      element.scrollIntoView({block: "start", behavior: "smooth"});
      this.setState({listPosition: "start"});
    }
  };

  render() {
    const {links} = this.props;

    return (
      <div style={styles.navBar}>
        {this.state.listPosition === "end" &&
          <FontAwesome
            icon="chevron-left"
            style={styles.chevron}
            onClick={this.scrollBackward}
          />
        }
        <div style={styles.linksBox}>
          {links.map(link => (
            <div
              id={link.url}
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
        {this.state.listPosition === "start" &&
          <FontAwesome
            icon="chevron-right"
            style={styles.chevron}
            onClick={this.scrollForward}
          />
        }
      </div>
    );
  }
}
