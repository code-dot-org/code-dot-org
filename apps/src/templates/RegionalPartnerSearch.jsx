import $ from 'jquery';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {RegionalPartnerMiniContactPopupLink} from '@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact';
import fontConstants from '@cdo/apps/fontConstants';
import {
  WorkshopApplicationStates,
  WorkshopSearchErrors,
  ActiveCourseWorkshops,
} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import Notification from '@cdo/apps/sharedComponents/Notification';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {currentLocation} from '@cdo/apps/utils';

import {
  BodyThreeText,
  Heading2,
  Heading3,
} from '../componentLibrary/typography';
import * as color from '../util/color';

const WorkshopCard = props => {
  return (
    <div
      style={{
        ...styles.workshopCollection,
        ...props.style,
      }}
    >
      {props.content}
    </div>
  );
};
WorkshopCard.propTypes = {
  style: PropTypes.object,
  content: PropTypes.element,
};

class RegionalPartnerSearch extends Component {
  static propTypes = {
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    sourcePageId: PropTypes.string,
  };

  constructor(props) {
    super(props);

    let showZip = true;
    let zipValue = '';
    let error = false;
    let loading = false;

    const partnerId = queryString.parse(currentLocation().search).partner;
    const zip = queryString.parse(currentLocation().search).zip;
    const nominated = queryString.parse(currentLocation().search).nominated;

    if (partnerId) {
      if (partnerId === '0') {
        showZip = true;
        error = WorkshopSearchErrors.no_partner;
      } else {
        $.ajax({
          url: '/dashboardapi/v1/regional_partners/show/' + partnerId,
          type: 'get',
          dataType: 'json',
          jsonp: false,
        })
          .done(this.partnerIdSuccess)
          .fail(this.partnerIdFail);

        showZip = false;
        loading = true;
      }
    } else if (zip) {
      this.lookupZip(zip);
      zipValue = zip;
      loading = true;
    }

    // Get the flag that indicates whether applications are closed site-wide
    // (versus the regional partner's own application close date)
    $.ajax({
      method: 'GET',
      url: `/dashboardapi/v1/pd/application/applications_closed`,
      dataType: 'json',
    }).done(data => {
      this.setState({
        applicationsClosed: data,
      });
    });

    this.state = {
      showZip: showZip,
      partnerInfo: undefined,
      zipValue: zipValue,
      error: error,
      loading: loading,
      nominated: nominated,
      applicationsClosed: undefined,
    };
  }

  partnerIdSuccess = response => {
    if (response.error) {
      this.setState({showZip: true, loading: false});
    } else {
      this.setState({showZip: true, partnerInfo: response, loading: false});
    }
  };

  partnerIdFail = response => {
    this.setState({showZip: true, loading: false});
  };

  partnerZipSuccess = response => {
    if (response.error) {
      this.setState({error: response.error, loading: false});
    } else {
      this.setState({partnerInfo: response, loading: false});
    }
  };

  partnerZipFail = response => {
    this.setState({error: WorkshopSearchErrors.unknown, loading: false});
  };

  handleZipChange = event => {
    this.setState({zipValue: event.target.value});
  };

  handleZipSubmit = event => {
    this.setState({partnerInfo: undefined, error: false, loading: true});

    this.lookupZip(this.state.zipValue);

    event.preventDefault();
  };

  lookupZip = zipValue => {
    $.ajax({
      url: '/dashboardapi/v1/regional_partners/find?zip_code=' + zipValue,
      type: 'get',
      dataType: 'json',
      jsonp: false,
      data: {
        source_page_id: this.props.sourcePageId,
      },
    })
      .done(this.partnerZipSuccess)
      .fail(this.partnerZipFail);
  };

  shouldDisplayApplicationLink() {
    return this.state.applicationsClosed === false;
  }

