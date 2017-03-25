import _ from 'lodash';

const groupTwoOrGroupOneCsdWorkshops = {
  'June 18 - 23, 2017: Houston': ['AL', 'FL', 'GA', 'IN', 'IA', 'KY', 'OH', 'OK', 'SC', 'TN', 'TX'],
  'July 16 - 21, 2017: Phoenix': ['AR', 'AZ', 'CA', 'CO', 'ID', 'MT', 'NV', 'UT', 'WA'],
  'July 30 - August 4, 2017: Philadelphia': ['IL', 'ME', 'MD', 'MI', 'NJ', 'NY', 'NC', 'PA', 'WI', 'VA']
};

const group1CspWorkshops = {
  'A+ College Ready': 'June 26 - 30, 2017',
  'Grand Canyon University & Science Foundation Arizona': 'July 10 - 14, 2017',
  'Riverside County Office of Education': 'June 19 - 23, 2017',
  '9 Dots Community Learning Center': 'June 19 - 23, 2017',
  'Alameda County Office of Education': 'July 31 - August 4, 2017',
  'Contra Costa County Office of Education': '',
  'Broward County Public Schools': 'June 19 - 23, 2017',
  'Florida State College Jacksonville': 'June 12 - 16, 2017',
  'Orlando Science Center': 'June 5 - 9, 2017',
  'Georgia Tech Center for Education Integrating Science, Mathematics, and Computing': 'July 17 - 22, 2017',
  'Idaho Digital Learning Academy': 'June 19 - 23, 2017',
  'Lumity': 'July 24 - 28, 2017',
  'Nextech': 'July 17 - 21, 2017',
  'The Council of Educational Administrative and Supervisory Organizations of Maryland (CEASOM)': 'August 7 - 11, 2017',
  'Southern Nevada Regional Professional Development Program': 'June 12 - 16, 2017',
  'Code/Interactive': 'August 14 - 18, 2017',
  'The Friday Institute': 'July 10 - 14, 2017',
  'Battelle Education': 'July 24 - 28, 2017',
  'Rice University': 'June 26 - 30, 2017',
  'Utah STEM Action Center and Utah Board of Education': 'June 26 - 30, 2017',
  'CodeVA': 'July 17 - 21, 2017',
  'Puget Sound Educational Service District': 'July 10 - 14, 2017',
  'NorthEast Washington Educational Service District 101': 'August 14 - 18, 2017'
};

const workshopNamePlaceholder = '2017 Workshop (exact date to be determined)';

export function getWorkshopForState(regionalPartnerGroup, regionalPartnerName, selectedCourse, state ) {
  let workshopName = `${workshopNamePlaceholder}${regionalPartnerName ? ` by ${regionalPartnerName}` : ''}`;

  if (regionalPartnerGroup === 2 || (regionalPartnerGroup === 1 && selectedCourse === 'csd')) {
    _.forEach(groupTwoOrGroupOneCsdWorkshops, (value, key) => {
      if (value.includes(state)) {
        workshopName = `${key} (travel expenses paid)`;
      }
    });
  }

  if (regionalPartnerGroup === 1 && selectedCourse === 'csp' && group1CspWorkshops[regionalPartnerName]) {
    workshopName = `${regionalPartnerName}: ${group1CspWorkshops[regionalPartnerName]}`;
  }

  return workshopName;
}

export {
  groupTwoOrGroupOneCsdWorkshops,
  group1CspWorkshops,
  workshopNamePlaceholder
};
