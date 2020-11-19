/* eslint-disable react/no-danger */
import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import debounce from 'lodash/debounce';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {userAlreadyReportedAbuse} from '@cdo/apps/reportAbuse';

const MenuState = {
  MINIMIZING: 'MINIMIZING',
  MINIMIZED: 'MINIMIZED',
  EXPANDED: 'EXPANDED',
  COPYRIGHT: 'COPYRIGHT'
};

export default class SmallFooter extends React.Component {
  static propTypes = {
    // We let dashboard generate our i18n dropdown and pass it along as an
    // encode string of html
    i18nDropdown: PropTypes.string,
    copyrightInBase: PropTypes.bool.isRequired,
    copyrightStrings: PropTypes.shape({
      thank_you: PropTypes.string.isRequired,
      help_from_html: PropTypes.string.isRequired,
      art_from_html: PropTypes.string.isRequired,
      code_from_html: PropTypes.string.isRequired,
      powered_by_aws: PropTypes.string.isRequired,
      trademark: PropTypes.string.isRequired
    }),
    baseCopyrightString: PropTypes.string,
    baseMoreMenuString: PropTypes.string.isRequired,
    baseStyle: PropTypes.object,
    menuItems: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
        copyright: PropTypes.bool,
        newWindow: PropTypes.bool
      })
    ).isRequired,
    // True if we're displaying this inside a phone (real, or our wireframe)
    phoneFooter: PropTypes.bool,
    className: PropTypes.string,
    fontSize: PropTypes.number,
    rowHeight: PropTypes.number,
    fullWidth: PropTypes.bool,
    channel: PropTypes.string
  };

  state = {
    menuState: MenuState.MINIMIZED,
    baseWidth: 0,
    baseHeight: 0
  };

  componentDidMount() {
    this.captureBaseElementDimensions();
    window.addEventListener(
      'resize',
      debounce(this.captureBaseElementDimensions, 100)
    );
  }

  captureBaseElementDimensions = () => {
    const base = this.refs.base;
    this.setState({
      baseWidth: base.offsetWidth,
      baseHeight: base.offsetHeight
    });
  };

  minimizeOnClickAnywhere(event) {
    // The first time we click anywhere, hide any open children
    $(document.body).one(
      'click',
      function(event) {
        // menu copyright has its own click handler
        if (event.target === this.refs.menuCopyright) {
          return;
        }

        this.setState({
          menuState: MenuState.MINIMIZING,
          moreOffset: 0
        });

        // Create a window during which we can't show again, so that clicking
        // on copyright doesnt immediately hide/reshow
        setTimeout(
          function() {
            this.setState({menuState: MenuState.MINIMIZED});
          }.bind(this),
          200
        );
      }.bind(this)
    );
  }

  clickBase = () => {
    if (this.props.copyrightInBase) {
      // When we have multiple items in our base row, ignore clicks to the
      // row that aren't on those particular items
      return;
    }
    this.clickBaseMenu();
  };

  clickBaseCopyright = e => {
    e.preventDefault();

    if (this.state.menuState === MenuState.MINIMIZING) {
      return;
    }

    if (this.state.menuState === MenuState.COPYRIGHT) {
      this.setState({menuState: MenuState.MINIMIZED});
      return;
    }

    this.setState({menuState: MenuState.COPYRIGHT});
    this.minimizeOnClickAnywhere();
  };

  clickMenuCopyright = event => {
    this.setState({menuState: MenuState.COPYRIGHT});
    this.minimizeOnClickAnywhere();
  };

  clickBaseMenu = () => {
    if (this.state.menuState === MenuState.MINIMIZING) {
      return;
    }

    if (this.state.menuState === MenuState.EXPANDED) {
      this.setState({menuState: MenuState.MINIMIZED});
      return;
    }

    this.setState({menuState: MenuState.EXPANDED});
    this.minimizeOnClickAnywhere();
  };

  render() {
    const styles = {
      smallFooter: {
        fontSize: this.props.fontSize
      },
      base: {
        // subtract top/bottom padding from row height
        height: this.props.rowHeight ? this.props.rowHeight - 6 : undefined
      },
      // Additional styling to base, above.
      baseFullWidth: {
        width: '100%',
        boxSizing: 'border-box'
      },
      copyright: {
        display: this.state.menuState === MenuState.COPYRIGHT ? 'flex' : 'none',
        position: 'absolute',
        bottom: 0,
        width: 650,
        maxWidth: '50%',
        minWidth: this.state.baseWidth
      },
      copyrightScrollArea: {
        maxHeight: this.props.phoneFooter ? 210 : undefined,
        marginBottom: this.state.baseHeight - 1
      },
      moreMenu: {
        display: this.state.menuState === MenuState.EXPANDED ? 'block' : 'none',
        bottom: this.state.baseHeight,
        width: this.state.baseWidth
      }
    };

    const combinedBaseStyle = {
      ...styles.base,
      ...this.props.baseStyle,
      ...(this.props.fullWidth && styles.baseFullWidth)
    };

    return (
      <div className={this.props.className} style={styles.smallFooter}>
        <div
          className="small-footer-base"
          ref="base"
          style={combinedBaseStyle}
          onClick={this.clickBase}
        >
          {this.renderI18nDropdown()}
          {this.renderCopyright()}
          {this.renderMoreMenuButton()}
        </div>
        <div id="copyright-flyout" style={styles.copyright}>
          <div id="copyright-scroll-area" style={styles.copyrightScrollArea}>
            <h4>{this.props.baseCopyrightString}</h4>
            <SafeMarkdown
              markdown={decodeURIComponent(
                this.props.copyrightStrings.thank_you
              )}
            />
            <p>{this.props.copyrightStrings.help_from_html}</p>
            <SafeMarkdown
              markdown={decodeURIComponent(
                this.props.copyrightStrings.art_from_html
              )}
            />
            <SafeMarkdown
              markdown={decodeURIComponent(
                this.props.copyrightStrings.code_from_html
              )}
            />
            <p>{this.props.copyrightStrings.powered_by_aws}</p>
            <SafeMarkdown
              markdown={decodeURIComponent(
                this.props.copyrightStrings.trademark
              )}
            />
          </div>
        </div>
        {this.renderMoreMenu(styles)}
      </div>
    );
  }

  renderI18nDropdown() {
    if (this.props.i18nDropdown) {
      return (
        <div className="i18n-dropdown-container">
          <span className="globe-icon">
            <i className="fa fa-globe" aria-hidden="true" />
          </span>
          <div
            dangerouslySetInnerHTML={{
              __html: decodeURIComponent(this.props.i18nDropdown)
            }}
          />
        </div>
      );
    }
  }

  renderCopyright() {
    if (this.props.copyrightInBase) {
      return (
        <span className="copyright-button">
          <button
            className="copyright-link no-mc"
            type="button"
            onClick={this.clickBaseCopyright}
          >
            &copy;
          </button>
        </span>
      );
    }
  }

  renderMoreMenuButton() {
    let menuItems = this.props.menuItems;
    if (menuItems && menuItems.length > 0) {
      const caretIcon =
        this.state.menuState === MenuState.EXPANDED
          ? 'fa fa-caret-down'
          : 'fa fa-caret-up';
      // FND-1169: Copyright should be a <button>, not a <a>
      return (
        <button
          type="button"
          className="more-link"
          onClick={this.clickBaseMenu}
        >
          {this.props.baseMoreMenuString}&nbsp;
          <i className={caretIcon} />
        </button>
      );
    }
  }

  renderMoreMenu(styles) {
    const channelId = this.props.channel;
    const alreadyReportedAbuse = userAlreadyReportedAbuse(channelId);
    if (alreadyReportedAbuse) {
      _.remove(this.props.menuItems, function(menuItem) {
        return menuItem.key === 'report-abuse';
      });
    }

    const menuItemElements = this.props.menuItems.map(
      function(item, index) {
        return (
          <li
            key={index}
            style={styles.listItem}
            className={`ui-test-${item.key}`}
          >
            <a
              href={item.link}
              ref={item.copyright ? 'menuCopyright' : undefined}
              target={item.newWindow ? '_blank' : '_parent'}
              onClick={item.copyright ? this.clickMenuCopyright : undefined}
            >
              {item.text}
            </a>
          </li>
        );
      }.bind(this)
    );
    return (
      <ul id="more-menu" style={styles.moreMenu}>
        {menuItemElements}
      </ul>
    );
  }
}
