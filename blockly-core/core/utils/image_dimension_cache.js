/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Class for caching image dimensions which have been dynamically determined
 */
'use strict';

goog.provide('Blockly.ImageDimensionCache');

/**
 * Cache for image dimensions
 * Hash of hashes: {imageUrl: String => {width: Number, height: Number}} 
 * @private
 */
Blockly.ImageDimensionCache.imageDimensions_ = {};

Blockly.ImageDimensionCache.IMAGE_LOADING_WIDTH = 40;
Blockly.ImageDimensionCache.IMAGE_LOADING_HEIGHT = 40;

/**
 * Given a target image, calls back with its dimensions
 * If found, calls back immediately with dimensions
 * If not found, calls back with default dimensions and later with an update
 * @returns {width: *, height: *} of image (default)
 */
Blockly.ImageDimensionCache.getCachedDimensionsOrDefaultAndUpdate = function(imageUrl, onDimensionUpdate) {
  var cachedDimensions = Blockly.ImageDimensionCache.getCachedDimensions(imageUrl);
  if (cachedDimensions) {
    return cachedDimensions;
  } else {
    Blockly.ImageDimensionCache.getDimensionsAsync(imageUrl, onDimensionUpdate);
    return {width: Blockly.ImageDimensionCache.IMAGE_LOADING_WIDTH, height: Blockly.ImageDimensionCache.IMAGE_LOADING_HEIGHT};
  }
};

/**
 * @returns Dictionary of {width: Number, height: Number} or undefined if image dimensions are not already cached
 */
Blockly.ImageDimensionCache.getCachedDimensions = function(imageUrl) {
  return Blockly.ImageDimensionCache.imageDimensions_[imageUrl];
};

Blockly.ImageDimensionCache.storeDimensions = function(imageUrl, width, height) {
  Blockly.ImageDimensionCache.imageDimensions_[imageUrl] = {width: width, height: height};
};

/**
 * Gets image width and height by loading the image.
 * @param {string} url
 * @param {!Function} callback Callback with parameters (width, height) to run upon
 *                    receiving width and height
 */
Blockly.ImageDimensionCache.getDimensionsAsync = function(url, callback) {
  var img = new Image();
  img.onload = function(){
    Blockly.ImageDimensionCache.storeDimensions(url, img.width, img.height);
    callback(img.width, img.height);
  };
  // For cached image support in IE9, src set must occur after onload set
  img.src = url;
};
