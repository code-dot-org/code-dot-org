/* global React */

// TODO - looks like this ends up on every page - not only if we javascript_include_tag it

// TODO - i dont like having to wait on ready, but it seems like we need it
// since React won't be immediately available
$(window).ready(function () {
  window.dashboard = window.dashboard || {};

  var EncodedParagraph = React.createClass({
    render: function () {
      return <p dangerouslySetInnerHTML={{
          __html: decodeURIComponent(this.props.text)
      }}/>
    }
  });

  window.dashboard.SmallFooter = React.createClass({
    propTypes: {
      // We let dashboard generate our i18n dropdown and pass it along as an
      // encode string of html
      i18nDropdown: React.PropTypes.string,
      strings: React.PropTypes.shape({
        copyright: React.PropTypes.string.isRequired,
        more: React.PropTypes.string.isRequired,
        thank_you: React.PropTypes.string.isRequired,
        help_from_html: React.PropTypes.string.isRequired,
        art_from_html: React.PropTypes.string.isRequired,
        powered_by_aws: React.PropTypes.string.isRequired,
        trademark: React.PropTypes.string.isRequired,
        support: React.PropTypes.string.isRequired,
        translate: React.PropTypes.string.isRequired,
        tos: React.PropTypes.string.isRequired,
        privacy: React.PropTypes.string.isRequired,
      }).isRequired
    },

    getInitialState: function () {
      return {
        copyrightVisible: false,
        moreVisible: false,
        hidRecently: false,
        // TODO - combine with visibility?
        copyrightStyle: null,
        moreMenuStyle: null
      };
    },

    hideOnClickAnywhere: function () {
      // The first time we click anywhere, hide any open children
      $(document.body).one('click', function () {
        this.setState({
          copyrightVisible: false,
          moreVisible: false,
          moreOffset: 0,
          hidRecently: true,
        });

        // Create a window during which we can't show again, so that clicking
        // on copyright doesnt immediately hide/reshow
        setTimeout(function () {
          this.setState({ hidRecently: false})
        }.bind(this), 200);
      }.bind(this));
    },

    toggleVisibility: function (stateName) {
      if (this.state.hidRecently) {
        return;
      }

      var newState = {};
      newState[stateName] = !this.state[stateName];

      if (newState[stateName]) {
        this.hideOnClickAnywhere();
      }
      this.setState(newState);
    },

    toggleCopyright: function () {
      this.toggleVisibility('copyrightVisible');

      if (!this.state.copyrightStyle) {
        var smallFooter = React.findDOMNode(this.refs.smallFooter);
        this.setState({
          copyrightStyle: {
            paddingBottom: smallFooter.offsetHeight
          }
        });
      }
    },

    toggleMore: function () {
      this.toggleVisibility('moreVisible');

      // The first time we toggle the more menu, adjust width and align it
      // above small-footer
      if (!this.state.moreMenuStyle) {
        var smallFooter = React.findDOMNode(this.refs.smallFooter);
        this.setState({
          moreMenuStyle: {
            bottom: smallFooter.offsetHeight,
            width: smallFooter.offsetWidth,
          }
        });
      }
    },

    render: function () {
      var copyrightStyle = this.state.copyrightStyle || {};
      copyrightStyle.display = this.state.copyrightVisible ? 'block' : 'none';

      var moreStyle = this.state.moreMenuStyle || {};
      moreStyle.display = this.state.moreVisible ? 'block': 'none';

      var caretIcon = this.state.moreVisible ? 'fa fa-caret-down' : 'fa fa-caret-up';

      return (
        <div>
          <div className="small-footer" ref="smallFooter">
            <div dangerouslySetInnerHTML={{
                __html: decodeURIComponent(this.props.i18nDropdown)
            }}/>
            <small>
              <a className="copyright-link" href="javascript:void(0)"
                onClick={this.toggleCopyright}>
                {this.props.strings.copyright}
              </a>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <a className="more-link" href="javascript:void(0)"
                onClick={this.toggleMore}>
                {this.props.strings.more + ' '}
                <i className={caretIcon}/>
              </a>
            </small>
          </div>
          <div id="copyright-flyout" style={copyrightStyle}>
            <EncodedParagraph text={this.props.strings.thank_you}/>
            <p>{this.props.strings.help_from_html}</p>
            <EncodedParagraph text={this.props.strings.art_from_html}/>
            <p>{this.props.strings.powered_by_aws}</p>
            <EncodedParagraph text={this.props.strings.trademark}/>
          </div>
          <ul id="more-menu" style={moreStyle}>
            <li>
              <a href="https://support.code.org">{this.props.strings.support}</a>
            </li>
            <li>
              <a href="https://code.org/translate">{this.props.strings.translate}</a>
            </li>
            <li>
              <a href="https://code.org/tos">{this.props.strings.tos}</a>
            </li>
            <li>
              <a href="https://code.org/privacy">{this.props.strings.privacy}</a>
            </li>
          </ul>
        </div>
      );
    }
  });
});
