/**
 * @file Code that lets us set up the classroom map at /learn/local
 *   extracted to this file to be testable.
 */

import {escapeHtml} from '@cdo/apps/utils';

/**
 * Transform response into list of locations to display.
 * @param {Object} results
 * @returns {Array.<{lat, lon, title, html, zoom}>}
 */
export function getLocations(results) {
  if (!(results && results.response && results.response.docs)) {
    return [];
  }

  return results.response.docs.map((place, index) => {
    const [lat, lon] = place.location_p.split(',');
    const title = escapeHtml(place.school_name_s);
    const html = compileHTML(index, place);
    return {
      lat,
      lon,
      title,
      html,
      zoom: 10
    };
  });
}

/**
 * Generate HTML to be attached to a map pin for a given location.
 * @param {number} index
 * @param {object} location
 * @returns {string} HTML ready for use in the map.
 */
export function compileHTML(index, location) {
  const heading = createEntryDetail({tag: 'h3', text: location.school_name_s});
  const sharedContent = createSharedContent(location);
  const moreLink = createMoreLink(index);

  // Add details to the page for displaying in a modal popup.
  // Note: This has a side-effect on the DOM.
  addDetails(index, location, sharedContent);

  // Return concatenated HTML
  return heading.outerHTML + sharedContent.innerHTML + moreLink.outerHTML;
}

/**
 * Generate DOM elements for content to be shared between the location info
 * and the more details popup.
 * @param {object} location
 * @returns {HTMLDivElement}
 */
function createSharedContent(location) {
  const sharedContent = document.createElement('div');

  if (location.school_address_s) {
    sharedContent.appendChild(
      createEntryDetail({text: location.school_address_s})
    );
  }

  if (location.class_format_s) {
    const formatSuffix =
      location.school_tuition_s === 'yes'
        ? ' (private)'
        : location.school_tuition_s === 'no'
        ? ' (public)'
        : '';
    sharedContent.appendChild(
      createEntryDetail({
        label: 'Format: ',
        text:
          i18n(location.class_format_category_s) +
          ' - ' +
          i18n(location.class_format_s) +
          formatSuffix
      })
    );
  }

  if (location.school_level_ss) {
    sharedContent.appendChild(
      createEntryDetail({
        label: 'Level(s): ',
        text: location.school_level_ss
          .map(key => i18n(`level_${key}`))
          .join(', ')
      })
    );
  }

  if (location.class_languages_all_ss) {
    sharedContent.appendChild(
      createEntryDetail({
        label: 'Language(s): ',
        text: location.class_languages_all_ss.join(', ')
      })
    );
  }
  return sharedContent;
}

function createMoreLink(index) {
  const moreLinkDiv = document.createElement('div');
  const moreLinkA = document.createElement('a');
  moreLinkA.id = `location-details-trigger-${index}`;
  moreLinkA.className = 'location-details-trigger';
  moreLinkA.setAttribute('onclick', 'event.preventDefault();');
  moreLinkA.href = `#location-details-${index}`;
  moreLinkA.textContent = 'More information';
  moreLinkDiv.appendChild(moreLinkA);
  return moreLinkDiv;
}

/**
 * Create a div.entry-detail with specified text and (optional) label.
 * @param {string} [tag] Tag type to generate, `div` by default.
 * @param {string} [label] If provided, shows up as a **strong** tag in front
 *   of the text.
 * @param {string} text
 * @returns {HTMLDivElement}
 */
function createEntryDetail({tag = 'div', label, text}) {
  const div = document.createElement(tag);
  div.className = 'entry-detail';
  if (label) {
    const strong = document.createElement('strong');
    strong.textContent = label;
    div.appendChild(strong);
  }
  div.appendChild(document.createTextNode(text));
  return div;
}

