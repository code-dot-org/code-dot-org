import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import DiscountCodeSchoolChoice from './DiscountCodeSchoolChoice';
import Button from '@cdo/apps/templates/Button';
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';
import SafeMarkdown from '../../../../templates/SafeMarkdown';
import {
  isUnit6IntentionEligible,
  inDiscountRedemptionWindow,
  eligibilityDates
} from '../util/discountLogic';
import Unit6ValidationStep from './Unit6ValidationStep';
import EligibilityConfirmDialog from './EligibilityConfirmDialog';
import DiscountCodeInstructions from './DiscountCodeInstructions';

export default class EligibilityChecklist extends React.Component {
  static propTypes = {
    statusPD: PropTypes.oneOf(Object.values(Status)).isRequired,
    statusStudentCount: PropTypes.oneOf(Object.values(Status)).isRequired,
    unit6Intention: PropTypes.string,
    schoolId: PropTypes.string,
    schoolName: PropTypes.string,
    schoolHighNeedsEligible: PropTypes.bool,
    hasConfirmedSchool: PropTypes.bool,
    initialDiscountCode: PropTypes.string,
    initialExpiration: PropTypes.string,
    adminSetStatus: PropTypes.bool.isRequired,
    currentlyDistributingDiscountCodes: PropTypes.bool
  };

  state = {
    schoolId: null,
    schoolEligible: null,
    statusYear: Status.UNKNOWN,
    statusRedemptionWindow: Status.UNKNOWN,
    yearChoice: null, // stores the teaching-year choice until submitted
    submitting: false,
    confirming: false,
    discountCode: null,
    expiration: null
  };

  constructor(props) {
    super(props);

    // If we had already submitted our intentions for unit 6, initialize component
    // state with that data
    if (props.unit6Intention) {
      this.state = {
        ...this.state,
        yearChoice: props.unit6Intention,
        statusRedemptionWindow: inDiscountRedemptionWindow(props.unit6Intention)
          ? Status.SUCCEEDED
          : Status.FAILED,
        statusYear: isUnit6IntentionEligible(props.unit6Intention)
          ? Status.SUCCEEDED
          : Status.FAILED
      };
    }

    if (props.adminSetStatus) {
      this.state = {
        ...this.state,
        statusYear: Status.SUCCEEDED
      };
    }

    if (props.hasConfirmedSchool || props.adminSetStatus) {
      this.state = {
        ...this.state,
        schoolId: props.schoolId,
        schoolEligible: !!props.schoolHighNeedsEligible
      };
    }

    this.state = {
      ...this.state,
      discountCode: props.initialDiscountCode,
      expiration: props.initialExpiration
    };
  }

  handleSchoolConfirmed = ({schoolId, schoolHighNeedsEligible}) => {
    this.setState({
      schoolId: schoolId,
      schoolEligible: schoolHighNeedsEligible
    });
  };

  schoolHighNeedsStatusMessage = schoolHighNeedsEligible => {
    return schoolHighNeedsEligible === true ? (
      <SafeMarkdown markdown={schoolIsEligibleMd} />
    ) : (
      <SafeMarkdown markdown={schoolIsNotEligibleMd(this.state.schoolId)} />
    );
  };

  schoolHighNeedsStatus = schoolHighNeedsEligible => {
    return schoolHighNeedsEligible === true ? Status.SUCCEEDED : Status.FAILED;
  };

  handleUnit6Submitted = ({eligible, unit6Intention}) => {
    this.setState({
      statusRedemptionWindow: inDiscountRedemptionWindow(unit6Intention)
        ? Status.SUCCEEDED
        : Status.FAILED,
      yearChoice: unit6Intention,
      statusYear: eligible ? Status.SUCCEEDED : Status.FAILED
    });
  };

  confirmEligibility = () => this.setState({confirming: true});

  handleCancelDialog = () => this.setState({confirming: false});

  handleSuccessDialog = (discountCode, expiration) => {
    this.setState({discountCode, expiration});
  };

  formattedEligibilityDate = yearChoice =>
    eligibilityDates[yearChoice].format('MMMM Do, YYYY');

