import {assert} from 'chai';
import {compileHTML, getLocations, i18n} from '@cdo/apps/lib/ui/classroomMap';

describe('classroomMap.js', () => {
  describe('getLocations()', () => {
    it("doesn't throw any errors", () => {
      const result = getLocations(SAMPLE_RESPONSE);
      assert.deepEqual(result, EXPECTED_LOCATIONS);
    });
  });

  describe('compileHTML()', () => {
    it('end-to-end coverage', () => {
      const result = compileHTML(1, SAMPLE_LOCATION);
      assert.equal(
        result,
        '<h3 class="entry-detail">Code on the Road</h3>' +
          '<div class="entry-detail">Example Building 8th floor\nSeattle, WA 98109\nUnited States</div>' +
          '<div class="entry-detail"><strong>Format: </strong>Out of school - Other out of school (private)</div>' +
          '<div class="entry-detail"><strong>Level(s): </strong>High school, College</div>' +
          '<div class="entry-detail"><strong>Language(s): </strong>C#, Python</div>' +
          '<div><a id="location-details-trigger-1" class="location-details-trigger" onclick="event.preventDefault();" href="#location-details-1">More information</a></div>'
      );
    });

    it('includes a line for school name', () => {
      const fakeName = 'My example school';
      const input = {
        ...SAMPLE_LOCATION,
        school_name_s: fakeName
      };
      assert.include(
        compileHTML(1, input),
        `<h3 class="entry-detail">${fakeName}</h3>`
      );
    });

    it('school name guards against JavaScript injection', () => {
      const input = {
        ...SAMPLE_LOCATION,
        school_name_s: `<a onmouseover="alert('gotcha')">Fake Name</a>`
      };
      assert.include(
        compileHTML(1, input),
        `&lt;a onmouseover="alert('gotcha')"&gt;Fake Name&lt;/a&gt;`
      );
    });

    it('optionally includes a line for school address', () => {
      const fakeAddress = 'My example address';
      const expectedMarkup = `<div class="entry-detail">${fakeAddress}</div>`;

      const withAddress = {
        ...SAMPLE_LOCATION,
        school_address_s: fakeAddress
      };
      assert.include(compileHTML(1, withAddress), expectedMarkup);

      const withoutAddress = {
        ...withAddress,
        school_address_s: null
      };
      assert.notInclude(compileHTML(1, withoutAddress), expectedMarkup);
    });

    it('school address guards against JavaScript injection', () => {
      const input = {
        ...SAMPLE_LOCATION,
        school_address_s: `<a onmouseover="alert('gotcha')">Fake Address</a>`
      };
      assert.include(
        compileHTML(1, input),
        `&lt;a onmouseover="alert('gotcha')"&gt;Fake Address&lt;/a&gt;`
      );
    });

    it('optionally includes a line for class format', () => {
      const withoutClassFormat = {
        ...SAMPLE_LOCATION,
        class_format_s: null,
        class_format_category_s: null
      };
      assert.notInclude(compileHTML(1, withoutClassFormat), 'Format:');

      const fakeFormat = 'in_school_daily_programming_course';
      const fakeCategoryFormat = 'in_school';
      const withFormatNoTuition = {
        ...withoutClassFormat,
        class_format_s: fakeFormat,
        class_format_category_s: fakeCategoryFormat,
        school_tuition_s: null
      };
      assert.include(
        compileHTML(1, withFormatNoTuition),
        `<div class="entry-detail"><strong>Format: </strong>${i18n(
          fakeCategoryFormat
        )} - ${i18n(fakeFormat)}</div>`
      );

      const withFormatPublic = {
        ...withFormatNoTuition,
        school_tuition_s: 'no'
      };
      assert.include(
        compileHTML(1, withFormatPublic),
        `<div class="entry-detail"><strong>Format: </strong>${i18n(
          fakeCategoryFormat
        )} - ${i18n(fakeFormat)} (public)</div>`
      );

      const withFormatPrivate = {
        ...withFormatNoTuition,
        school_tuition_s: 'yes'
      };
      assert.include(
        compileHTML(1, withFormatPrivate),
        `<div class="entry-detail"><strong>Format: </strong>${i18n(
          fakeCategoryFormat
        )} - ${i18n(fakeFormat)} (private)</div>`
      );
    });

    it('optionally includes a line for school level', () => {
      const withoutLevel = {
        ...SAMPLE_LOCATION,
        school_level_ss: null
      };
      assert.notInclude(compileHTML(1, withoutLevel), 'Level(s)');

      const withLevel = {
        ...withoutLevel,
        school_level_ss: ['elementary', 'middle_school', 'high_school']
      };
      assert.include(
        compileHTML(1, withLevel),
        `<strong>Level(s): </strong>Elementary, Middle school, High school</div>`
      );
    });

    it('optionally includes a line for class languages', () => {
      const withoutLanguages = {
        ...SAMPLE_LOCATION,
        class_languages_all_ss: null
      };
      assert.notInclude(compileHTML(1, withoutLanguages), 'Language(s)');

      const withLanguages = {
        ...withoutLanguages,
        class_languages_all_ss: ['Ruby', 'JavaScript']
      };
      assert.include(
        compileHTML(1, withLanguages),
        `<div class="entry-detail"><strong>Language(s): </strong>Ruby, JavaScript</div>`
      );
    });

    it('class languages guard against JavaScript injection', () => {
      const input = {
        ...SAMPLE_LOCATION,
        class_languages_all_ss: [
          `<a onmouseover="alert('gotcha')">Classic ASP</a>`
        ]
      };
      assert.include(
        compileHTML(1, input),
        `&lt;a onmouseover="alert('gotcha')"&gt;Classic ASP&lt;/a&gt;`
      );
    });
  });

  describe('compileDetails()', () => {
    // The compileDetails() function gets called as part of the compileHTML()
    // function, but instead of changing the return value of compileHTML its
    // result gets pushed into the DOM as part of div#location-details, so it's
    // ready to display as part of a pop-up.
    // These tests stub that DOM element and check its contents.

    let locationDetailsDiv;

    beforeEach(() => {
      locationDetailsDiv = document.createElement('div');
      locationDetailsDiv.id = 'location-details';
      document.body.appendChild(locationDetailsDiv);
    });

    afterEach(() => {
      document.body.removeChild(locationDetailsDiv);
    });

    it('end-to-end coverage', () => {
      compileHTML(1, SAMPLE_LOCATION);
      assert.equal(
        locationDetailsDiv.innerHTML,
        `<div id="location-details-1">` +
          `<h2 style="margin-top: 0px; margin-bottom: 0.5em; padding-top: 0px;">Code on the Road</h2>` +
          `<div>Example Building 8th floor\nSeattle, WA 98109\nUnited States</div>` +
          `<div><strong>Format: </strong>Out of school - Other out of school (private)</div>` +
          `<div><strong>Level(s): </strong>High school, College</div>` +
          `<div><strong>Language(s): </strong>C#, Python</div>` +
          `<div><strong>Website: </strong><a href="http://example.com/event" target="_blank">http://example.com/event</a></div>` +
          `<p style="margin-top: 1em;">Code on the Road is an evening course designed to teach programming to people who like coffee shops.</p>` +
          `</div>`
      );
    });

    it('school name guards against JavaScript injection', () => {
      const input = {
        ...SAMPLE_LOCATION,
        school_name_s: `<a onmouseover="alert('gotcha')">Fake Name</a>`
      };
      compileHTML(1, input);
      assert.include(
        locationDetailsDiv.innerHTML,
        `&lt;a onmouseover="alert('gotcha')"&gt;Fake Name&lt;/a&gt;`
      );
    });

    it('optionally includes a line for school website', () => {
      const withoutWebsite = {
        ...SAMPLE_LOCATION,
        school_website_s: null
      };
      compileHTML(1, withoutWebsite);
      assert.notInclude(locationDetailsDiv.innerHTML, 'Website:');

      const withWebsite = {
        ...withoutWebsite,
        school_website_s: 'https://example.com'
      };
      compileHTML(1, withWebsite);
      assert.include(
        locationDetailsDiv.innerHTML,
        `<div><strong>Website: </strong><a href="https://example.com" target="_blank">https://example.com</a></div>`
      );
    });

    it('will fill in a missing protocol for a school website', () => {
      const withoutWebsite = {
        ...SAMPLE_LOCATION,
        school_website_s: 'example.com'
      };
      compileHTML(1, withoutWebsite);

      assert.include(
        locationDetailsDiv.innerHTML,
        `<div><strong>Website: </strong><a href="http://example.com" target="_blank">http://example.com</a></div>`
      );
    });

    it('school website guards against quote injection', () => {
      const input = {
        ...SAMPLE_LOCATION,
        school_website_s: `https://example.com" onmouseover="alert('gotcha')`
      };
      compileHTML(1, input);
      assert.include(
        locationDetailsDiv.innerHTML,
        `https://example.com\" onmouseover=\"alert('gotcha')`
      );
    });

    it('school website guards against javascript href', () => {
      const input = {
        ...SAMPLE_LOCATION,
        school_website_s: `javascript:alert('gotcha')`
      };
      compileHTML(1, input);
      assert.notInclude(
        locationDetailsDiv.innerHTML,
        `javascript:alert('gotcha')`
      );
    });

    it('optionally includes a line for class description', () => {
      const withoutWebsite = {
        ...SAMPLE_LOCATION,
        class_description_s: null
      };
      compileHTML(1, withoutWebsite);
      assert.notInclude(
        locationDetailsDiv.innerHTML,
        '<p style="margin-top: 1em;">'
      );

      const withWebsite = {
        ...withoutWebsite,
        class_description_s: 'Fake class description'
      };
      compileHTML(1, withWebsite);
      assert.include(
        locationDetailsDiv.innerHTML,
        `<p style="margin-top: 1em;">Fake class description</p>`
      );
    });

    it('class description guards against JavaScript injection', () => {
      const input = {
        ...SAMPLE_LOCATION,
        class_description_s: `<a onmouseover="alert('gotcha')">Fake Description</a>`
      };
      compileHTML(1, input);
      assert.include(
        locationDetailsDiv.innerHTML,
        `&lt;a onmouseover="alert('gotcha')"&gt;Fake Description&lt;/a&gt;`
      );
    });
  });
});

