import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import {WorkshopApplicationStates} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import UnsafeRenderedMarkdown from '@cdo/apps/templates/UnsafeRenderedMarkdown';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import $ from 'jquery';

const styles = {
  form: {
    marginTop: 20
  },
  schoolZipLabel: {
    marginRight: 40
  },
  zipInput: {
    height: 28
  },
  zipSubmit: {
    marginTop: 20,
    display: "inline-block",
    marginLeft: 10
  },
  spinner: {
    fontSize: 32,
    marginTop: 20,
    marginLeft: 48
  },
  noPartner: {
    marginTop: 20
  },
  workshop: {
    marginBottom: 20
  }
};

class RegionalPartnerSearch extends Component {
  static propTypes = {
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired
  };

  state = {
    partnerInfo: undefined,
    stateValue: "",
    zipValue: "",
    noPartner: false,
    loading: false
  };

  workshopSuccess = (response) => {
    this.setState({partnerInfo: response, loading: false});
  };

  workshopZipFail = (response) => {
    this.setState({noPartner: true, loading: false});
  };

  handleZipChange = (event) => {
    this.setState({zipValue: event.target.value});
  };

  handleZipSubmit = (event) => {
    this.setState({partnerInfo: undefined, noPartner: false, loading: true});

    $.ajax({
      url: "/dashboardapi/v1/regional_partners/find?zip_code=" + this.state.zipValue,
      type: "get",
      dataType: "json"
    }).done(this.workshopSuccess).fail(this.workshopZipFail);

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

    const appState = partnerInfo && partnerInfo.application_state.state;
    const appsOpenDate = partnerInfo && partnerInfo.application_state.earliest_open_date;

    let applicationLink, applicationLinkTarget;
    if (partnerInfo && partnerInfo.link_to_partner_application) {
      applicationLink = partnerInfo.link_to_partner_application;
      applicationLinkTarget = "_blank";
    } else {
      applicationLink = studio("/pd/application/teacher");
      applicationLinkTarget = null;
    }

    return (
      <div>
        <div>Our Regional Partners offer local workshops throughout the United States. Enter your location to find a workshop near you.</div>

        <form onSubmit={this.handleZipSubmit} style={styles.form}>
          <label style={styles.schoolZipLabel}>School Zip Code:</label>
          <input type="text" value={this.state.zipValue} onChange={this.handleZipChange} style={styles.zipInput}/>
          <div style={styles.zipSubmit}>
            <input type="submit" value="Submit" />
          </div>
        </form>

        {this.state.noPartner || partnerInfo && (
          <h3>Code.org Regional Partner for your region:</h3>
        )}

        {this.state.loading && (
          <i className="fa fa-spinner fa-spin" style={styles.spinner}/>
        )}

        {this.state.noPartner && (
          <div style={styles.noPartner}>
            <p>We do not yet have a Regional Partner in your area. However, we have a number of partners in nearby states or regions who may have space available in their program. If you are willing to travel, please fill out the application. We'll let you know if we can find you a nearby spot in the program!</p>
            <p>If we find a spot, we'll let you know the workshop dates and program fees (if applicable) so you can decide at that point if it is something your school can cover.</p>
            <p>
              All of our curriculum, tools, and courses are also available for your school at no cost.
              Or,
              {' '}
              <a href="/educate/curriculum/3rd-party">contact one of these computer science providers</a>
              {' '}
              for other Professional Development options in your area.</p>
            <p>Applications open January 15, 2019.</p>
          </div>
        )}

        {partnerInfo && (
          <div>
            <div>{partnerInfo.name}</div>
            {partnerInfo.contact_name && (
              <div>{partnerInfo.contact_name}</div>
            )}
            {partnerInfo.contact_email && (
              <div>{partnerInfo.contact_email}</div>
            )}
            {!partnerInfo.contact_email && (
              <div>Direct any questions to your Regional Partner by
                {' '}
                <a href={studio("/pd/regional_partner_contact/new")}>completing this form</a>
                .
              </div>
            )}

            <h3>Workshop information:</h3>
            {workshopCollections[0].workshops.length === 0 && workshopCollections[1].workshops.length === 0 && (
              <div>Workshop date and location information coming soon.</div>
            )}

            {workshopCollections.map((collection, collectionIndex) => collection.workshops.length > 0 && (
              <div key={collectionIndex}>
                <h4>{collection.heading}</h4>
                {collection.workshops.map((workshop, index) => (
                  <div key={index} style={styles.workshop}>
                    <div>{workshop.workshop_date_range_string}</div>
                    <div>{workshop.location_name}</div>
                    <div>{workshop.location_address}</div>
                  </div>
                ))}
              </div>
            ))}

            <div>In addition to attending a five-day summer workshop, the professional learning program includes up to 4 one-day, in-person academic year workshops during the 2019-20 school year. Academic year workshop dates will be finalized and shared by your Regional Partner.</div>

            {partnerInfo.cost_scholarship_information && (
              <div>
                <h3>Cost and scholarship information:</h3>
                <UnsafeRenderedMarkdown markdown={partnerInfo.cost_scholarship_information}/>
              </div>
            )}

            {partnerInfo.additional_program_information && (
              <div>
                <h3>Additional program information:</h3>
                <UnsafeRenderedMarkdown markdown={partnerInfo.additional_program_information}/>
              </div>
            )}

            {appState === WorkshopApplicationStates.now_closed && (
              <div>Applications are now closed.</div>
            )}

            {appState === WorkshopApplicationStates.currently_open && (
              <a href={applicationLink} target={applicationLinkTarget}>
                <button>Start application</button>
              </a>
            )}

            {appState === WorkshopApplicationStates.opening_at && (
              <h3>Applications will open on {appsOpenDate}.</h3>
            )}

            {appState === WorkshopApplicationStates.opening_sometime && (
              <h3>Program information and the application for this region will be available soon!</h3>
            )}

            {appState !== WorkshopApplicationStates.currently_open && (
              <a href={studio("/pd/regional_partner_contact/new")}>
                <button>
                  Tell me when applications open
                </button>
              </a>
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