  render() {
    if (this.state.discountCode) {
      return (
        <DiscountCodeInstructions
          discountCode={this.state.discountCode}
          expiration={this.state.expiration}
        />
      );
    }

    if (!this.props.currentlyDistributingDiscountCodes) {
      return (
        <div style={styles.main}>
          <h2>Discount codes are no longer available</h2>
          <p>
            Sorry, we are no longer distributing Adafruit discount codes at this
            time.
          </p>
        </div>
      );
    }

    return (
      <div>
        <h1>{discountPageHeader}</h1>
        <SafeMarkdown markdown={discountPageDescriptionMd} />
        <h2>{schoolRequirementHeading}</h2>
        <SafeMarkdown markdown={schoolRequirementDescriptionMd} />
        <DiscountCodeSchoolChoice
          initialSchoolId={this.props.schoolId}
          initialSchoolName={this.props.schoolName}
          schoolConfirmed={this.props.hasConfirmedSchool}
          onSchoolConfirmed={this.handleSchoolConfirmed}
        />
        {this.state.schoolEligible !== null && !this.props.adminSetStatus && (
          <div>
            {this.schoolHighNeedsStatusMessage(this.state.schoolEligible)}
            <h2>{i18n.eligibilityRequirements()}</h2>
            <p>{i18n.eligibilityExplanation()}</p>
            <ValidationStep
              stepName={schoolIsEligibleHeader}
              stepStatus={this.schoolHighNeedsStatus(this.state.schoolEligible)}
            >
              {schoolIsNotEligibleDescription}
            </ValidationStep>
            <ValidationStep
              stepName={i18n.eligibilityReqPD()}
              stepStatus={this.props.statusPD}
            >
              <SafeMarkdown markdown={eligibilityReqPDFail} />
            </ValidationStep>
            <ValidationStep
              stepName={i18n.eligibilityReqStudentCount()}
              stepStatus={this.props.statusStudentCount}
            >
              <SafeMarkdown markdown={eligibilityReqStudentCountFail} />
            </ValidationStep>
            <Unit6ValidationStep
              showRadioButtons={
                this.state.schoolEligible === true &&
                this.props.statusStudentCount === Status.SUCCEEDED &&
                this.props.statusPD === Status.SUCCEEDED &&
                !this.props.adminSetStatus
              }
              stepStatus={this.state.statusYear}
              initialChoice={this.props.unit6Intention}
              onSubmit={this.handleUnit6Submitted}
            />
          </div>
        )}
        {this.state.statusRedemptionWindow === Status.FAILED &&
          this.state.statusYear === Status.SUCCEEDED &&
          !this.props.adminSetStatus && (
            <SafeMarkdown
              markdown={redemptionWindowFailMd(
                this.formattedEligibilityDate(this.state.yearChoice)
              )}
            />
          )}
        {((this.state.statusYear === Status.SUCCEEDED &&
          this.state.statusRedemptionWindow === Status.SUCCEEDED) ||
          this.props.adminSetStatus) && (
          <div>
            <div>
              <strong>
                You meet all the requirements for a fully subsidized classroom
                kit. Click the “Get Code” button to get your code.
              </strong>
            </div>
            <Button
              __useDeprecatedTag
              color={Button.ButtonColor.orange}
              text={i18n.getCode()}
              onClick={this.confirmEligibility}
            />
          </div>
        )}
        {this.state.confirming && (
          <EligibilityConfirmDialog
            onCancel={this.handleCancelDialog}
            onSuccess={this.handleSuccessDialog}
          />
        )}
      </div>
    );
  }
}

const styles = {
  main: {
    color: color.charcoal
  }
};

const discountPageHeader = `Subsidized Circuit Playground Kits`;
const discountPageDescriptionMd = `
Code.org is able to offer a 100% subsidy for one Circuit Playground classroom kit to eligible
teachers at schools with 50% or greater free and reduced-price meals. To learn more about
the full eligibility requirements, read the overview [here](//code.org/circuitplayground).
`;

const schoolRequirementHeading = `School Requirement`;
const schoolRequirementDescriptionMd = `
Please verify which school you teach at, so we can check if your school is eligible for a
Code.org-provided subsidy.
`;

const schoolIsEligibleMd = `
Your school is eligible for the Code.org-provided subsidy!
You will receive a code that covers the cost of a single classroom kit if you meet the eligibility
requirements below. If you don’t meet these requirements, you are still eligible for a discount!
Adafruit has made available a 10% off educator discount that this kit is eligible for.
Just use the code \`ADAEDU\` at checkout.
`;

const schoolIsEligibleHeader = `Your school is eligible for the Code.org provided subsidy.`;
const schoolIsNotEligibleDescription = `See "School Requirement" section above for more detail.`;

const schoolIsNotEligibleMd = ncesId => `
**Unfortunately, you’re not eligible for the Code.org-provided subsidy for the kit because
your school has fewer than 50% of students that are eligible for free/reduced-price lunches**
([source](https://nces.ed.gov/ccd/schoolsearch/school_detail.asp?ID=${ncesId})).
However, you are still eligible for a discount! Adafruit has made available a 10% off educator
discount that this kit is eligible for. Just use the code \`ADAEDU\` at checkout.

If you believe the data that we have on your school is inaccurate, please email us at
[teacher@code.org](mailto:teacher@code.org) with more details on the free/reduced-price
lunch data from your school.
`;

const eligibilityReqPDFail = `
We did not find the email address associated with this account under the list of people who meet
this requirement.
If you think this is incorrect, please email us at [teacher@code.org](mailto:teacher@code.org).
`;

const eligibilityReqStudentCountFail = `
Sorry, it doesn’t look like you have enough students in your sections that have made progress in
Units 2 and 3. Please check back here once your students have finished the first semester of
CS Discoveries. If you are using a different account to track the progress of students or if you
think there has been an error in detecting how much progress your students have made in Units
2 and 3, please contact us at [teacher@code.org](mailto:teacher@code.org).
`;

const redemptionWindowFailMd = eligibilityDate => `
Thanks for letting us know your plans! It appears that you qualify for the
subsidized Circuit Playground classroom kit, but we’re not able to provide the
hardware until the semester you plan to teach Unit 6. **To receive your subsidized
classroom kit, please visit this page again anytime after ${eligibilityDate}.**
The final date to request your subsidized kit is **April 30, 2021**. For any
questions or concerns, please contact us at [teacher@code.org](mailto:teacher@code.org).
`;