const SAMPLE_LOCATION = {
  location_p: '44.6409,-124.348',
  school_name_s: 'Code on the Road',
  school_address_s:
    'Example Building 8th floor\nSeattle, WA 98109\nUnited States',
  class_format_s: 'out_of_school_other',
  school_tuition_s: 'yes',
  school_level_ss: ['high_school', 'college'],
  school_website_s: 'http://example.com/event',
  class_description_s:
    'Code on the Road is an evening course designed to teach programming to people who like coffee shops.',
  class_format_category_s: 'out_of_school',
  class_format_subcategory_s: 'other',
  class_languages_all_ss: ['C#', 'Python'],
  school_name_sort_s: 'code by the needle',
  distance: 3.7068423199924205,
  id: 2165377
};

const SAMPLE_RESPONSE = {
  facet_counts: {facet_fields: {}},
  response: {
    docs: [
      {
        location_p: '49.9025854,-129.3042705',
        school_name_s: 'Virtruvian Elementary',
        school_address_s: '2020 Example Way, Mukilteo, WA, United States',
        class_format_s: 'out_of_school_afterschool_program',
        school_tuition_s: 'yes',
        school_level_ss: ['preschool', 'elementary'],
        school_website_s: 'http://example.org/tech-club.html',
        class_description_s:
          'Tech Club teaches coding, robotics, computing and general technology topics to grades 1-5.',
        class_format_category_s: 'out_of_school',
        class_format_subcategory_s: 'afterschool_program',
        class_languages_all_ss: [
          'Code.org Code Studio',
          'HTML',
          'JavaScript',
          'Ruby'
        ],
        school_name_sort_s: 'virtruvian elementary',
        distance: 32.789735611616116,
        id: 4994975
      },
      SAMPLE_LOCATION,
      {
        location_p: '107.16035650000001, 125.5214185',
        school_name_s: 'Bloom County Library',
        school_address_s: '151 Wildacre Rd SW Lakewood WA 98499',
        class_format_s: 'out_of_school_other',
        school_tuition_s: 'no',
        school_level_ss: ['elementary', 'middle_school', 'high_school'],
        school_website_s: 'https://example.com/library',
        class_description_s:
          'A Library is a environment where young people and technology experts come together to explore technology in a fun, safe and social space.  Please use the contact details on our website to contact us about attending and the languages covered at our Dojo.',
        class_format_category_s: 'out_of_school',
        class_format_subcategory_s: 'other',
        class_languages_all_ss: [
          'Scratch',
          'JavaScript',
          'PHP',
          'Ruby',
          'C++',
          'Arduino'
        ],
        school_name_sort_s: 'bloom county library',
        distance: 51.74041989440649,
        id: 2953353
      }
    ]
  }
};