  render() {
    const partnerInfo = this.state.partnerInfo;

    let courseWorkshops = [];
    Object.keys(ActiveCourseWorkshops).forEach(courseKey => {
      courseWorkshops.push({
        key: courseKey,
        name: ActiveCourseWorkshops[courseKey],
        heading: `${ActiveCourseWorkshops[courseKey]} Workshops`,
        isOffered: partnerInfo?.pl_programs_offered?.includes(courseKey),
        summerWorkshops: partnerInfo?.summer_workshops?.filter(
          workshop => workshop.course === ActiveCourseWorkshops[courseKey]
        ),
      });
    });

    const workshopCollectionStyle =
      this.props.responsiveSize === 'lg' ? styles.halfWidth : styles.fullWidth;
    const appState = partnerInfo && partnerInfo.application_state.state;
    const appsOpenDate =
      partnerInfo && partnerInfo.application_state.earliest_open_date;
    const appsPriorityDeadlineDate =
      partnerInfo &&
      partnerInfo.application_state.upcoming_priority_deadline_date;

    return (
      <div>
        {this.state.nominated && (
          <div>
            <Heading3>
              Congratulations on your nomination for a scholarship!
            </Heading3>
            <BodyThreeText>
              You’ve been nominated as a talented, passionate educator who can
              bring computer science to the students at your school. Your local
              partner will have your nomination as they consider your
              application for the regional scholarships or discounts they have
              available. Grant funding is limited, so apply soon if you are
              interested.
            </BodyThreeText>
          </div>
        )}
        <div>
          <Heading2>Find your local workshop and apply</Heading2>
          <BodyThreeText>
            Look up details of the Professional Learning Program in your region
            by submitting your zip code below.
          </BodyThreeText>
        </div>
        {this.state.showZip && (
          <form onSubmit={this.handleZipSubmit}>
            <label style={styles.schoolZipLabel} htmlFor="zipCode">
              School ZIP Code:
            </label>
            <input
              id="zipCode"
              type="text"
              value={this.state.zipValue}
              onChange={this.handleZipChange}
              style={styles.zipInput}
            />
            <div style={styles.zipSubmit}>
              <input type="submit" value="Submit" />
            </div>
          </form>
        )}

        {(this.state.error === WorkshopSearchErrors.no_state ||
          this.state.error === WorkshopSearchErrors.unknown) && (
          <div>
            <br />
            <div>
              We are unable to find this ZIP code.
              {this.shouldDisplayApplicationLink() &&
                ' You can still apply directly:'}
            </div>
            {this.shouldDisplayApplicationLink() && (
              <StartApplicationButton
                buttonOnly={true}
                nominated={this.state.nominated}
                priorityDeadlineDate={appsPriorityDeadlineDate}
              />
            )}
          </div>
        )}

        {this.state.loading && (
          <i className="fa fa-spinner fa-spin" style={styles.spinner} />
        )}

        {this.state.error === WorkshopSearchErrors.no_partner && (
          <div>
            <hr style={styles.hr} />
            <div style={styles.noPartner}>
              <Heading3>Code.org Regional Partner for your region:</Heading3>
              <p>
                We do not have a Regional Partner in your area. However, we have
                a number of partners in nearby states or regions who may have
                space available in their program.
                {this.shouldDisplayApplicationLink() &&
                  ` If you are willing to travel, please fill out the application. `}
                We'll let you know if we can find you a nearby spot in the
                program!
              </p>
              <p>
                If we find a spot, we'll let you know the workshop dates and
                program fees (if applicable) so you can decide at that point if
                it is something you or your school can cover.
              </p>
              <p>
                <span style={styles.bold}>Arkansas Teachers: </span>
                Code.org does not have a Regional Partner in Arkansas, and we
                are unable to offer you a space in this program this year. There
                are many great opportunities for{' '}
                <span style={styles.bold}>
                  state-provided professional development{' '}
                </span>
                for computer science in Arkansas in{' '}
                <a
                  href="https://docs.google.com/document/d/1OeLNx97wiLon69e8lp45M6ox0BuYLCOSZedzrtMB8_k/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  this document
                </a>
                .
              </p>
              <p>
                All of our curriculum, tools, and courses are also available for
                your school at no cost.
              </p>
              {this.shouldDisplayApplicationLink() && (
                <StartApplicationButton
                  buttonOnly={true}
                  nominated={this.state.nominated}
                  priorityDeadlineDate={appsPriorityDeadlineDate}
                />
              )}
            </div>
          </div>
        )}

        {partnerInfo && (
          <div>
            <hr style={styles.hr} />

            <div style={styles.action}>
              {this.shouldDisplayApplicationLink() &&
                appState === WorkshopApplicationStates.currently_open &&
                !partnerInfo.link_to_partner_application && (
                  <StartApplicationButton
                    className="professional_learning_link"
                    nominated={this.state.nominated}
                    priorityDeadlineDate={appsPriorityDeadlineDate}
                  />
                )}

              {this.shouldDisplayApplicationLink() &&
                appState === WorkshopApplicationStates.currently_open &&
                partnerInfo.link_to_partner_application && (
                  <StartApplicationButton
                    className="professional_learning_link"
                    link={partnerInfo.link_to_partner_application}
                    partnerSite={true}
                    nominated={this.state.nominated}
                    priorityDeadlineDate={appsPriorityDeadlineDate}
                  />
                )}
            </div>

            {appState !== WorkshopApplicationStates.now_closed &&
              partnerInfo.pl_programs_offered?.length > 0 && (
                <div>
                  <Heading3>
                    Workshop information (hosted by {partnerInfo.name}):
                  </Heading3>
                  {courseWorkshops.map((currCourse, currCourseIndex) => {
                    if (currCourse.summerWorkshops.length === 0) {
                      // If no current workshops for the given course
                      if (currCourse.isOffered) {
                        // If a program is offered but a workshop hasn't been scheduled yet
                        return (
                          <WorkshopCard
                            key={currCourseIndex}
                            style={workshopCollectionStyle}
                            content={
                              <>
                                <h4>
                                  {currCourse.name} Workshop details are coming
                                  soon!
                                </h4>
                                <div>
                                  The Regional Partner is hard at work locking
                                  down the details of the workshops for this
                                  program. You can still apply and the Regional
                                  Partner will inform you when the workshop
                                  details are available.
                                </div>
                              </>
                            }
                          />
                        );
                      } else {
                        // If a program is not offered
                        return (
                          <WorkshopCard
                            key={currCourseIndex}
                            style={workshopCollectionStyle}
                            content={
                              <>
                                <h4>{currCourse.heading}</h4>
                                <div>
                                  This Regional Partner is not offering{' '}
                                  {currCourse.name} workshops at this time.
                                  Code.org will review your application and
                                  contact you with options for joining a virtual
                                  cohort of {currCourse.name} teachers from
                                  another region.
                                </div>
                              </>
                            }
                          />
                        );
                      }
                    } else if (currCourse.summerWorkshops.length > 0) {
                      // If workshops present for the given course
                      return (
                        <WorkshopCard
                          key={currCourseIndex}
                          style={workshopCollectionStyle}
                          content={
                            <>
                              <h4>{currCourse.heading}</h4>
                              {currCourse.summerWorkshops.map(
                                (workshop, index) => (
                                  <div key={index} style={styles.workshop}>
                                    <div>
                                      {workshop.workshop_date_range_string}
                                    </div>
                                    <div>{workshop.location_name}</div>
                                    <div>{workshop.location_address}</div>
                                  </div>
                                )
                              )}
                            </>
                          }
                        />
                      );
                    }
                  })}
                </div>
              )}

            <div style={styles.clear} />

            <div style={styles.action}>
              {appState === WorkshopApplicationStates.now_closed && (
                <Heading3>Applications are now closed.</Heading3>
              )}

              {appState === WorkshopApplicationStates.opening_at && (
                <Heading3>Applications will open on {appsOpenDate}.</Heading3>
              )}

              {appState === WorkshopApplicationStates.opening_sometime && (
                <Heading3>
                  Program information and the application for this region will
                  be available soon!
                </Heading3>
              )}

              {appState !== WorkshopApplicationStates.currently_open && (
                <RegionalPartnerMiniContactPopupLink
                  zip={this.state.zipValue}
                  notes={'Please notify me when I can apply!'}
                  sourcePageId="regional-partner-search-notify"
                >
                  <button type="button" style={styles.bigButton}>
                    Notify me when I can apply
                  </button>
                </RegionalPartnerMiniContactPopupLink>
              )}
            </div>

            <div
              className="professional_learning_information"
              id={`id-${partnerInfo.id}`}
            >
              {appState !== WorkshopApplicationStates.now_closed &&
                partnerInfo.cost_scholarship_information && (
                  <div>
                    <Heading3>Program information</Heading3>
                    <div style={styles.scholarship}>
                      <SafeMarkdown
                        markdown={partnerInfo.cost_scholarship_information}
                      />
                    </div>
                  </div>
                )}

              {partnerInfo.additional_program_information && (
                <div>
                  <Heading3>More about your Regional Partner</Heading3>
                  <SafeMarkdown
                    markdown={partnerInfo.additional_program_information}
                  />
                </div>
              )}
            </div>

            <div style={styles.partnerContact}>
              <Heading3>Have more questions?</Heading3>
              <div>Your Code.org Regional Partner is here to help:</div>
              <div style={styles.bold}>{partnerInfo.name}</div>
              {partnerInfo.contact_name && (
                <div>{partnerInfo.contact_name}</div>
              )}
              {partnerInfo.contact_email && (
                <div>{partnerInfo.contact_email}</div>
              )}
              <div>
                <br />
                Direct any questions to your Regional Partner by{' '}
                <RegionalPartnerMiniContactPopupLink
                  zip={this.state.zipValue}
                  notes={
                    'Please tell me more about the professional learning program!'
                  }
                  sourcePageId="regional-partner-search-question"
                >
                  <span style={styles.linkLike}>completing this form</span>
                </RegionalPartnerMiniContactPopupLink>
                .
              </div>
            </div>

            {/* These two links duplicate the buttons that appear above. */}
            {this.shouldDisplayApplicationLink() &&
              appState === WorkshopApplicationStates.currently_open &&
              !partnerInfo.link_to_partner_application && (
                <StartApplicationButton
                  className="professional_learning_link"
                  nominated={this.state.nominated}
                  priorityDeadlineDate={appsPriorityDeadlineDate}
                />
              )}

            {this.shouldDisplayApplicationLink() &&
              appState === WorkshopApplicationStates.currently_open &&
              partnerInfo.link_to_partner_application && (
                <StartApplicationButton
                  className="professional_learning_link"
                  link={partnerInfo.link_to_partner_application}
                  partnerSite={true}
                  nominated={this.state.nominated}
                  priorityDeadlineDate={appsPriorityDeadlineDate}
                />
              )}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  schoolZipLabel: {
    display: 'inline-block',
    marginRight: 40,
  },
  zipInput: {
    display: 'inline-block',
    height: 28,
    padding: '1px 2px',
    margin: 0,
  },
  zipSubmit: {
    display: 'inline-block',
    marginTop: 20,
    marginLeft: 10,
  },
  hr: {
    borderColor: color.charcoal,
    marginTop: 50,
    marginBottom: 50,
  },
  spinner: {
    fontSize: 32,
    marginTop: 20,
    marginLeft: 48,
  },
  noState: {
    marginTop: 20,
    color: color.dark_red,
  },
  noPartner: {
    marginTop: 20,
  },
  bold: {
    ...fontConstants['main-font-bold'],
  },
  linkLike: {
    ...fontConstants['main-font-bold'],
    cursor: 'pointer',
    color: color.purple,
  },
  workshopCollection: {
    backgroundColor: color.lightest_purple,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  halfWidth: {
    width: '40%',
    float: 'left',
    marginRight: 20,
  },
  fullWidth: {
    width: '100%',
  },
  workshop: {
    marginBottom: 20,
  },
  action: {
    marginTop: 20,
    marginBottom: 20,
  },
  scholarship: {
    backgroundColor: color.lightest_gray,
    padding: 20,
    borderRadius: 10,
  },
  partnerContact: {
    marginBottom: 20,
  },
  bigButton: {
    padding: '10px 20px 10px 20px',
    height: 'initial',
    backgroundColor: color.brand_secondary_default,
    borderColor: color.brand_secondary_default,
    ...fontConstants['main-font-semi-bold'],
    color: color.neutral_white,
    fontSize: '14px',
  },
  clear: {
    clear: 'both',
  },
};

const StartApplicationButton = ({
  buttonOnly,
  className,
  link,
  partnerSite,
  nominated,
  priorityDeadlineDate,
}) => {
  if (!link) {
    link = studio('/pd/application/teacher');
    if (nominated) {
      link += '?nominated=true';
    }
  }
  const target = partnerSite ? '_blank' : null;
  const buttonText = partnerSite
    ? "Apply on partner's site"
    : 'Start application';

  let notificationHeading, notificationText;
  if (priorityDeadlineDate) {
    notificationHeading = `Priority deadline for your region is ${priorityDeadlineDate}`;
    notificationText = 'Sign up now to reserve your space!';
  } else {
    notificationHeading =
      'We still have spaces in the Professional Learning Program!';
    notificationText = 'It takes just 10-15 minutes to apply.';
  }

  const button = (
    <Button
      color="brandSecondaryDefault"
      text={buttonText}
      href={link}
      target={target}
    />
  );

  if (buttonOnly) {
    return button;
  } else {
    return (
      <div>
        <Notification
          type="information"
          notice={notificationHeading}
          details={notificationText}
          dismissible={false}
          buttonText={buttonText}
          buttonColor={Button.ButtonColor.brandSecondaryDefault}
          buttonLink={link}
          buttonClassName={className}
        />
      </div>
    );
  }
};

StartApplicationButton.propTypes = {
  buttonOnly: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  link: PropTypes.string,
  partnerSite: PropTypes.bool,
  nominated: PropTypes.bool,
  priorityDeadlineDate: PropTypes.string,
};

export const UnconnectedRegionalPartnerSearch = RegionalPartnerSearch;

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
}))(RegionalPartnerSearch);
