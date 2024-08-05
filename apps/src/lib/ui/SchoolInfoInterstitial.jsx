import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import mapboxReducer, {setMapboxAccessToken} from '@cdo/apps/redux/mapbox';
import i18n from '@cdo/locale';

import BaseDialog from '../../templates/BaseDialog';
import SchoolInfoInputs, {
  SCHOOL_TYPES_HAVING_NCES_SEARCH,
  SCHOOL_TYPES_HAVING_NAMES,
} from '../../templates/SchoolInfoInputs';
import color from '../../util/color';

const store = createStore(
  combineReducers({
    mapbox: mapboxReducer,
  })
);

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
      mapboxAccessToken: PropTypes.string,
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

    const initialNcesSchoolId = existingSchoolInfo.school_id
      ? existingSchoolInfo.school_id
      : existingSchoolInfo.country === 'United States' &&
        SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(
          existingSchoolInfo.school_type
        ) &&
        (existingSchoolInfo.school_name || existingSchoolInfo.full_address)
      ? '-1'
      : '';

    this.state = {
      country: initialCountry,
      schoolType: existingSchoolInfo.school_type || '',
      schoolName: existingSchoolInfo.school_name || '',
      schoolLocation: existingSchoolInfo.full_address || '',
      ncesSchoolId: initialNcesSchoolId,
      showSchoolInfoUnknownError: false,
      errors: {},
      isOpen: true,
    };

    if (this.props.scriptData.mapboxAccessToken) {
      store.dispatch(
        setMapboxAccessToken(this.props.scriptData.mapboxAccessToken)
      );
    }
  }

  static isSchoolInfoComplete(state) {
    if (!state.country) {
      return false;
    }

    if (state.country !== 'United States') {
      return true;
    }

    if (
      ['homeschool', 'after school', 'organization', 'other'].includes(
        state.schoolType
      )
    ) {
      return true;
    }

    if (state.ncesSchoolId && state.ncesSchoolId !== '-1') {
      return true;
    }

    return !!(state.country && state.schoolType && state.schoolName);
  }

  componentDidMount() {
    analyticsReporter.sendEvent(
      EVENTS.SCHOOL_INTERSTITIAL_SHOW,
      {},
      PLATFORMS.BOTH
    );
  }

  buildSchoolData() {
    const {country, schoolType, ncesSchoolId} = this.state;
    // If we have an NCES id, _only_ send that - everything else will be
    // backfilled by records on the server.
    if (ncesSchoolId && ncesSchoolId !== '-1') {
      return {
        'user[school_info_attributes][school_id]': ncesSchoolId,
      };
    }

    // If we don't know enough to pick other metadata, only send these.
    if (!country || !schoolType) {
      return {
        'user[school_info_attributes][country]': country,
        'user[school_info_attributes][school_type]': schoolType,
      };
    }

    // If an NCES type is selected but we don't know anything else, send a
    // blank NCES id to ensure we save the current input state.
    const isUS = country === 'United States';
    const isNcesSchoolType =
      isUS && SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(schoolType);
    if (isNcesSchoolType && ncesSchoolId === '') {
      return {
        'user[school_info_attributes][country]': country,
        'user[school_info_attributes][school_type]': schoolType,
        'user[school_info_attributes][school_id]': ncesSchoolId,
      };
    }

    if (SCHOOL_TYPES_HAVING_NAMES.includes(schoolType)) {
      return {
        'user[school_info_attributes][country]': country,
        'user[school_info_attributes][school_type]': schoolType,
        'user[school_info_attributes][school_name]': this.state.schoolName,
        'user[school_info_attributes][full_address]': this.state.schoolLocation,
      };
    }

    return {
      'user[school_info_attributes][country]': country,
      'user[school_info_attributes][school_type]': schoolType,
      'user[school_info_attributes][full_address]': this.state.schoolLocation,
    };
  }

  isBlank(field) {
    // return true when field is blank
    return !!(!field || field.trim() === '');
  }

  validateSubmission = () => {
    const {country, schoolType, schoolName, ncesSchoolId} = this.state;
    let errors = {};
    let isValid = true;

    if (this.isBlank(country)) {
      errors.country = true;
      isValid = false;
    } else if (country === 'United States') {
      if (this.isBlank(schoolType)) {
        errors.schoolType = true;
        isValid = false;
      } else {
        /**
         * NCES (National center for education statistics) only stores information
         * for private, public and charter schools in the United States.
         * Teachers with NCES school IDs are unique becuase of the useful information
         * that is provided by NCES that the data team can join onto/use such as the
         * the number of students in a school, % of URM students.
         */
        const ncesSchoolType = ['public', 'private', 'charter'];
        if (ncesSchoolType.includes(schoolType)) {
          if (this.isBlank(ncesSchoolId)) {
            errors.ncesSchoolId = true;
            isValid = false;
          }

          // ncesSchoolId is set to -1 when the checkbox for school not found is clicked
          // For a US, NCES school type, No NCES school id, school name is required.
          if (ncesSchoolId === '-1' && this.isBlank(schoolName)) {
            errors.schoolName = true;
            isValid = false;
          }
        }
      }
    }
    return {
      errors,
      isValid,
    };
  };

  handleSchoolInfoSubmit = () => {
    const {errors, isValid} = this.validateSubmission();
    this.setState({
      errors,
    });
    if (!isValid) {
      return;
    }
    analyticsReporter.sendEvent(
      EVENTS.SCHOOL_INTERSTITIAL_SUBMIT,
      {
        hasNcesId:
          this.state.ncesSchoolId && this.state.ncesSchoolId !== '-1'
            ? 'true'
            : 'false',
        attempt: this.state.showSchoolInfoUnknownError ? 2 : 1,
      },
      PLATFORMS.BOTH
    );

    const schoolData = this.buildSchoolData();
    const {formUrl, authTokenName, authTokenValue} = this.props.scriptData;
    $.post({
      url: formUrl + '.json',
      dataType: 'json',
      data: {
        _method: 'patch',
        [authTokenName]: authTokenValue,
        ...schoolData,
      },
    })
      .done(() => {
        analyticsReporter.sendEvent(
          EVENTS.SCHOOL_INTERSTITIAL_SAVE_SUCCESS,
          {
            attempt: this.state.showSchoolInfoUnknownError ? 2 : 1,
          },
          PLATFORMS.BOTH
        );

        this.props.onClose();
      })
      .fail(() => {
        analyticsReporter.sendEvent(
          EVENTS.SCHOOL_INTERSTITIAL_SAVE_FAILURE,
          {
            attempt: this.state.showSchoolInfoUnknownError ? 2 : 1,
          },
          PLATFORMS.BOTH
        );

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

  dismissSchoolInfoForm = () => {
    analyticsReporter.sendEvent(
      EVENTS.SCHOOL_INTERSTITIAL_DISMISS,
      {},
      PLATFORMS.BOTH
    );
    this.setState({isOpen: false});
    this.props.onClose();
  };

  onCountryChange = (_, event) => {
    const newCountry = event ? event.value : '';
    this.setState({country: newCountry, ncesSchoolId: '', errors: {}});
  };

  onSchoolTypeChange = event => {
    const newType = event ? event.target.value : '';
    this.setState({schoolType: newType, ncesSchoolId: '', errors: {}});
  };

  onSchoolChange = (_, event) => {
    const newSchool = event ? event.value : '';
    // clear error state if school is not found in dropdown
    let errors = this.state.errors;
    if (newSchool === '-1') {
      errors = {};
    }
    this.setState({ncesSchoolId: newSchool, errors});
  };

  onSchoolNotFoundChange = (field, event) => {
    let newValue = event ? event.target.value : '';
    this.setState({
      [field]: newValue,
      errors: {},
    });
  };

  render() {
    const showErrors = Object.keys(this.state.errors).length > 0;
    const {mapboxAccessToken} = this.props.scriptData;
    return (
      <Provider store={store}>
        <BaseDialog
          useUpdatedStyles
          isOpen={this.state.isOpen}
          handleClose={this.props.onClose}
          uncloseable
          overflow={'visible'}
        >
          <div style={styles.container}>
            {this.state.showSchoolInfoUnknownError && (
              <p style={styles.error}>
                {i18n.schoolInfoInterstitialUnknownError()}
              </p>
            )}
            <div style={styles.middle}>
              <SchoolInfoInputs
                ref={ref => (this.schoolInfoInputs = ref)}
                onCountryChange={this.onCountryChange}
                onSchoolTypeChange={this.onSchoolTypeChange}
                onSchoolChange={this.onSchoolChange}
                onSchoolNotFoundChange={this.onSchoolNotFoundChange}
                country={this.state.country}
                schoolType={this.state.schoolType}
                ncesSchoolId={this.state.ncesSchoolId}
                schoolName={this.state.schoolName}
                schoolLocation={this.state.schoolLocation}
                useLocationSearch={true}
                showErrors={showErrors}
                showRequiredIndicator={true}
                mapboxAccessToken={mapboxAccessToken}
              />
            </div>
            <div style={styles.bottom}>
              <Button
                onClick={this.dismissSchoolInfoForm}
                style={styles.button}
                color="gray"
                size="large"
                text={i18n.dismiss()}
                id="dismiss-button"
              />
              <Button
                onClick={this.handleSchoolInfoSubmit}
                style={styles.button}
                size="large"
                text={i18n.save()}
                color={Button.ButtonColor.brandSecondaryDefault}
                id="save-button"
              />
            </div>
          </div>
        </BaseDialog>
      </Provider>
    );
  }
}

const styles = {
  container: {
    margin: 20,
    color: color.charcoal,
    fontSize: 13,
  },
  heading: {
    fontSize: 16,
    ...fontConstants['main-font-semi-bold'],
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
  button: {
    marginLeft: 7,
    marginRight: 7,
    marginTop: 15,
    marginBottom: 15,
  },
};
