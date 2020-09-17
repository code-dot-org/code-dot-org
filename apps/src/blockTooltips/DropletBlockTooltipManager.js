/*globals dashboard*/
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import LibraryViewCode from '@cdo/apps/code-studio/components/libraries/LibraryViewCode';
var DropletFunctionTooltipMarkup = require('./DropletFunctionTooltip.html.ejs');
var dom = require('../dom');

/**
 * @fileoverview Displays tooltips for Droplet blocks
 */

/**
 * Handles displaying tooltips on Droplet blocks
 * @param {DropletTooltipManager} dropletTooltipManager
 * @constructor
 */
var DropletBlockTooltipManager = function(dropletTooltipManager) {
  this.dropletTooltipManager = dropletTooltipManager;
  this.showExamplesLink = dropletTooltipManager.dropletConfig.showExamplesLink;
  this.tooltipsEnabled = true;
};

var DEFAULT_TOOLTIP_CONFIG = {
  interactive: true,
  speed: 150,
  maxWidth: 450,
  position: 'right',
  contentAsHTML: true,
  theme: 'droplet-block-tooltipster',
  offsetY: 2,
  delay: 400
};

/**
 * Simple helper function that will swallow exceptions, and log them as
 * console.error. This is done because the way that some of our callbacks are
 * called by droplet, exceptions would bubble down to the droplet code, and
 * prevent desired behavior (i.e. we fail to transition back to block mode).
 */
function swallowErrors(fn) {
  return function() {
    try {
      fn();
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) {
        console.error(err);
      }
    }
  };
}

/**
 * @param {Editor} dropletEditor
 */
DropletBlockTooltipManager.prototype.installTooltipsForEditor_ = function(
  dropletEditor
) {
  this.installTooltipsForCurrentCategoryBlocks_();
  this.hideTooltipsOnBlockPick_(dropletEditor);

  dropletEditor.on(
    'changepalette',
    swallowErrors(this.installTooltipsForCurrentCategoryBlocks_.bind(this))
  );
  dropletEditor.on(
    'toggledone',
    swallowErrors(this.installTooltipsIfNotInstalled_.bind(this))
  );
};

DropletBlockTooltipManager.prototype.installTooltipsIfNotInstalled_ = function() {
  if (!$('.droplet-hover-div').hasClass('tooltipstered')) {
    this.installTooltipsForCurrentCategoryBlocks_();
  }
};

DropletBlockTooltipManager.prototype.installTooltipsForCurrentCategoryBlocks_ = function() {
  if (!this.tooltipsEnabled) {
    return;
  }

  $('.droplet-hover-div').each(
    function(_, blockHoverDiv) {
      if ($(blockHoverDiv).hasClass('tooltipstered')) {
        return;
      }

      const funcName = $(blockHoverDiv).attr('title');

      const hoverDivRect = blockHoverDiv.getBoundingClientRect();
      const toolboxRight = $('.droplet-palette-scroller').width();
      const offsetX = Math.min(hoverDivRect.width, toolboxRight);
      if (offsetX === 0) {
        // This happens when we start in design mode and the toolbox hasn't yet
        // rendered. In this case, skip installing the tooltips. We can try
        // again when the student switches to code mode and this method is
        // called again.
        return;
      }

      // Vertically center the tooltip on the block it belongs to.
      //
      // The direction of the offsetY input to tooltipster appears to be inverted
      // such that increasing offsetY moves the tooltip up.
      const offsetY = -(hoverDivRect.height / 2) + 2;

      const configuration = Object.assign({}, DEFAULT_TOOLTIP_CONFIG, {
        content: this.getTooltipHTML(funcName),
        offsetX,
        offsetY,
        functionReady: function(_, contents) {
          var tooltip = this.dropletTooltipManager.getDropletTooltip(funcName);
          if (tooltip.showExamplesLink) {
            var seeExamplesLink = contents.find('.tooltip-example-link > a')[0];
            // Important this binds to mouseDown/touchDown rather than click, needs to
            // happen before `blur` which triggers the ace editor completer popup
            // hide which in turn would hide the link and not show the docs.
            dom.addClickTouchEvent(
              seeExamplesLink,
              function(event) {
                this.dropletTooltipManager.showDocFor(funcName);
                event.stopPropagation();
              }.bind(this)
            );
          } else if (tooltip.showCodeLink) {
            var showCodeLink = contents.find('.tooltip-code-link > a')[0];
            // Important this binds to mouseDown/touchDown rather than click, needs to
            // happen before `blur` which triggers the ace editor completer popup
            // hide which in turn would hide the link and not show the docs.
            dom.addClickTouchEvent(showCodeLink, event => {
              var projectLibraries = dashboard.project.getProjectLibraries();
              var libraryName = funcName.split('.')[0];
              var library = projectLibraries.find(
                library => library.name === libraryName
              );
              if (library) {
                $('.tooltipstered').tooltipster('hide');
                $('body').append("<div id='libraryFunctionTooltipModal' />");
                ReactDOM.render(
                  <LibraryViewCode
                    title={library.name}
                    description={library.description}
                    onClose={() => {
                      var element = document.getElementById(
                        'libraryFunctionTooltipModal'
                      );
                      element.parentNode.removeChild(element);
                    }}
                    sourceCode={library.source}
                  />,
                  document.querySelector('#libraryFunctionTooltipModal')
                );
              }
            });
          }
        }.bind(this)
      });

      // Store the title/funcName as data-block so we can attach callouts later:
      $(blockHoverDiv).attr('data-block', funcName);
      // Store it also as a long id string for older callouts (note this
      // won't work with jquery if the funcName contains characters such as "*"):
      $(blockHoverDiv).attr('id', 'droplet_palette_block_' + funcName);
      $(blockHoverDiv).tooltipster(configuration);
    }.bind(this)
  );
};

/**
 * Tooltipster's hideOnClick setting does not work with the droplet hover
 * overlay as-is. Hide the tooltip on block picking explicitly.
 */
DropletBlockTooltipManager.prototype.hideTooltipsOnBlockPick_ = function(
  dropletEditor
) {
  dropletEditor.on('pickblock', function() {
    $('.tooltipstered').tooltipster('hide');
  });
};

/**
 * @returns {String} HTML for tooltip
 */
DropletBlockTooltipManager.prototype.getTooltipHTML = function(functionName) {
  var tooltipInfo = this.dropletTooltipManager.getDropletTooltip(functionName);
  return DropletFunctionTooltipMarkup({
    functionName: tooltipInfo.functionName,
    isProperty: tooltipInfo.isProperty,
    tipPrefix: tooltipInfo.tipPrefix,
    functionShortDescription: tooltipInfo.description,
    parameters: tooltipInfo.parameterInfos,
    signatureOverride: tooltipInfo.signatureOverride,
    showExamplesLink: tooltipInfo.showExamplesLink,
    showCodeLink: tooltipInfo.showCodeLink
  });
};

/**
 * @param {boolean} enabled if tooltips should be enabled
 */

DropletBlockTooltipManager.prototype.setTooltipsEnabled = function(enabled) {
  this.tooltipsEnabled = !!enabled;
};

module.exports = DropletBlockTooltipManager;
