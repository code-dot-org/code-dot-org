/**
 * Blockly-dev-test-page-only temporary workaround for Chrome 34 SVG bug #349701
 *
 * - Loads jQuery from googleapis.com
 * - Workaround mostly copied from Dashboard
 * - Assumes 2 seconds is long enough for jQuery load
 *
 * Bug details: https://code.google.com/p/chromium/issues/detail?id=349701
 *   tl;dr: only the first clippath in a given svg element renders
 *
 * Workaround: wrap all clippath/image pairs into their own svg elements
 *
 * 1. Wrap any existing clippath/image pairs in empty svg elements
 * 2. Wrap new clippath/image pairs once added, remove empty wrappers once removed
 * 3. Farmer special case: give the farmer's wrapper svg the "pegman-location" attribute
 */
var jqueryLoadDelay = 2000;
var jq = document.createElement('script');
jq.src = "http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(jq);

window.setTimeout(function(){
  jQuery.noConflict();
  PEGMAN_ID = 'pegman';
  PEGMAN_ORDERING_CLASS = 'pegman-location';

  function clipPathIDForImage(image) {
    var clipPath = jQuery(image).attr('clip-path');
    return clipPath ? clipPath.match(/\(\#(.*)\)/)[1] : undefined;
  }

  function wrapImageAndClipPathWithSVG(image, wrapperClass) {
    var svgWrapper = jQuery('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" />');
    if (wrapperClass) {
      svgWrapper.attr('class', wrapperClass);
    }

    var clipPathID = clipPathIDForImage(image);
    var clipPath = jQuery('#' + clipPathID);
    clipPath.insertAfter(image).add(image).wrapAll(svgWrapper);
  }

  // Find pairs of new images and clip paths, wrapping them in SVG tags when a pair is found
  function handleClipPathChanges() {
    var canvas = jQuery('#visualization>svg')[0];
    if (!canvas) { return; }

    var newImages = {};
    var newClipPaths = {};

    var observer = new WebKitMutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        for (var addedIndex = 0; addedIndex < mutation.addedNodes.length; addedIndex++) {
          var newNode = mutation.addedNodes[addedIndex];
          if (newNode.nodeName == 'image') { newImages[jQuery(newNode).attr('id')] = newNode; }
          if (newNode.nodeName == 'clipPath') { newClipPaths[jQuery(newNode).attr('id')] = newNode; }
        }
        for (var removedIndex = 0; removedIndex < mutation.removedNodes.length; removedIndex++) {
          var removedNode = mutation.removedNodes[removedIndex];
          if (removedNode.nodeName == 'image' || removedNode.nodeName == 'clipPath') {
            jQuery('svg > svg:empty').remove();
          }
        }
      });

      jQuery.each(newImages, function(key, image) {
        var clipPathID = clipPathIDForImage(image);
        if (newClipPaths.hasOwnProperty(clipPathID)) {
          wrapImageAndClipPathWithSVG(image);
          delete newImages[key];
          delete newClipPaths[clipPathID];
        }
      });
    });

    observer.observe(canvas, { childList: true });
  }

  function wrapExistingClipPaths() {
    jQuery('[clip-path]').each(function(i, image){
      if (jQuery(image).attr('class') === PEGMAN_ORDERING_CLASS) {
        // Special case for Farmer, whose class is used for element ordering
        jQuery(image).attr('class', '');
        wrapImageAndClipPathWithSVG(image, PEGMAN_ORDERING_CLASS);
      } else {
        wrapImageAndClipPathWithSVG(image);
      }
    });
  }

  wrapExistingClipPaths();
  handleClipPathChanges();
}, jqueryLoadDelay);
