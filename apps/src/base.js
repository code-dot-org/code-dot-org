/**
 * Blockly Apps: Common code
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Common support code for Blockly apps.
 * @author fraser@google.com (Neil Fraser)
 */
"use strict";

/**
 * Load the StudioAppClass and create a singleton instance of it, which we export
 * as singleton. Most of our apps will load this singleton into a global, the
 * expception currently being Artist
 */
var StudioAppClass = require('./StudioApp');
var studioAppSingleton = new StudioAppClass();
var feedback = require('./feedback');

module.exports = studioAppSingleton;

// TODO (br-pair) : This is how we associate our singleton feedback object with
// our singleton StudioApp object. We can almost certainly do this more cleanly..
feedback.applySingleton(studioAppSingleton);
studioAppSingleton.feedback_ = feedback;