export function i18n(token) {
  var labels = {
    in_school: 'In school',
    in_school_daily_programming_course: 'Daily programming course',
    in_school_ap_computer_science: 'AP computer science',
    in_school_full_university_cs_curriculum: 'Full university CS curriculum',
    in_school_robotics_club: 'Robotics club',
    in_school_programming_integrated_in_other_classes:
      'Programming integrated in other classes',
    in_school_summer_school_cs_program: 'Summer school CS program',
    in_school_other: 'Other in school',
    out_of_school: 'Out of school',
    out_of_school_summer_camp: 'Summer camp',
    out_of_school_afterschool_program: 'Afterschool program',
    'out_of_school_all-day_workshop': 'All-day workshop (up to 1 week)',
    'out_of_school_multi-week_workshop': 'Multi-week workshop',
    out_of_school_other: 'Other out of school',
    online: 'Online',
    online_programming_class: 'Online programming class',
    online_teacher_resource: 'Online teacher resource',
    online_other: 'Other online',
    level_preschool: 'Preschool',
    level_elementary: 'Elementary',
    level_middle_school: 'Middle school',
    level_high_school: 'High school',
    level_college: 'College',
    level_vocational: 'Vocational',
    languages_other: 'Other language(s)'
  };

  return labels[token];
}

/**
 * Push location details into a div#location-details in the DOM for
 * use in a modal pop-up associated with a map location.
 * @param {number} index
 * @param {object} location
 * @param {Node} sharedContent to add to the body of the modal
 */
function addDetails(index, location, sharedContent) {
  const destination = document.querySelector('#location-details');
  if (destination) {
    destination.appendChild(compileDetails(index, location, sharedContent));
  }
}

/**
 * Compile HTML contents of a pop-up associated with a map item.
 * @param index
 * @param location
 * @param {Node} initialContent - Preformed DOM elements to clone and
 *   include in the body of the popup.
 * @returns {HTMLDivElement} Contents for the body of the popup
 */
function compileDetails(index, location, initialContent) {
  const container = document.createElement('div');
  container.id = `location-details-${index}`;

  const heading = document.createElement('h2');
  heading.style.marginTop = '0';
  heading.style.marginBottom = '0.5em';
  heading.style.paddingTop = '0';
  heading.textContent = location.school_name_s;
  container.appendChild(heading);

  // PhantomJS 2.1.1 doesn't seem to have forEach implemented on NodeList,
  // so use this old-browser-friendly workaround to iterate over nodes.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
  Array.prototype.forEach.call(initialContent.childNodes, function(child) {
    const clone = child.cloneNode(true);
    // Strip class to preserve behavior
    clone.removeAttribute('class');
    container.appendChild(clone);
  });

  const website = normalizeURL(location.school_website_s);
  if (website) {
    const websiteDiv = document.createElement('div');
    const websiteStrong = document.createElement('strong');
    websiteStrong.textContent = 'Website: ';
    websiteDiv.appendChild(websiteStrong);
    const websiteA = document.createElement('a');
    websiteA.setAttribute('href', website);
    websiteA.setAttribute('target', '_blank');
    websiteA.textContent = website;
    websiteDiv.appendChild(websiteA);
    container.appendChild(websiteDiv);
  }

  if (location.class_description_s) {
    const descriptionP = document.createElement('p');
    descriptionP.style.marginTop = '1em';
    descriptionP.textContent = location.class_description_s;
    container.appendChild(descriptionP);
  }

  return container;
}

/**
 * Given a user-provided url (we hope)
 * - assume it's an external link, and prefix a protocol in case
 *   they omitted one.
 * - detect non-URLs and drop them entirely.
 * @param {string} possibleUrl
 * @return {string|undefined} normalized URL
 */
function normalizeURL(possibleUrl) {
  // Drop JavaScript hrefs entirely
  if (/^javascript/i.test(possibleUrl)) {
    return;
  }

  // Benefit of the doubt - coerce "example.com" to valid external
  // href "http://example.com".  Note we only support http/https
  // protocols here.
  if (possibleUrl && !possibleUrl.match(/^https?:\/\//i)) {
    possibleUrl = 'http://' + possibleUrl;
  }

  return possibleUrl;
}
