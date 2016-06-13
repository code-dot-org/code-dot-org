import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';

var styles = {
  standard: {
    marginBottom: 35,
    paddingTop: 19
  },
  inTopPane: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 0
  },
  // Optionally give markdown dialog wide left margin so it looks more like a
  // non-markdown instructions dialog (useful if mixing markdown instructions
  // with non-markdown instructions in one tutorial).
  classic: {
    marginBottom: 35,
    paddingTop: 0,
    marginLeft: 90
  }
};

const MarkdownInstructions = React.createClass({
  propTypes: {
    style: React.PropTypes.object,
    renderedMarkdown: React.PropTypes.string.isRequired,
    markdownClassicMargins: React.PropTypes.bool,
    onResize: React.PropTypes.func,
    inTopPane: React.PropTypes.bool
  },

  /**
   * Attach any necessary jQuery to our markdown
   */
  configureMarkdown_() {
    if (!this.props.onResize) {
      return;
    }

    // If we have the jQuery details plugin, enable its usage on any details
    // elements
    const detailsDOM = $(ReactDOM.findDOMNode(this)).find('details');
    if (detailsDOM.details) {
      detailsDOM.details();
      detailsDOM.on({
        'toggle.details.TopInstructions': () => {
          this.props.onResize();
        }
      });
    }

    // Parent needs to readjust some sizing after images have loaded
    $(ReactDOM.findDOMNode(this)).find('img').load(this.props.onResize);
  },

  componentDidMount() {
    this.configureMarkdown_();
  },

  componentDidUpdate(prevProps) {
    if (prevProps.renderedMarkdown !== this.props.renderedMarkdown) {
      this.configureMarkdown_();
    }
  },

  componentWillUnmount() {
    const detailsDOM = $(ReactDOM.findDOMNode(this)).find('details');
    if (detailsDOM.details) {
      detailsDOM.off('toggle.details.TopInstructions');
    }
  },

  render() {
    const { inTopPane, renderedMarkdown, markdownClassicMargins } = this.props;
    return (
      <div
        className='instructions-markdown'
        style={[
          styles.standard,
          inTopPane && styles.inTopPane,
          markdownClassicMargins && styles.classic,
          this.props.style
        ]}
        dangerouslySetInnerHTML={{ __html: renderedMarkdown }}/>
    );
  }
});

module.exports = Radium(MarkdownInstructions);
