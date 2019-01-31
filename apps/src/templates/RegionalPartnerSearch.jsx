import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import {WorkshopApplicationStates, WorkshopSearchErrors} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import * as color from "../util/color";
import UnsafeRenderedMarkdown from '@cdo/apps/templates/UnsafeRenderedMarkdown';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import queryString from 'query-string';
import $ from 'jquery';

const styles = {
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
  noState: {
    marginTop: 20,
    color: color.dark_red
  },
  noPartner: {
    marginTop: 20
  },
  bold: {
    fontFamily: "'Gotham 5r', sans-serif"
  },
  workshop: {
    marginBottom: 20
  }
};

class RegionalPartnerSearch extends Component {
  static propTypes = {
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    sourcePageId: PropTypes.string
  };

  constructor(props) {
    super(props);

    let showZip = true;
    let zipValue = "";
    let error = false;
    let loading = false;

    const partnerId = queryString.parse(window.location.search).partner;
    const zip = queryString.parse(window.location.search).zip;

    if (partnerId) {
      if (partnerId === "0") {
        showZip = true;
        error = WorkshopSearchErrors.no_partner;
      } else {
        $.ajax({
          url: "/dashboardapi/v1/regional_partners/show/" + partnerId,
          type: "get",
          dataType: "json",
          jsonp: false
        }).done(this.partnerIdSuccess).fail(this.partnerIdFail);

        showZip = false;
        loading = true;
      }
    } else if (zip) {
      this.lookupZip(zip);
      zipValue = zip;
      loading = true;
    }

    this.state = {
      showZip: showZip,
      partnerInfo: undefined,
      zipValue: zipValue,
      error: error,
      loading: loading
    };
  }

  partnerIdSuccess = (response) => {
    if (response.error) {
      this.setState({showZip: true, loading: false});
    } else {
      this.setState({showZip: true, partnerInfo: response, loading: false});
    }
  };

  partnerIdFail = (response) => {
    this.setState({showZip: true, loading: false});
  };

  partnerZipSuccess = (response) => {
    if (response.error) {
      this.setState({error: response.error, loading: false});
    } else {
      this.setState({partnerInfo: response, loading: false});
    }
  };

  partnerZipFail = (response) => {
    this.setState({error: WorkshopSearchErrors.unknown, loading: false});
  };

  handleZipChange = (event) => {
    this.setState({zipValue: event.target.value});
  };

  handleZipSubmit = (event) => {
    this.setState({partnerInfo: undefined, error: false, loading: true});

    this.lookupZip(this.state.zipValue);

    event.preventDefault();
  };

  lookupZip = (zipValue) => {
    $.ajax({
      url: "/dashboardapi/v1/regional_partners/find?zip_code=" + zipValue,
      type: "get",
      dataType: "json",
      jsonp: false,
      data: {
        source_page_id: this.props.sourcePageId
      }
    }).done(this.partnerZipSuccess).fail(this.partnerZipFail);
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

    return (
      <div>
        {this.state.showZip && (
          <form onSubmit={this.handleZipSubmit}>
            <label style={styles.schoolZipLabel}>School ZIP Code:</label>
            <input type="text" value={this.state.zipValue} onChange={this.handleZipChange} style={styles.zipInput}/>
            <div style={styles.zipSubmit}>
              <input type="submit" value="Submit" />
            </div>
          </form>
        )}

        {/* Special message for NYC DOE teachers. */}
        {partnerInfo && partnerInfo.name === "Mouse" && (
          <div>
            <h3 style={styles.bold}>NYC Department of Education teachers:</h3>
            We will share a more specific option for NYC DOE teachers in February. The details are still being finalized. If you're a NYC DOE teacher, please complete
            {' '}
            <a href="https://goo.gl/forms/MEz3KmikwgPvIk332" target="_blank">this very short form</a>
            {' '}
            and we'll alert you when details are available.
            <h3 style={styles.bold}>For all other teachers:</h3>
          </div>
        )}

        {(this.state.error === WorkshopSearchErrors.no_partner || partnerInfo) && (
          <h3>Code.org Regional Partner for your region:</h3>
        )}

        {(this.state.error === WorkshopSearchErrors.no_state || this.state.error === WorkshopSearchErrors.unknown) && (
          <div>
            <br/>
            <div>We are unable to find this ZIP code.  You can still apply directly:</div>
            <a href={studio("/pd/application/teacher")}>
              <button>
                Start application
              </button>
            </a>
          </div>
        )}

        {this.state.loading && (
          <i className="fa fa-spinner fa-spin" style={styles.spinner}/>
        )}

        {this.state.error === WorkshopSearchErrors.no_partner && (
          <div style={styles.noPartner}>
            <p>We do not have a Regional Partner in your area. However, we have a number of partners in nearby states or regions who may have space available in their program. If you are willing to travel, please fill out the application. We'll let you know if we can find you a nearby spot in the program!</p>
            <p>If we find a spot, we'll let you know the workshop dates and program fees (if applicable) so you can decide at that point if it is something you or your school can cover.</p>
            <p>
              <span style={styles.bold}>Arkansas Teachers: </span>
              Code.org does not have a Regional Partner in Arkansas, and we are unable to offer you a space in this program this year.  There are many great opportunities for
              {' '}
              <span style={styles.bold}>state-provided professional development </span>
              for computer science in Arkansas in
              {' '}
              <a href="https://docs.google.com/document/d/1OeLNx97wiLon69e8lp45M6ox0BuYLCOSZedzrtMB8_k/edit" target="_blank">this document</a>
              .
            </p>
            <p>
              All of our curriculum, tools, and courses are also available for your school at no cost.
              Or,
              {' '}
              <a href="/educate/curriculum/3rd-party">contact one of these computer science providers</a>
              {' '}
              for other Professional Development options in your area.</p>
            <a href={studio("/pd/application/teacher")}>
              <button>
                Start application
              </button>
            </a>
          </div>
        )}

        {partnerInfo && (
          <div>
            <div style={styles.bold}>{partnerInfo.name}</div>
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

            {(workshopCollections[0].workshops.length > 0 || workshopCollections[1].workshops.length > 0) && (
              <div>In addition to attending a five-day summer workshop, the professional learning program includes up to 4 required one-day, in-person academic year workshops during the 2019-20 school year.</div>
            )}

            <div className="professional_learning_information" id={`id-${partnerInfo.id}`}>
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
            </div>

            {appState === WorkshopApplicationStates.now_closed && (
              <div>Applications are now closed.</div>
            )}

            {appState === WorkshopApplicationStates.currently_open && !partnerInfo.link_to_partner_application && (
              <a className="professional_learning_link" id={`id-${partnerInfo.id}`} href={studio("/pd/application/teacher")}>
                <button>Start application</button>
              </a>
            )}

            {appState === WorkshopApplicationStates.currently_open && partnerInfo.link_to_partner_application && (
              <a className="professional_learning_link" id={`id-${partnerInfo.id}`} href={partnerInfo.link_to_partner_application} target="_blank">
                <button>Apply on partner's site</button>
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
                  Notify me when I can apply
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
