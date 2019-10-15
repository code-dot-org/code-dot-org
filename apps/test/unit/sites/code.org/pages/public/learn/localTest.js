import {assert} from 'chai';
import {getLocations} from '@cdo/apps/sites/code.org/pages/public/learn/local';

describe('/learn/local', () => {
  describe('getLocations()', () => {
    it("doesn't throw any errors", () => {
      const result = getLocations(SAMPLE_RESPONSE);
      assert.deepEqual(result, [
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
      ]);
    });
  });
});

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
      {
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
      },
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