const EXPECTED_LOCATIONS = [
  {
    lat: '49.9025854',
    lon: '-129.3042705',
    title: 'Virtruvian Elementary',
    html:
      '<h3 class="entry-detail">Virtruvian Elementary</h3><div class="entry-detail">2020 Example Way, Mukilteo, WA, United States</div><div class="entry-detail"><strong>Format: </strong>Out of school - Afterschool program (private)</div><div class="entry-detail"><strong>Level(s): </strong>Preschool, Elementary</div><div class="entry-detail"><strong>Language(s): </strong>Code.org Code Studio, HTML, JavaScript, Ruby</div><div><a id="location-details-trigger-0" class="location-details-trigger" onclick="event.preventDefault();" href="#location-details-0">More information</a></div>',
    zoom: 10
  },
  {
    lat: '44.6409',
    lon: '-124.348',
    title: 'Code on the Road',
    html:
      '<h3 class="entry-detail">Code on the Road</h3><div class="entry-detail">Example Building 8th floor\nSeattle, WA 98109\nUnited States</div><div class="entry-detail"><strong>Format: </strong>Out of school - Other out of school (private)</div><div class="entry-detail"><strong>Level(s): </strong>High school, College</div><div class="entry-detail"><strong>Language(s): </strong>C#, Python</div><div><a id="location-details-trigger-1" class="location-details-trigger" onclick="event.preventDefault();" href="#location-details-1">More information</a></div>',
    zoom: 10
  },
  {
    lat: '107.16035650000001',
    lon: ' 125.5214185',
    title: 'Bloom County Library',
    html:
      '<h3 class="entry-detail">Bloom County Library</h3><div class="entry-detail">151 Wildacre Rd SW Lakewood WA 98499</div><div class="entry-detail"><strong>Format: </strong>Out of school - Other out of school (public)</div><div class="entry-detail"><strong>Level(s): </strong>Elementary, Middle school, High school</div><div class="entry-detail"><strong>Language(s): </strong>Scratch, JavaScript, PHP, Ruby, C++, Arduino</div><div><a id="location-details-trigger-2" class="location-details-trigger" onclick="event.preventDefault();" href="#location-details-2">More information</a></div>',
    zoom: 10
  }
];
