import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';

class RegionalPartnerSearch extends Component {
  static propTypes = {
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    states: PropTypes.arrayOf(PropTypes.array)
  };

  state = {
    partnerInfo: undefined,
    zip: "",
    allowZip: false
  };

  workshopSuccess = (response) => {
    console.log("success", response);
    this.setState({partnerInfo: response });
  };

  workshopFail = (response) => {
    console.log("fail", response);
    this.setState({allowZip: true});
  };

  handleStateChange = (e) => {
    this.setState({
      zip: "",
      allowZip: false,
      partnerInfo: undefined
    });

    $.ajax({
      url: "/dashboardapi/v1/pd/regional_partners/find?state=" + e.target.value,
      type: "get",
      dataType: "json"
    }).done(this.workshopSuccess).fail(this.workshopFail);
  };

  handleZipChange(event) {
    this.setState({zipValue: event.target.value});
  }

  handleZipSubmit = (event) => {
    this.setState({partnerInfo: undefined});

    $.ajax({
      url: "/dashboardapi/v1/pd/regional_partners/find?zip_code=" + this.state.zipValue,
      type: "get",
      dataType: "json"
    }).done(this.workshopSuccess).fail(this.workshopFail);

    event.preventDefault();
  };

  render() {
    const partnerInfo = this.state.partnerInfo;

    let workshopCollections = [
      {
        heading: "CS Discoveries Workshops",
        workshops: partnerInfo && partnerInfo.summer_workshops.filter(workshop => workshop.course === 'CS Discoveries')
      },
      {
        heading: "CS Principles Workshops",
        workshops: partnerInfo && partnerInfo.summer_workshops.filter(workshop => workshop.course === 'CS Principles')
      }
    ];

    const appsOpenNow = partnerInfo && partnerInfo.apps_dates.open_now;
    const appsOpenDate = !appsOpenNow && partnerInfo && partnerInfo.apps_dates.earliest_open_date;
    const appsClosedNow = partnerInfo && partnerInfo.apps_dates.closed_now;

    const applicationLink = (partnerInfo && partnerInfo.link_to_partner_application) ||
      "https://studio.code.org/pd/application/teacher";

    return (
      <div>
        School State:
        <select onChange={this.handleStateChange} style={{width: '150px'}}>
          {this.props.states.map(item => {
            return <option key={item[0]} value={item[0]}>{item[1]}</option>;
          })}
        </select>

        {this.state.allowZip && (
          <form onSubmit={e => this.handleZipSubmit(e)}>
            <label>
              School Zip Code:
              <input type="text" value={this.state.zipValue} onChange={e => this.handleZipChange(e)} />
            </label>
            <div>
              <input type="submit" value="Submit" />
            </div>
          </form>
        )}

        {partnerInfo && (
          <div>
            <h3>Regional Partner hosting the Professional Development Program in this region:</h3>
            <div>{partnerInfo.name}</div>
            <div>{partnerInfo.contact.name}</div>
            <div>{partnerInfo.contact.email}</div>

            <h3>Summer workshop(s):</h3>
            {workshopCollections[0].workshops.length === 0 && workshopCollections[1].workshops.length === 0 && (
              <div>Summer workshop dates and locations are TBD</div>
            )}

            {workshopCollections.map((collection, collectionIndex) => collection.workshops.length > 0 && (
              <div key={collectionIndex}>
                <h4>{collection.heading}</h4>
                {collection.workshops.map((workshop, index) => (
                  <div key={index}>
                    <div>{workshop.workshop_date_range_string}</div>
                    <div>{workshop.location_name}</div>
                    <div>{workshop.location_address}</div>
                  </div>
                ))}
              </div>
            ))}
            <div>In addition to the summer workshop, the professional learning program includes 4 workshops (dates TBD) and online support throughout the the year.</div>

            <h3>Cost and scholarship information:</h3>
            {partnerInfo.csd_cost && (
              <div>CS Discoveries Program Cost: {partnerInfo.csd_cost}</div>
            )}
            {!partnerInfo.csd_cost && (
              <div>The cost of the program for CS Discoveries teachers is TBD.</div>
            )}
            {partnerInfo.csp_cost && (
              <div>CS Principles Program Cost: {partnerInfo.csp_cost}</div>
            )}
            {!partnerInfo.csp_cost && (
              <div>The cost of the program for CS Principles teachers is TBD.</div>
            )}
            {partnerInfo.cost_scholarship_information && (
              <div>{partnerInfo.cost_scholarship_information}</div>
            )}

            {partnerInfo.additional_program_information && (
              <div>
                <h3>Additional Program Information:</h3>
                <div>{partnerInfo.additional_program_information}</div>
              </div>
            )}

            {appsClosedNow && (
              <div>Applications are now closed.</div>
            )}

            {!appsClosedNow && appsOpenNow && (
              <a href={applicationLink}>
                <button>Start application</button>
              </a>
            )}

            {!appsClosedNow && !appsOpenNow && appsOpenDate && (
              <div>Applications open {appsOpenDate}</div>
            )}

            {!appsClosedNow && !appsOpenNow && !appsOpenDate && (
              <div>Applications open January 15, 2019</div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
}))(RegionalPartnerSearch);
