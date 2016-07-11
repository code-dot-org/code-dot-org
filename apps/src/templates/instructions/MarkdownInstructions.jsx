import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import { connect } from 'react-redux';

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
  inTopPaneCanCollapse: {
    marginTop: 0,
    marginBottom: 0,
  },
  inTopPaneWithImage: {
    minHeight: 300
  }
};

const MarkdownInstructions = React.createClass({
  propTypes: {
    renderedMarkdown: React.PropTypes.string.isRequired,
    noInstructionsWhenCollapsed: React.PropTypes.bool.isRequired,
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

    // We have a bunch of "More about angles" images we use to teach about angles
    // These can show up looking too big in the top pane. Set max-width to be 566
    // (the width they display at when in our modal). We expect to stop using
    // theses images in the nearish future, at which point this special casing can go away.
    if (this.props.inTopPane) {
      $(ReactDOM.findDOMNode(this)).find('img').each(function () {
        const img = $(this);
        const src = img.attr('src');
        if (src === 'https://images.code.org/b3e16306f7b61c467d9cd9fbad36f41d-image-1438990511487.gif' ||
            src === 'https://images.code.org/dede4ee3f1698a385a3a8e404d5758b4-image-1439254128944.gif' ||
            src === 'https://images.code.org/c24a3fdc9e5e31b4e943f749a18b7996-image-1439254361981.png' ||
            src === 'https://images.code.org/f136858614ddcb18ab7cf2901300efa6-image-1438990602704.png' ||
            src === 'https://images.code.org/8ac71bed65fe0a472a6cc7629e8fdac9-image-1442593741401.png' ||
            src === 'https://images.code.org/083d4888f1fe97a7e8645924bf01a336-image-1442593512858.png') {
          img.css('max-width', 566);
        }
      });
    }
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
    const {
      inTopPane,
      renderedMarkdown,
      noInstructionsWhenCollapsed
    } = this.props;

    // In cases where we have an image, we want to guarantee a certain amount of
    // height, to deal with the fact that we want know how much height the image
    // actually needs until it has loaded
    const hasImage = /<img src/.test(renderedMarkdown);
    const canCollapse = !this.props.noInstructionsWhenCollapsed;
    return (
      <div
        className='instructions-markdown'
        style={[
          styles.standard,
          inTopPane && styles.inTopPane,
          inTopPane && hasImage && styles.inTopPaneWithImage,
          inTopPane && canCollapse && styles.inTopPaneCanCollapse
        ]}
        dangerouslySetInnerHTML={{ __html: renderedMarkdown }}/>
    );
  }
});

module.exports = connect(state => ({
  noInstructionsWhenCollapsed: state.instructions.noInstructionsWhenCollapsed,
}))(Radium(MarkdownInstructions));
