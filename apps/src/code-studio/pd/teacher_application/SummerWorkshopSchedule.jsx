import React from 'react';
import _ from 'lodash';

const group2OrGroup1CsdWorkshops = {
  'June 18 - 24, 2017: Houston': ['AL', 'FL', 'GA', 'IN', 'IA', 'KY', 'OH', 'OK', 'SC', 'TN', 'TX'],
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

const SummerWorkshopSchedule = React.createClass({
  propTypes: {
    regionalPartnerGroup: React.PropTypes.number,
    regionalPartnerName: React.PropTypes.string,
    selectedCourse: React.PropTypes.string,
    selectedState: React.PropTypes.string
  },

  renderGroup1CsdOrGroup2AssignedWorkshop() {
    if (this.props.regionalPartnerGroup === 2 ||
      (this.props.regionalPartnerGroup === 1 && this.props.selectedCourse === 'csd')) {
      let assignedSummerWorkshop = `Summer 2017 (exact date to be determined) in ${this.props.selectedState}`;


      _.forEach(group2OrGroup1CsdWorkshops, (value, key) => {
        if (value.includes(this.props.selectedState)) {
          assignedSummerWorkshop = key;
        }
      });

      return (
        <div>
          We strongly encourage participants to attend their assigned summer workshop (based on the region in which
          you teach), so that you can meet the other teachers, facilitators, and Regional Partners with whom you will
          work in 2017-18. Your region's assigned summer workshop is:
          <p style={{fontSize: '18px', fontWeight: 'bold'}}>
            {assignedSummerWorkshop}
          </p>
        </div>
      );
    }
  },

  renderAssignedWorkshopGroup1Csp() {
    if (this.props.regionalPartnerGroup === 1 && this.props.selectedCourse === 'csp') {
      let regionalWorkshops = group1CspWorkshops[this.props.selectedState] || [{region: this.props.selectedState, workshopDates: 'Summer 2017 (exact date to be determined)'}];

      return (
        <div>
          <p>
            We strongly encourage participants to attend their assigned summer workshop (based on the district in which
            you currently teach), so that you can meet the other teachers, facilitators and Regional Partners with whom
            you will work in 2017 - 18. Your regions and summer workshop dates are below.
            {
              regionalWorkshops.map((workshop, i) => {
                return (
                  <li key={i}>
                    {`${this.props.regionalPartnerName}: ${group1CspWorkshops[this.props.regionalPartnerName] || 'Summer 2017 (exact date to be determined)'}`}
                  </li>
                );
              })
            }
          </p>
        </div>
      );
    }
  },

  render() {
    return (
      <div>
        {this.renderGroup1CsdOrGroup2AssignedWorkshop()}
        {this.renderAssignedWorkshopGroup1Csp()}
      </div>
    );
  }
});

export {SummerWorkshopSchedule, group2OrGroup1CsdWorkshops};
