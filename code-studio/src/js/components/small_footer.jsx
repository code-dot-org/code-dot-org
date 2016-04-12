/*jshint scripturl:true*/

window.dashboard = window.dashboard || {};

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
    }}/>;
  }
});

var SmallFooter = React.createClass({
  propTypes: {
    // We let dashboard generate our i18n dropdown and pass it along as an
    // encode string of html
    i18nDropdown: React.PropTypes.string,
    copyrightInBase: React.PropTypes.bool.isRequired,
    copyrightStrings: React.PropTypes.shape({
      thank_you: React.PropTypes.string.isRequired,
      help_from_html: React.PropTypes.string.isRequired,
      art_from_html: React.PropTypes.string.isRequired,
      code_from_html: React.PropTypes.string.isRequired,
      powered_by_aws: React.PropTypes.string.isRequired,
      trademark: React.PropTypes.string.isRequired
    }),
    baseCopyrightString: React.PropTypes.string,
    baseMoreMenuString: React.PropTypes.string.isRequired,
    baseStyle: React.PropTypes.object,
    menuItems: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        text: React.PropTypes.string.isRequired,
        link: React.PropTypes.string.isRequired,
        copyright: React.PropTypes.bool,
        newWindow: React.PropTypes.bool
      })
    ).isRequired,
    // True if we're displaying this inside a phone (real, or our wireframe)
    phoneFooter: React.PropTypes.bool,
    className: React.PropTypes.string
  },

  getInitialState: function () {
    return {
      menuState: MenuState.MINIMIZED,
      baseWidth: 0,
      baseHeight: 0
    };
  },

  componentDidMount: function () {
    this.captureBaseElementDimensions();
    window.addEventListener('resize', this.captureBaseElementDimensions);
  },

  captureBaseElementDimensions: function () {
    var base = this.refs.base;
    this.setState({
      baseWidth: base.offsetWidth,
      baseHeight: base.offsetHeight
    });
  },

  minimizeOnClickAnywhere: function (event) {
    // The first time we click anywhere, hide any open children
    $(document.body).one('click', function (event) {
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
      setTimeout(function () {
        this.setState({ menuState: MenuState.MINIMIZED });
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
      copyright: {
        display: this.state.menuState === MenuState.COPYRIGHT ? 'block' : 'none',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 650,
        maxWidth: '50%',
        minWidth: this.state.baseWidth
      },
      copyrightScrollArea: {
        overflowY: 'auto',
        maxHeight: this.props.phoneFooter ? 210 : undefined,
        padding: '0.8em',
        borderBottom: 'solid thin #e7e8ea',
        marginBottom: this.state.baseHeight
      },
      moreMenu: {
        display: this.state.menuState === MenuState.EXPANDED ? 'block': 'none',
        bottom: this.state.baseHeight,
        width: this.state.baseWidth
      },
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
            <a className="more-link" href="javascript:void(0)"
              onClick={this.clickBaseMenu}>
              {this.props.baseMoreMenuString + ' '}
              <i className={caretIcon}/>
            </a>
          </small>
        </div>
        <div id="copyright-flyout" style={styles.copyright}>
          <div id="copyright-scroll-area" style={styles.copyrightScrollArea}>
            <EncodedParagraph text={this.props.copyrightStrings.thank_you}/>
            <p>{this.props.copyrightStrings.help_from_html}</p>
            <EncodedParagraph text={this.props.copyrightStrings.art_from_html}/>
            <EncodedParagraph text={this.props.copyrightStrings.code_from_html}/>
            <p>{this.props.copyrightStrings.powered_by_aws}</p>
            <EncodedParagraph text={this.props.copyrightStrings.trademark}/>
          </div>
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
            target={item.newWindow ? "_blank" : undefined}
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
module.exports = SmallFooter;

window.dashboard = window.dashboard || {};
window.dashboard.SmallFooter = SmallFooter;
