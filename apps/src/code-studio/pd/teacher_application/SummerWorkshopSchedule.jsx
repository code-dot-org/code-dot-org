import React from 'react';
import _ from 'lodash';

const group2OrGroup1CsdWorkshops = {
  'June 18 - 24, 2017: Houston': ['AL', 'FL', 'GA', 'IN', 'IA', 'KY', 'OH', 'OK', 'SC', 'TN', 'TX'],
  'July 16 - 21, 2017: Phoenix': ['AR', 'AZ', 'CA', 'CO', 'ID', 'MT', 'NV', 'UT', 'WA'],
  'July 30 - August 4, 2017: Philadelphia': ['IL', 'ME', 'MD', 'MI', 'NJ', 'NY', 'NC', 'PA', 'WI', 'VA']
};

const group1CspWorkshops = {
  'AL': [{region: 'Alabama', workshopDates: ''}],
  'AZ': [{region: 'Arizona (Phoenix)', workshopDates: ''}],
  'CA': [
    {region: 'California (Inland Empire)', workshopDates: 'June 19 - 23, 2017'},
    {region: 'California (Los Angeles/Orange County)', workshopDates: ''},
    {region: 'California (Oakland)', workshopDates: ''}
  ],
  'FL': [
    {region: 'Florida (Broward)', workshopDates: ''},
    {region: 'Florida (Miami)', workshopDates: ''},
    {region: 'Florida (Northeast)', workshopDates: ''},
    {region: 'Florida (Orlando)', workshopDates: ''}
  ],
  'GA': [{region: 'Georgia', workshopDates: ''}],
  'ID': [{region: 'Idaho', workshopDates: 'June 19 - 23, 2017'}],
  'IL': [{region: 'Illinois (Chicago)', workshopDates: ''}],
  'IN': [{region: 'Indiana', workshopDates: ''}],
  'MD': [
    {region: 'Maryland (Northern)', workshopDates: 'August 7 - 11, 2017'},
    {region: 'Maryland (Southern)', workshopDates: 'August 7 - 11, 2017'}
  ],
  'NV': [{region: 'Nevada', workshopDates: ''}],
  'NY': [{region: 'New York', workshopDates: 'July 10 - 14, 2017'}],
  'NC': [{region: 'North Carolina (Durham)', workshopDates: 'July 10 - 14, 2017'}],
  'OH': [{region: 'Ohio', workshopDates: ''}],
  'TX': [{region: 'Texas (Houston)', workshopDates: 'June 26 - 30, 2017'}],
  'UT': [{region: 'Utah', workshopDates: ''}],
  'VA': [{region: 'Virginia (Richmond)', workshopDates: 'July 17 - 21, 2017'}],
  'WA': [
    {region: 'Washington (Puget Sound)', workshopDates: 'July 10 - 14, 2017'},
    {region: 'Washington (Spokane)', workshopDates: 'July 10 - 14, 2017'}
  ]
};

const SummerWorkshopSchedule = React.createClass({
  propTypes: {
    regionalPartnerGroup: React.PropTypes.number,
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
                    {`${workshop['region']}: ${workshop['workshopDates'] || 'Summer 2017 (exact date to be determined)'}`}
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
