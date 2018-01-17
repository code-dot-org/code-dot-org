/** @file Maker Discount Code Eligibility Checklist */
import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import color from "@cdo/apps/util/color";
import Button from "@cdo/apps/templates/Button";
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';
import DiscountCodeSchoolChoice from './DiscountCodeSchoolChoice';
import Unit6ValidationStep from './Unit6ValidationStep';
import EligibilityConfirmDialog from './EligibilityConfirmDialog';
import DiscountCodeInstructions from '@cdo/apps/lib/kits/maker/ui/DiscountCodeInstructions';

const styles = {
  main: {
    color: color.charcoal
  },
  discountMessage: {
    marginTop: 10,
    marginBottom: 10
  },
  bold: {
    fontFamily: '"Gotham 7r", sans-serif',
    display: 'inline',
  }
};

export default class EligibilityChecklist extends Component {
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
  };

  state = {
    statusYear: Status.UNKNOWN,
    yearChoice: null, // stores the teaching-year choice until submitted
    submitting: false,
    discountAmount: null,
    confirming: false,
    discountCode: null
  };

  constructor(props) {
    super(props);

    // If we had already submitted our intentions for unit 6, initialize component
    // state with that data
    if (props.unit6Intention) {
      this.state = {
        ...this.state,
        yearChoice: props.unit6Intention,
        statusYear: (props.unit6Intention === 'yes1718' ||
          props.unit6Intention === 'yes1819') ? Status.SUCCEEDED : Status.FAILED,
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
        discountAmount: (props.getsFullDiscount ? "$0" : "$97.50")
      };
    }

    this.state = {
      ...this.state,
      discountCode: props.initialDiscountCode,
      expiration: props.initialExpiration,
    };
  }

  handleSchoolConfirmed = (fullDiscount) => {
    this.setState({
      discountAmount: fullDiscount ? "$0" : "$97.50"
    });
  }

  handleUnit6Submitted = eligible => {
    this.setState({
      statusYear: eligible ? Status.SUCCEEDED : Status.FAILED,
    });
  }

  confirmEligibility = () => this.setState({confirming: true})

  handleCancelDialog = () => this.setState({confirming: false})

  handleSuccessDialog = (discountCode, expiration) => {
    this.setState({discountCode, expiration});
  };

  render() {
    if (this.state.discountCode) {
      return (
        <DiscountCodeInstructions
          discountCode={this.state.discountCode}
          fullDiscount={this.props.getsFullDiscount}
          expiration={this.state.expiration}
        />
      );
    }

    return (
      <div style={styles.main}>
        <h2>
          {i18n.eligibilityRequirements()}
        </h2>
        <div>
          {i18n.eligibilityExplanation()}
        </div>
        <ValidationStep
          stepName={i18n.eligibilityReqPD()}
          stepStatus={this.props.statusPD}
        >
          {i18n.eligibilityReqPDFail()}
        </ValidationStep>
        <ValidationStep
          stepName={i18n.eligibilityReqStudentCount()}
          stepStatus={this.props.statusStudentCount}
        >
          {i18n.eligibilityReqStudentCountFail()}
        </ValidationStep>
        <Unit6ValidationStep
          showRadioButtons={this.props.statusStudentCount === Status.SUCCEEDED &&
            this.props.statusPD === Status.SUCCEEDED && !this.props.adminSetStatus}
          stepStatus={this.state.statusYear}
          initialChoice={this.props.unit6Intention}
          onSubmit={this.handleUnit6Submitted}
        />
        {this.state.statusYear === Status.SUCCEEDED && !this.props.adminSetStatus &&
          <DiscountCodeSchoolChoice
            initialSchoolId={this.props.schoolId}
            initialSchoolName={this.props.schoolName}
            schoolConfirmed={this.props.hasConfirmedSchool}
            onSchoolConfirmed={this.handleSchoolConfirmed}
          />
        }
        {this.state.discountAmount === "$97.50" && !this.props.adminSetStatus &&
          <div style={styles.discountMessage}>
            According to our data, your school has fewer than 50% of students that are
            eligible for free/reduced-price lunches. This means that we can bring down
            the cost of the $325 kit to just $97.50.{" "}
            <strong style={styles.bold}>
              If this data seems inaccurate and you believe there are over 50% of students
              that are eligible for free/reduced-price lunch at your school, please contact
              teacher@code.org.
            </strong>
            {" "}
            Otherwise, click "Get Code" below.
          </div>
        }
        {this.props.adminSetStatus &&
          <div style={styles.discountMessage}>
            {i18n.eligibilityReqYearFail()}
          </div>
        }
        {this.state.discountAmount  &&
          <Button
            color={Button.ButtonColor.orange}
            text={i18n.getCodePrice({price: this.state.discountAmount})}
            onClick={this.confirmEligibility}
          />
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
