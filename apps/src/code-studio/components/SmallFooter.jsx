/*
We have to disable the jsx-no-target-blank here because we rely on the
referrer to determine the abuse url:
https://github.com/code-dot-org/code-dot-org/blob/b2efc7ca8331f8261ebd55a326e23f64cc29b5d9/apps/src/sites/studio/pages/report_abuse/report_abuse_form.js#L14
*/

/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/no-danger */
import _ from 'lodash';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import {userAlreadyReportedAbuse} from '@cdo/apps/reportAbuse';
import CopyrightDialog from '@cdo/apps/sharedComponents/footer/CopyrightDialog';
import i18n from '@cdo/locale';

const MenuState = {
  MINIMIZING: 'MINIMIZING',
  MINIMIZED: 'MINIMIZED',
  EXPANDED: 'EXPANDED',
  COPYRIGHT: 'COPYRIGHT',
};

export default class SmallFooter extends React.Component {
  static propTypes = {
    // We let dashboard generate our i18n dropdown and pass it along as an
    // encode string of html
    i18nDropdown: PropTypes.string,
    copyrightInBase: PropTypes.bool.isRequired,
    baseCopyrightString: PropTypes.string,
    baseMoreMenuString: PropTypes.string.isRequired,
    baseStyle: PropTypes.object,
    menuItems: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
        copyright: PropTypes.bool,
        newWindow: PropTypes.bool,
      })
    ).isRequired,
    // True if we're displaying this inside a phone (real, or our wireframe)
    phoneFooter: PropTypes.bool,
    className: PropTypes.string,
    fontSize: PropTypes.number,
    rowHeight: PropTypes.number,
    fullWidth: PropTypes.bool,
    channel: PropTypes.string,
    unitYear: PropTypes.string,
  };

  state = {
    menuState: MenuState.MINIMIZED,
    baseWidth: 0,
    baseHeight: 0,
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
      baseHeight: base.offsetHeight,
    });
  };

  clickBase = e => {
    if (this.props.copyrightInBase) {
      // When we have multiple items in our base row, ignore clicks to the
      // row that aren't on those particular items
      return;
    }
    this.clickBaseMenu(e);
  };

  clickBaseCopyright = e => {
    e.preventDefault();
    e.stopPropagation();

    if (this.state.menuState === MenuState.MINIMIZING) {
      return;
    }

    if (this.state.menuState === MenuState.COPYRIGHT) {
      this.setState({menuState: MenuState.MINIMIZED});
      return;
    }

    this.setState({menuState: MenuState.COPYRIGHT});
  };

  clickMenuCopyright = event => {
    event.stopPropagation();
    this.setState({menuState: MenuState.COPYRIGHT});
  };

  closeCopyrightDialog = e => {
    if (e !== undefined) {
      e.stopPropagation();
    }
    this.setState({menuState: MenuState.MINIMIZED});
  };

  clickBaseMenu = e => {
    e.stopPropagation();
    if (this.state.menuState === MenuState.MINIMIZING) {
      return;
    }

    if (
      this.state.menuState === MenuState.EXPANDED ||
      this.state.menuState === MenuState.COPYRIGHT
    ) {
      this.setState({menuState: MenuState.MINIMIZED});
      return;
    }

    this.setState({menuState: MenuState.EXPANDED});
  };

  render() {
    const styles = {
      smallFooter: {
        fontSize: this.props.fontSize,
      },
      base: {
        // subtract top/bottom padding from row height
        height: this.props.rowHeight ? this.props.rowHeight - 6 : undefined,
      },
      // Additional styling to base, above.
      baseFullWidth: {
        width: '100%',
        boxSizing: 'border-box',
      },
      moreMenu: {
        display: this.state.menuState === MenuState.EXPANDED ? 'block' : 'none',
        bottom: this.state.baseHeight,
        width: this.state.baseWidth,
      },
      version: {
        margin: 'auto 0',
      },
    };

    const combinedBaseStyle = {
      ...styles.base,
      ...this.props.baseStyle,
      ...(this.props.fullWidth && styles.baseFullWidth),
    };

    // Possible edge cases include unitYear with value 'unversioned'.
    // Filter for year ('20XX') all-numeral format.
    const yearIsNumeric = /^[0-9]+$/.test(this.props.unitYear);

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
          <CopyrightDialog
            isOpen={this.state.menuState === MenuState.COPYRIGHT}
            closeModal={this.closeCopyrightDialog}
          />
          {!!this.props.unitYear && yearIsNumeric && (
            <p style={styles.version}>
              <span className="version-caption">{i18n.version()}: </span>
              {this.props.unitYear}
            </p>
          )}
          {this.renderMoreMenuButton()}
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
              __html: decodeURIComponent(this.props.i18nDropdown),
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
          <Button
            aria-label={i18n.copyrightInfoButton()}
            className="copyright-link no-mc"
            color={buttonColors.gray}
            icon={{
              iconName: 'copyright',
              iconStyle: 'light',
            }}
            isIconOnly
            onClick={this.clickBaseCopyright}
            size="xs"
            type="secondary"
          />
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
      _.remove(this.props.menuItems, function (menuItem) {
        return menuItem.key === 'report-abuse';
      });
    }

    const menuItemElements = this.props.menuItems.map(
      function (item, index) {
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
