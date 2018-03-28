import React, {PropTypes} from 'react';
import $ from 'jquery';
import i18n from '@cdo/locale';
import color from '../../util/color';
import BaseDialog from '../../templates/BaseDialog';
import Button from '../../templates/Button';
import SchoolInfoInputs, {SCHOOL_TYPES_HAVING_NCES_SEARCH} from '../../templates/SchoolInfoInputs';
import firehoseClient from '../util/firehose';

const styles = {
  container: {
    margin: 20,
    color: color.charcoal
  },
  heading: {
    fontSize: 16,
    fontFamily: "'Gotham 5r', sans-serif",
  },
  middle: {
    marginTop: 20,
    marginBottom: 20,
    paddingBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  error: {
    color: color.red,
  },
};

const FIREHOSE_EVENTS = {
  // Interstitial is displayed to the teacher.
  SHOW: 'show',
  // Teacher clicked "Save"
  SUBMIT: 'submit',
  // School information saved successfully
  SAVE_SUCCESS: 'save_success',
  // School information failed to save
  SAVE_FAILURE: 'save_failure',
};

export default class SchoolInfoInterstitial extends React.Component {
  static propTypes = {
    // This component is tightly bound to the HAML view that renders it and
    // populates its props, and similarly to the User update API that
    // it uses to save entered school info.
    scriptData: PropTypes.shape({
      formUrl: PropTypes.string.isRequired,
      authTokenName: PropTypes.string.isRequired,
      authTokenValue: PropTypes.string.isRequired,
      existingSchoolInfo: PropTypes.shape({
        // Note, these names intentionally match the fields on the SchoolInfo
        // model, not their JavaScript-friendly equivalents.  The mapping
        // occurs in the constructor, below, and back when we submit.
        school_id: PropTypes.string,
        country: PropTypes.string,
        school_type: PropTypes.string,
        school_name: PropTypes.string,
        full_address: PropTypes.string,
      }).isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    const {existingSchoolInfo} = this.props.scriptData;

    let initialCountry = existingSchoolInfo.country || '';
    if (initialCountry === 'US') {
      initialCountry = 'United States';
    }

    const initialNcesSchoolId = existingSchoolInfo.school_id ?
      existingSchoolInfo.school_id :
      (
        existingSchoolInfo.country === 'United States'
        &&
        SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(existingSchoolInfo.school_type)
        &&
        (existingSchoolInfo.school_name || existingSchoolInfo.full_address)
      ) ? '-1' : '';

    this.state = {
      country: initialCountry,
      schoolType: existingSchoolInfo.school_type || '',
      schoolName: existingSchoolInfo.school_name || '',
      schoolLocation: existingSchoolInfo.full_address || '',
      ncesSchoolId: initialNcesSchoolId,
      showSchoolInfoUnknownError: false,
    };
  }

  logEvent(eventName, data = {}) {
    firehoseClient.putRecord({
      study: 'school_info_interstitial',
      study_group: 'control',
      event: eventName,
      // Send "has NCES id" as data_int
      data_int: (this.state.ncesSchoolId && this.state.ncesSchoolId !== '-1' ? 1 : 0),
      data_json: JSON.stringify({
        isComplete: SchoolInfoInterstitial.isSchoolInfoComplete(this.state),
        ...data
      }),
    });
  }

  static isSchoolInfoComplete(state) {
    if (!state.country) {
      return false;
    }

    if (state.country !== 'United States') {
      return true;
    }

    if (['homeschool', 'after school', 'organization', 'other'].includes(state.schoolType)) {
      return true;
    }

    if (state.ncesSchoolId && state.ncesSchoolId !== '-1') {
      return true;
    }

    return !!(state.country && state.schoolType && state.schoolName);
  }

  componentDidMount() {
    this.logEvent(FIREHOSE_EVENTS.SHOW);
  }

  buildSchoolData() {
    const {country, schoolType, ncesSchoolId} = this.state;
    // If we have an NCES id, _only_ send that - everything else will be
    // backfilled by records on the server.
    if (ncesSchoolId && ncesSchoolId !== '-1') {
      return {
        "user[school_info_attributes][school_id]": ncesSchoolId,
      };
    }

    // If we don't know enough to pick other metadata, only send these.
    if (!country || !schoolType) {
      return {
        "user[school_info_attributes][country]": country,
        "user[school_info_attributes][school_type]": schoolType,
      };
    }

    // If an NCES type is selected but we don't know anything else, send a
    // blank NCES id to ensure we save the current input state.
    const isUS = country === 'United States';
    const isNcesSchoolType = isUS && SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(schoolType);
    if (isNcesSchoolType && ncesSchoolId === '') {
      return {
        "user[school_info_attributes][country]": country,
        "user[school_info_attributes][school_type]": schoolType,
        "user[school_info_attributes][school_id]": ncesSchoolId,
      };
    }

    return {
      "user[school_info_attributes][country]": country,
      "user[school_info_attributes][school_type]": schoolType,
      "user[school_info_attributes][school_name]": this.state.schoolName,
      "user[school_info_attributes][full_address]": this.state.schoolLocation,
    };
  }

  handleSchoolInfoSubmit = () => {
    this.logEvent(FIREHOSE_EVENTS.SUBMIT, {
      attempt: this.state.showSchoolInfoUnknownError ? 2 : 1
    });

    const schoolData = this.buildSchoolData();
    const {formUrl, authTokenName, authTokenValue} = this.props.scriptData;
    $.post({
      url: formUrl + '.json',
      dataType: "json",
      data: {
        '_method': 'patch',
        [authTokenName]: authTokenValue,
        ...schoolData,
      },
    }).done(() => {
      this.logEvent(FIREHOSE_EVENTS.SAVE_SUCCESS, {
        attempt: this.state.showSchoolInfoUnknownError ? 2 : 1
      });

      this.props.onClose();
    }).fail(() => {
      this.logEvent(FIREHOSE_EVENTS.SAVE_FAILURE, {
        attempt: this.state.showSchoolInfoUnknownError ? 2 : 1
      });

      if (!this.state.showSchoolInfoUnknownError) {
        // First failure, display error message and give the teacher a chance
        // to try again.
        this.setState({showSchoolInfoUnknownError: true});
      } else {
        // We already failed once, let's not block the teacher any longer.
        this.props.onClose();
      }
    });
  };

  onCountryChange = (_, event) => {
    const newCountry = event ? event.value : '';
    this.setState({country: newCountry});
  };

  onSchoolTypeChange = (event) => {
    const newType = event ? event.target.value : '';
    this.setState({schoolType: newType});
  };

  onSchoolChange = (_, event) => {
    const newSchool = event ? event.value : '';
    this.setState({ncesSchoolId: newSchool});
  };

  onSchoolNotFoundChange = (field, event) => {
    let newValue = event ? event.target.value : '';
    this.setState({
      [field]: newValue
    });
  };

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={true}
        handleClose={this.props.onClose}
        uncloseable
      >
        <div style={styles.container}>
          <div style={styles.heading}>
            {i18n.schoolInfoInterstitialTitle()}
          </div>
          {this.state.showSchoolInfoUnknownError && (
            <p style={styles.error}>
              {i18n.schoolInfoInterstitialUnknownError()}
            </p>
          )}
          <div style={styles.middle}>
            <p>
              {i18n.schoolInfoInterstitialDescription()}
            </p>
            <SchoolInfoInputs
              ref={ref => this.schoolInfoInputs = ref}
              onCountryChange={this.onCountryChange}
              onSchoolTypeChange={this.onSchoolTypeChange}
              onSchoolChange={this.onSchoolChange}
              onSchoolNotFoundChange={this.onSchoolNotFoundChange}
              country={this.state.country}
              schoolType={this.state.schoolType}
              ncesSchoolId={this.state.ncesSchoolId}
              schoolName={this.state.schoolName}
              schoolLocation={this.state.schoolLocation}
              useGoogleLocationSearch={true}
              showErrors={false}
              showRequiredIndicator={false}
            />
          </div>
          <div style={styles.bottom}>
            <Button
              onClick={this.handleSchoolInfoSubmit}
              text={i18n.save()}
              color={Button.ButtonColor.orange}
            />
          </div>
        </div>
      </BaseDialog>
    );
  }
}
