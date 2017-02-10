/* eslint-disable react/no-danger */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import { connect } from 'react-redux';

var styles = {
  standard: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 0
  },
  canCollapse: {
    marginTop: 0,
    marginBottom: 0,
  }
};

const MarkdownInstructions = React.createClass({
  propTypes: {
    renderedMarkdown: React.PropTypes.string.isRequired,
    noInstructionsWhenCollapsed: React.PropTypes.bool.isRequired,
    onResize: React.PropTypes.func,
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
    const canCollapse = !this.props.noInstructionsWhenCollapsed;
    return (
      <div
        className="instructions-markdown"
        style={[
          styles.standard,
          canCollapse && styles.canCollapse
        ]}
        dangerouslySetInnerHTML={{ __html: this.props.renderedMarkdown }}
      />
    );
  }
});

export const StatelessMarkdownInstructions = Radium(MarkdownInstructions);
export default connect(state => ({
  noInstructionsWhenCollapsed: state.instructions.noInstructionsWhenCollapsed,
}))(Radium(MarkdownInstructions));
