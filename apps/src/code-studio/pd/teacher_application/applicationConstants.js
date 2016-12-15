import _ from 'lodash';

const group2OrGroup1CsdWorkshops = {
  'June 18 - 23, 2017: Houston': ['AL', 'FL', 'GA', 'IN', 'IA', 'KY', 'OH', 'OK', 'SC', 'TN', 'TX'],
  'July 16 - 21, 2017: Phoenix': ['AR', 'AZ', 'CA', 'CO', 'ID', 'MT', 'NV', 'UT', 'WA'],
  'July 30 - August 4, 2017: Philadelphia': ['IL', 'ME', 'MD', 'MI', 'NJ', 'NY', 'NC', 'PA', 'WI', 'VA']
};

const group1CspWorkshops = {
  'A+ College Ready': '',
  'Grand Canyon University & Science Foundation Arizona': '',
  'Riverside County Office of Education': 'June 19 - 23, 2017',
  '9 Dots Community Learning Center': '',
  'Alameda County Office of Education': '',
  'Contra Costa County Office of Education': '',
  'Broward County Public Schools': '',
  'Florida State College Jacksonville': '',
  'Orlando Science Center': '',
  'Georgia Tech Center for Education Integrating Science, Mathematics, and Computing': '',
  'Idaho Digital Learning Academy': 'June 19 - 23, 2017',
  'Lumity': '',
  'Nextech': 'July 18 - 22, 2017',
  'The Council of Educational Administrative and Supervisory Organizations of Maryland (CEASOM)': 'August 7 - 11, 2017',
  'Southern Nevada Regional Professional Development Program': '',
  'Code/Interactive': 'July 10 - 14, 2017',
  'The Friday Institute': 'July 10 - 14, 2017',
  'Battelle Education': '',
  'Rice University': 'June 26 - 30, 2017',
  'Utah STEM Action Center and Utah Board of Education': '',
  'CodeVA': 'July 17 - 21, 2017',
  'Puget Sound Educational Service District': 'July 10 - 14, 2017',
  'NorthEast Washington Educational Service District 101': 'July 10 - 14, 2017'
};

export function getWorkshopForState(regionalPartnerGroup, regionalPartnerName, selectedCourse, state ) {
  let workshopName = '2017 Workshop TBD';

  if (regionalPartnerGroup === 2 || (regionalPartnerGroup === 1 && selectedCourse === 'csd')) {
    _.forEach(group2OrGroup1CsdWorkshops, (value, key) => {
      if (value.includes(state)) {
        workshopName = key;
      }
    });
  }

  if (regionalPartnerGroup === 1 && selectedCourse === 'csp' && group1CspWorkshops[regionalPartnerName]) {
    workshopName = `${regionalPartnerName}: ${group1CspWorkshops[regionalPartnerName]}`;
  }

  return workshopName;
}

export {
  group2OrGroup1CsdWorkshops,
  group1CspWorkshops
};
