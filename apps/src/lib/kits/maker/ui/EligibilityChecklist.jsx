import React, {PropTypes} from 'react';
import i18n from "@cdo/locale";
import color from "@cdo/apps/util/color";
import DiscountCodeSchoolChoice from "./DiscountCodeSchoolChoice";
import Button from "@cdo/apps/templates/Button";
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';
import UnsafeRenderedMarkdown from '../../../../templates/UnsafeRenderedMarkdown';
import {isUnit6IntentionEligible} from '../util/discountLogic';
import Unit6ValidationStep from "./Unit6ValidationStep";
import EligibilityConfirmDialog from "./EligibilityConfirmDialog";
import DiscountCodeInstructions from './DiscountCodeInstructions';

const styles = {
  main: {
    color: color.charcoal
  }
};

export default class EligibilityChecklist extends React.Component {
  static propTypes = {
    statusPD: PropTypes.oneOf(Object.values(Status)).isRequired,
    statusStudentCount: PropTypes.oneOf(Object.values(Status)).isRequired,
    unit6Intention: PropTypes.string,
    schoolId: PropTypes.string,
    schoolName: PropTypes.string,
    hasConfirmedSchool: PropTypes.bool,
    getsFullDiscount: PropTypes.bool,
    initialDiscountCode: PropTypes.string,
    initialExpiration: PropTypes.string,
    adminSetStatus: PropTypes.bool.isRequired,
    currentlyDistributingDiscountCodes: PropTypes.bool,
  };

  state = {
    schoolId: null,
    schoolEligible: null,
    statusYear: Status.UNKNOWN,
    yearChoice: null, // stores the teaching-year choice until submitted
    submitting: false,
    confirming: false,
    discountCode: null,
    expiration: null,
  };

  constructor(props) {
    super(props);

    // If we had already submitted our intentions for unit 6, initialize component
    // state with that data
    if (props.unit6Intention) {
      this.state = {
        ...this.state,
        yearChoice: props.unit6Intention,
        statusYear: isUnit6IntentionEligible(props.unit6Intention) ? Status.SUCCEEDED : Status.FAILED,
      };
    }

    if (props.adminSetStatus) {
      this.state = {
        ...this.state,
        statusYear: props.getsFullDiscount ? Status.SUCCEEDED : Status.FAILED
      };
    }

    if (props.hasConfirmedSchool || props.adminSetStatus) {
      this.state = {
        ...this.state,
        schoolId: props.schoolId,
        schoolEligible: !!props.getsFullDiscount
      };
    }

    this.state = {
      ...this.state,
      discountCode: props.initialDiscountCode,
      expiration: props.initialExpiration,
    };
  }

  handleSchoolConfirmed = ({schoolId, fullDiscount}) => {
    this.setState({
      schoolId: schoolId,
      schoolEligible: !!fullDiscount
    });
  };

  handleUnit6Submitted = eligible => {
    this.setState({
      statusYear: eligible ? Status.SUCCEEDED : Status.FAILED,
    });
  };

  confirmEligibility = () => this.setState({confirming: true});

  handleCancelDialog = () => this.setState({confirming: false});

  handleSuccessDialog = (discountCode, expiration) => {
    this.setState({discountCode, expiration});
  };

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
            Sorry, we are no longer distributing Adafruit discount codes at this time.
          </p>
        </div>
      );
    }

    return (
      <div>
        <h1>{discountPageHeader}</h1>
        <UnsafeRenderedMarkdown markdown={discountPageDescriptionMd}/>
        <h2>{schoolRequirementHeading}</h2>
        <UnsafeRenderedMarkdown markdown={schoolRequirementDescriptionMd}/>
        <DiscountCodeSchoolChoice
          initialSchoolId={this.props.schoolId}
          initialSchoolName={this.props.schoolName}
          schoolConfirmed={this.props.hasConfirmedSchool}
          onSchoolConfirmed={this.handleSchoolConfirmed}
        />
        {this.state.schoolEligible === false && !this.props.adminSetStatus &&
          <UnsafeRenderedMarkdown markdown={schoolIsNotEligibleMd(this.state.schoolId)}/>
        }
        {this.state.schoolEligible === true && !this.props.adminSetStatus &&
          <div>
            <UnsafeRenderedMarkdown markdown={schoolIsEligibleMd}/>
            <h2>{i18n.eligibilityRequirements()}</h2>
            <p>{i18n.eligibilityExplanation()}</p>
            <ValidationStep
              stepName={i18n.eligibilityReqPD()}
              stepStatus={this.props.statusPD}
            >
              <UnsafeRenderedMarkdown markdown={eligibilityReqPDFail}/>
            </ValidationStep>
            <ValidationStep
              stepName={i18n.eligibilityReqStudentCount()}
              stepStatus={this.props.statusStudentCount}
            >
              <UnsafeRenderedMarkdown markdown={eligibilityReqStudentCountFail}/>
            </ValidationStep>
            <Unit6ValidationStep
              showRadioButtons={this.props.statusStudentCount === Status.SUCCEEDED &&
              this.props.statusPD === Status.SUCCEEDED && !this.props.adminSetStatus}
              stepStatus={this.state.statusYear}
              initialChoice={this.props.unit6Intention}
              onSubmit={this.handleUnit6Submitted}
            />
          </div>
        }
        {this.state.statusYear === Status.SUCCEEDED &&
          <div>
            <div>
              <strong>
                You meet all the requirements for a fully subsidized classroom kit. Click the “Get Code” button to get your code.
              </strong>
            </div>
            <Button
              color={Button.ButtonColor.orange}
              text={i18n.getCode()}
              onClick={this.confirmEligibility}
            />
          </div>
        }
        {this.state.confirming &&
          <EligibilityConfirmDialog
            onCancel={this.handleCancelDialog}
            onSuccess={this.handleSuccessDialog}
          />
        }
      </div>
    );
  }
}

const discountPageHeader = `Subsidized Circuit Playground Kits`;
const discountPageDescriptionMd = `
Code.org is able to offer a 100% subsidy for one Circuit Playground classroom kit to eligible
teachers at schools with 40% or greater free and reduced-price meals. To learn more about
the full eligibility requirements, read the overview [here](//code.org/circuitplayground).
`;

const schoolRequirementHeading = `School requirement`;
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

const schoolIsNotEligibleMd = (ncesId) => `
Unfortunately, you’re not eligible for the Code.org-provided subsidy for the kit because
your school has fewer than 40% of students that are eligible for free/reduced-price lunches
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
