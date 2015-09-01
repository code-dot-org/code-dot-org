/* $ */

// This code might better live in shared eventually. doing that would
// require adding JSX transpiling to shared, and the ability to output multiple
// bundles

window.dashboard = window.dashboard || {};

window.dashboard.footer = (function () {
  /**
   * Gets our React component SmallFooter. We use a getter so that we don't depend
   * on React being in the global namespace at load time.
   */
  function createSmallFooter(React) {
    var MenuState = {
      MINIMIZING: 'MINIMIZING',
      MINIMIZED: 'MINIMIZED',
      EXPANDED: 'EXPANDED',
      COPYRIGHT: 'COPYRIGHT'
    };

    var EncodedParagraph = React.createClass({
      render: function () {
        return <p dangerouslySetInnerHTML={{
            __html: decodeURIComponent(this.props.text)
        }}/>
      }
    });

    return React.createClass({
      propTypes: {
        // We let dashboard generate our i18n dropdown and pass it along as an
        // encode string of html
        i18nDropdown: React.PropTypes.string,
        copyrightInBase: React.PropTypes.bool.isRequired,
        copyrightStrings: React.PropTypes.shape({
          thank_you: React.PropTypes.string.isRequired,
          help_from_html: React.PropTypes.string.isRequired,
          art_from_html: React.PropTypes.string.isRequired,
          powered_by_aws: React.PropTypes.string.isRequired,
          trademark: React.PropTypes.string.isRequired
        }),
        baseCopyrightString: React.PropTypes.string,
        baseMoreMenuString: React.PropTypes.string.isRequired,
        baseStyle: React.PropTypes.object,
        menuItems: React.PropTypes.arrayOf(
          React.PropTypes.shape({
            text: React.PropTypes.string.isRequired,
            link: React.PropTypes.string.isRequired
          })
        ).isRequired,
        className: React.PropTypes.string
      },

      getInitialState: function () {
        return {
          menuState: MenuState.MINIMIZED,
          copyrightStyle: null,
          moreMenuStyle: null
        };
      },

      componentDidMount: function () {
        var originalSetState = this.setState;
        var base = React.findDOMNode(this.refs.base);
        this.setState({
          copyrightStyle: {
            paddingBottom: base.offsetHeight
          },
          moreMenuStyle: {
            bottom: base.offsetHeight,
            width: base.offsetWidth,
          }
        });
      },

      minimizeOnClickAnywhere: function (event) {
        // The first time we click anywhere, hide any open children
        $(document.body).one('click', function (event) {
          // menu copyright has its own click handler
          if (event.target === React.findDOMNode(this.refs.menuCopyright)) {
            return;
          }

          this.setState({
            menuState: MenuState.MINIMIZING,
            moreOffset: 0
          });

          // Create a window during which we can't show again, so that clicking
          // on copyright doesnt immediately hide/reshow
          setTimeout(function () {
            this.setState({ menuState: MenuState.MINIMIZED })
          }.bind(this), 200);
        }.bind(this));
      },

      clickBase: function () {
        if (this.props.copyrightInBase) {
          // When we have multiple items in our base row, ignore clicks to the
          // row that aren't on those particular items
          return;
        }

        this.clickBaseMenu();
      },

      clickBaseCopyright: function () {
        if (this.state.menuState === MenuState.MINIMIZING) {
          return;
        }

        if (this.state.menuState === MenuState.COPYRIGHT) {
          this.setState({ menuState: MenuState.MINIMIZED });
          return;
        }

        this.setState({ menuState: MenuState.COPYRIGHT });
        this.minimizeOnClickAnywhere();
      },

      clickMenuCopyright: function (event) {
        this.setState({ menuState: MenuState.COPYRIGHT });
        this.minimizeOnClickAnywhere();
      },

      clickBaseMenu: function () {
        if (this.state.menuState === MenuState.MINIMIZING) {
          return;
        }

        if (this.state.menuState === MenuState.EXPANDED) {
          this.setState({ menuState: MenuState.MINIMIZED });
          return;
        }

        this.setState({ menuState: MenuState.EXPANDED });
        this.minimizeOnClickAnywhere();
      },

      render: function () {
        var styles = {
          smallFooter: {
            fontSize: this.props.fontSize
          },
          base: $.extend({}, this.props.baseStyle, {
            paddingBottom: 3,
            paddingTop: 3,
            // subtract top/bottom padding from row height
            height: this.props.rowHeight ? this.props.rowHeight - 6 : undefined
          }),
          copyright: $.extend({}, this.state.copyrightStyle, {
            display: this.state.menuState === MenuState.COPYRIGHT ? 'block' : 'none',
            maxHeight: 240,
            overflowY: 'scroll'
          }),
          moreMenu: $.extend({}, this.state.moreMenuStyle, {
            display: this.state.menuState === MenuState.EXPANDED ? 'block': 'none'
          }),
          listItem: {
            height: this.props.rowHeight,
            // account for padding (3px on top and bottom) and bottom border (1px)
            // on bottom border on child anchor element
            lineHeight: this.props.rowHeight ?
              (this.props.rowHeight - 6 - 1) + 'px' : undefined
          }
        };

        var caretIcon = this.state.menuState === MenuState.EXPANDED ?
          'fa fa-caret-down' : 'fa fa-caret-up';

        return (
          <div className={this.props.className} style={styles.smallFooter}>
            <div className="small-footer-base" ref="base" style={styles.base} onClick={this.clickBase}>
              <div dangerouslySetInnerHTML={{
                  __html: decodeURIComponent(this.props.i18nDropdown)
              }}/>
              <small>
                {this.renderCopyright()}
                <a className="more-link" href="#"
                  onClick={this.clickBaseMenu}>
                  {this.props.baseMoreMenuString + ' '}
                  <i className={caretIcon}/>
                </a>
              </small>
            </div>
            <div id="copyright-flyout" style={styles.copyright}>
              <EncodedParagraph text={this.props.copyrightStrings.thank_you}/>
              <p>{this.props.copyrightStrings.help_from_html}</p>
              <EncodedParagraph text={this.props.copyrightStrings.art_from_html}/>
              <p>{this.props.copyrightStrings.powered_by_aws}</p>
              <EncodedParagraph text={this.props.copyrightStrings.trademark}/>
            </div>
            {this.renderMoreMenu(styles)}
          </div>
        );
      },

      renderCopyright: function () {
        if (this.props.copyrightInBase) {
          return (
            <span>
              <a className="copyright-link" href="#"
                onClick={this.clickBaseCopyright}>
                {this.props.baseCopyrightString}
              </a>
              &nbsp;&nbsp;|&nbsp;&nbsp;
            </span>
          );
        }
      },

      renderMoreMenu: function (styles) {
        var menuItemElements = this.props.menuItems.map(function (item, index) {
          return (
            <li key={index} style={styles.listItem}>
            <a href={item.link}
              ref={item.copyright ? "menuCopyright" : undefined}
              onClick={item.copyright ? this.clickMenuCopyright : undefined}>
              {item.text}
            </a>
            </li>
          );
        }.bind(this));
        return (
          <ul id="more-menu" style={styles.moreMenu}>
            {menuItemElements}
          </ul>
        );
      }
    });
  }

  /**
   * We only want to create our SmallFooter component class once, and we don't
   * want to do this until we have a React.
   */
  var SmallFooter;

  function ensureSmallFooter (React) {
    if (SmallFooter) {
      return;
    }

    SmallFooter = createSmallFooter(React);
  }

  return {
    /**
     * render our small footer, adding copyright strings if we have them
     */
    render: function (React, reactProps, element) {
      ensureSmallFooter(React);

      return React.render(React.createElement(SmallFooter, reactProps), element);
    }
  };

})();
