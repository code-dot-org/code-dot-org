// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Conversions from plain string to goog.html types for use in
 * legacy APIs that do not use goog.html types.
 *
 * This file provides conversions to create values of goog.html types from plain
 * strings.  These conversions are intended for use in legacy APIs that consume
 * HTML in the form of plain string types, but whose implementations use
 * goog.html types internally (and expose such types in an augmented, HTML-type-
 * safe API).
 *
 * IMPORTANT: No new code should use the conversion functions in this file.
 *
 * The conversion functions in this file are guarded with global and
 * API-specific define flags.  The global flag
 * (goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS), if set to false,
 * effectively "locks in" an entire application to only use HTML-type-safe APIs.
 * API-specific flags permit the global flag to be overridden; doing so is
 * primarily intended during migrations.
 *
 * Intended use of the functions in this file are as follows:
 *
 * Many Closure and application-specific classes expose methods that consume
 * values that in the class' implementation are forwarded to DOM APIs that can
 * result in security vulnerabilities.  For example, goog.ui.Dialog's setContent
 * method consumes a string that is assigned to an element's innerHTML property;
 * if this string contains untrusted (attacker-controlled) data, this can result
 * in a cross-site-scripting vulnerability.
 *
 * Widgets such as goog.ui.Dialog are being augmented to expose safe APIs
 * expressed in terms of goog.html types.  For instance, goog.ui.Dialog has a
 * method setHtmlContent that consumes an object of type goog.html.SafeHtml, a
 * type whose contract guarantees that its value is safe to use in HTML context,
 * i.e. can be safely assigned to .innerHTML. An application that only uses this
 * API is forced to only supply values of this type, i.e. values that are safe.
 *
 * However, the legacy method setContent cannot (for the time being) be removed
 * from goog.ui.Dialog, due to a large number of existing callers.  The
 * implementation of goog.ui.Dialog has been refactored to use
 * goog.html.SafeHtml throughout.  This in turn requires that the value consumed
 * by its setContent method is converted to goog.html.SafeHtml in an unchecked
 * conversion. The conversion function is provided by this file:
 * goog.html.legacyconversions.safeHtmlFromString.
 *
 * Note that the semantics of the conversions in goog.html.legacyconversions are
 * very different from the ones provided by goog.html.uncheckedconversions:  The
 * latter are for use in code where it has been established through manual
 * security review that the value produced by a piece of code must always
 * satisfy the SafeHtml contract (e.g., the output of a secure HTML sanitizer).
 * In uses of goog.html.legacyconversions, this guarantee is not given -- the
 * value in question originates in unreviewed legacy code and there is no
 * guarantee that it satisfies the SafeHtml contract.
 *
 * To establish correctness with confidence, application code should be
 * refactored to use SafeHtml instead of plain string to represent HTML markup,
 * and to use goog.html-typed APIs (e.g., goog.ui.Dialog#setHtmlContent instead
 * of goog.ui.Dialog#setContent).
 *
 * To prevent introduction of new vulnerabilities, application owners can
 * effectively disable unsafe legacy APIs by compiling with the define
 * goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS set to false.  When
 * set, this define causes the conversion methods in this file to
 * unconditionally throw an exception.
 *
 * To support partial lock-in into safe APIs during migration of large
 * application codebases, packages/APIs can provide package/API-specific
 * overrides of this behavior.  API-specific overrides are only available if
 * goog.html.legacyconversions.ALLOW_LEGACY_CONVERSION_OVERRIDES is set. Then,
 * API-specific overrides (e.g., goog.ui.Dialog.ALLOW_UNSAFE_API) can be used to
 * disable safe-API enforcement for callers of specific APIs.  This permits
 * development teams to prevent the introduction of new call sites of unsafe
 * methods of classes whose use has already been migrated to safe APIs, while
 * uses of potentially unsafe methods of other classes are still present (not
 * yet refactored).
 *
 * Note that new code should always be compiled with
 * ALLOW_LEGACY_CONVERSIONS=false.  At some future point, the default for this
 * define may change to false.
 */


goog.provide('goog.html.legacyconversions');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');


/**
 * @define {boolean} Whether conversion from string to goog.html types for
 * legacy API purposes is permitted.
 *
 * If false, the conversion functions in this file unconditionally throw an
 * exception; except if per-API overrides are enabled (see fileoverview).
 */
goog.define('goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS', true);


/**
 * @define {boolean} Whether ALLOW_LEGACY_CONVERSIONS can be overridden on a
 * per-API/package basis.
 *
 * If true, the opt_override parameter of the conversion functions in
 * this file is respected, otherwise it is ignored.  See fileoverview for
 * details and intended use.
 */
goog.define('goog.html.legacyconversions.ALLOW_LEGACY_CONVERSION_OVERRIDES',
            false);


/**
 * Performs an "unchecked conversion" from string to SafeHtml for legacy API
 * purposes.
 *
 * Unchecked conversion will not proceed if ALLOW_LEGACY_CONVERSIONS is false,
 * and instead this function unconditionally throws an exception.
 *
 * Unchecked conversion proceeds if ALLOW_LEGACY_CONVERSION_OVERRIDES and
 * opt_override are true, even if ALLOW_LEGACY_CONVERSIONS is false.
 * This permits per-API/package override of ALLOW_LEGACY_CONVERSIONS during
 * migration/refactoring of large applications. See fileoverview for details.
 *
 * @param {string} html A string to be converted to SafeHtml.
 * @param {boolean=} opt_override If true, allows conversion to proceed
 *     even if ALLOW_LEGACY_CONVERSIONS is false, but only if
 *     ALLOW_LEGACY_CONVERSION_OVERRIDES is true as well.
 * @return {!goog.html.SafeHtml} The value of html, wrapped in a SafeHtml
 *     object.
 */
goog.html.legacyconversions.safeHtmlFromString = function(
    html, opt_override) {
  goog.html.legacyconversions.throwIfConversionDisallowed_(opt_override);
  return goog.html.legacyconversions.
      createSafeHtmlSecurityPrivateDoNotAccessOrElse_(html);
};


/**
 * Performs an "unchecked conversion" from string to TrustedResourceUrl for
 * legacy API purposes.
 *
 * Unchecked conversion will not proceed if ALLOW_LEGACY_CONVERSIONS is false,
 * and instead this function unconditionally throws an exception.
 *
 * Unchecked conversion proceeds if ALLOW_LEGACY_CONVERSION_OVERRIDES and
 * opt_override are true, even if ALLOW_LEGACY_CONVERSIONS is false.
 * This permits per-API/package override of ALLOW_LEGACY_CONVERSIONS during
 * migration/refactoring of large applications. See fileoverview for details.
 *
 * @param {string} url A string to be converted to TrustedResourceUrl.
 * @param {boolean=} opt_override If true, allows conversion to proceed
 *     even if ALLOW_LEGACY_CONVERSIONS is false, but only if
 *     ALLOW_LEGACY_CONVERSION_OVERRIDES is true as well.
 * @return {!goog.html.TrustedResourceUrl} The value of url, wrapped in a
 *     TrustedResourceUrl object.
 */
goog.html.legacyconversions.trustedResourceUrlFromString = function(
    url, opt_override) {
  goog.html.legacyconversions.throwIfConversionDisallowed_(opt_override);
  return goog.html.legacyconversions.
      createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse_(url);
};


/**
 * Performs an "unchecked conversion" from string to SafeUrl for legacy API
 * purposes.
 *
 * Unchecked conversion will not proceed if ALLOW_LEGACY_CONVERSIONS is false,
 * and instead this function unconditionally throws an exception.
 *
 * Unchecked conversion proceeds if ALLOW_LEGACY_CONVERSION_OVERRIDES and
 * opt_override are true, even if ALLOW_LEGACY_CONVERSIONS is false.
 * This permits per-API/package override of ALLOW_LEGACY_CONVERSIONS during
 * migration/refactoring of large applications. See fileoverview for details.
 *
 * @param {string} url A string to be converted to SafeUrl.
 * @param {boolean=} opt_override If true, allows conversion to proceed
 *     even if ALLOW_LEGACY_CONVERSIONS is false, but only if
 *     ALLOW_LEGACY_CONVERSION_OVERRIDES is true as well.
 * @return {!goog.html.SafeUrl} The value of url, wrapped in a SafeUrl
 *     object.
 */
goog.html.legacyconversions.safeUrlFromString = function(
    url, opt_override) {
  goog.html.legacyconversions.throwIfConversionDisallowed_(opt_override);
  return goog.html.legacyconversions.
      createSafeUrlSecurityPrivateDoNotAccessOrElse_(url);
};


/**
 * Internal wrapper for the package-private
 * goog.html.SafeHtml.createSafeHtml... function.
 * @param {string} html A string to be converted to SafeHtml.
 * @return {!goog.html.SafeHtml}
 * @private
 * @suppress {visibility} For access to SafeHtml.create...  Note that this
 *     use is appropriate since this method is intended to be "package private"
 *     within goog.html.  DO NOT call SafeHtml.create... from outside this
 *     package; use appropriate wrappers instead.
 */
goog.html.legacyconversions.createSafeHtmlSecurityPrivateDoNotAccessOrElse_ =
    function(html) {
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse_(
      html, null);
};


/**
 * Internal wrapper for the package-private
 * goog.html.TrustedResourceUrl.createTrustedResourceUrl... function.
 * @param {string} url A string to be converted to TrustedResourceUrl.
 * @return {!goog.html.TrustedResourceUrl}
 * @private
 * @suppress {visibility} For access to TrustedResourceUrl.create...  Note that
 *     this use is appropriate since this method is intended to be
 *     "package private" within goog.html.  DO NOT call
 *     TrustedResourceUrl.create... from outside this package; use appropriate
 *     wrappers instead.
 */
goog.html.legacyconversions.
    createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse_ = function(url) {
  return goog.html.TrustedResourceUrl
      .createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse_(url);
};


/**
 * Internal wrapper for the package-private goog.html.SafeUrl.createSafeUrl...
 * function.
 * @param {string} url A string to be converted to TrustedResourceUrl.
 * @return {!goog.html.SafeUrl}
 * @private
 * @suppress {visibility} For access to SafeUrl.create...  Note that this use
 *     is appropriate since this method is intended to be "package private"
 *     within goog.html.  DO NOT call SafeUrl.create... from outside this
 *     package; use appropriate wrappers instead.
 */
goog.html.legacyconversions.createSafeUrlSecurityPrivateDoNotAccessOrElse_ =
    function(url) {
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse_(url);
};


/**
 * Checks whether legacy conversion is allowed. Throws an exception if not.
 * @param {boolean=} opt_override Passed from public function. If true,
 *     allows conversion to proceed even if ALLOW_LEGACY_CONVERSIONS is false,
 *     but only if ALLOW_LEGACY_CONVERSION_OVERRIDES is true as well.
 * @private
 */
goog.html.legacyconversions.throwIfConversionDisallowed_ = function(
    opt_override) {
  if (!goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS &&
      !(goog.html.legacyconversions.ALLOW_LEGACY_CONVERSION_OVERRIDES &&
        opt_override)) {
    throw Error(
        'Error: Legacy conversion from string to goog.html types is disabled');
  }
};
