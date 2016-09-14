// Copyright 2012 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Soy data primitives.
 *
 * The goal is to encompass data types used by Soy, especially to mark content
 * as known to be "safe".
 *
 * @author gboyer@google.com (Garrett Boyer)
 */

goog.provide('goog.soy.data');
goog.provide('goog.soy.data.SanitizedContent');
goog.provide('goog.soy.data.SanitizedContentKind');

goog.require('goog.i18n.bidi.Dir');


/**
 * A type of textual content.
 *
 * This is an enum of type Object so that these values are unforgeable.
 *
 * @enum {!Object}
 */
goog.soy.data.SanitizedContentKind = {

  /**
   * A snippet of HTML that does not start or end inside a tag, comment, entity,
   * or DOCTYPE; and that does not contain any executable code
   * (JS, {@code <object>}s, etc.) from a different trust domain.
   */
  HTML: goog.DEBUG ? {sanitizedContentKindHtml: true} : {},

  /**
   * Executable Javascript code or expression, safe for insertion in a
   * script-tag or event handler context, known to be free of any
   * attacker-controlled scripts. This can either be side-effect-free
   * Javascript (such as JSON) or Javascript that entirely under Google's
   * control.
   */
  JS: goog.DEBUG ? {sanitizedContentJsStrChars: true} : {},

  /**
   * A sequence of code units that can appear between quotes (either kind) in a
   * JS program without causing a parse error, and without causing any side
   * effects.
   * <p>
   * The content should not contain unescaped quotes, newlines, or anything else
   * that would cause parsing to fail or to cause a JS parser to finish the
   * string its parsing inside the content.
   * <p>
   * The content must also not end inside an escape sequence ; no partial octal
   * escape sequences or odd number of '{@code \}'s at the end.
   */
  JS_STR_CHARS: goog.DEBUG ? {sanitizedContentJsStrChars: true} : {},

  /** A properly encoded portion of a URI. */
  URI: goog.DEBUG ? {sanitizedContentUri: true} : {},

  /**
   * Repeated attribute names and values. For example,
   * {@code dir="ltr" foo="bar" onclick="trustedFunction()" checked}.
   */
  ATTRIBUTES: goog.DEBUG ? {sanitizedContentHtmlAttribute: true} : {},

  // TODO: Consider separating rules, declarations, and values into
  // separate types, but for simplicity, we'll treat explicitly blessed
  // SanitizedContent as allowed in all of these contexts.
  /**
   * A CSS3 declaration, property, value or group of semicolon separated
   * declarations.
   */
  CSS: goog.DEBUG ? {sanitizedContentCss: true} : {},

  /**
   * Unsanitized plain-text content.
   *
   * This is effectively the "null" entry of this enum, and is sometimes used
   * to explicitly mark content that should never be used unescaped. Since any
   * string is safe to use as text, being of ContentKind.TEXT makes no
   * guarantees about its safety in any other context such as HTML.
   */
  TEXT: goog.DEBUG ? {sanitizedContentKindText: true} : {}
};



/**
 * A string-like object that carries a content-type and a content direction.
 *
 * IMPORTANT! Do not create these directly, nor instantiate the subclasses.
 * Instead, use a trusted, centrally reviewed library as endorsed by your team
 * to generate these objects. Otherwise, you risk accidentally creating
 * SanitizedContent that is attacker-controlled and gets evaluated unescaped in
 * templates.
 *
 * @constructor
 */
goog.soy.data.SanitizedContent = function() {
  throw Error('Do not instantiate directly');
};


/**
 * The context in which this content is safe from XSS attacks.
 * @type {goog.soy.data.SanitizedContentKind}
 */
goog.soy.data.SanitizedContent.prototype.contentKind;


/**
 * The content's direction; null if unknown and thus to be estimated when
 * necessary.
 * @type {?goog.i18n.bidi.Dir}
 */
goog.soy.data.SanitizedContent.prototype.contentDir = null;


/**
 * The already-safe content.
 * @type {string}
 */
goog.soy.data.SanitizedContent.prototype.content;


/** @override */
goog.soy.data.SanitizedContent.prototype.toString = function() {
  return this.content;
};
