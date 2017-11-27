import React, { Component, PropTypes } from 'react';
import i18n from "@cdo/locale";
import Button from "../Button";
import SchoolAutocompleteDropdownWithLabel from '../census2017/SchoolAutocompleteDropdownWithLabel';
import { styles as censusFormStyles } from '../census2017/censusFormStyles';

const styles = {
  confirmed: {
    marginBottom: 5
  },
  button: {
    marginTop: 10
  }
};

export default class DiscountCodeSchoolChoice extends Component {
  static propTypes = {
    initialSchoolId: PropTypes.string,
    initialSchoolName: PropTypes.string,
    schoolConfirmed: PropTypes.bool.isRequired,
    onSchoolConfirmed: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      confirming: false,
      confirmed: props.schoolConfirmed,
      schoolId: props.initialSchoolId,
      schoolName: props.initialSchoolName,
    };
  }

  handleDropdownChange = (field, event) => {
    if (field === 'nces') {
      this.setState({
        schoolId: event.value,
        schoolName: event.label,
      });
    }
  }

  handleClickConfirmSchool = () => {
    this.setState({
      confirming: true
    });

    $.ajax({
     url: "/maker/schoolchoice",
     type: "post",
     dataType: "json",
     data: {
       nces: this.state.schoolId
     }
   }).done(data => {
     this.props.onSchoolConfirmed(data.full_discount);
     this.setState({
       confirming: false,
       confirmed: true,
     });
   }).fail((jqXHR, textStatus) => {
     // TODO: should probably introduce some error UI
     console.error(textStatus);
   });
  }

  render() {
    const { schoolId, schoolName, confirming, confirmed } = this.state;

    if (confirmed) {
      return (
        <div style={styles.confirmed}>
          <div style={censusFormStyles.question}>{i18n.schoolName()}</div>
          {schoolName}
        </div>
      );
    }

    return (
      <div>
        <SchoolAutocompleteDropdownWithLabel
          setField={this.handleDropdownChange}
          value={schoolId}
          showErrorMsg={false}
        />
        {this.state.schoolId !== "-1" && (
          <Button
            color={Button.ButtonColor.orange}
            text={confirming ? i18n.confirming() : i18n.confirmSchool()}
            onClick={this.handleClickConfirmSchool}
            style={styles.button}
            disabled={confirming}
          />
        )}
        {this.state.schoolId === "-1" && (
          <div>
            {i18n.eligibilitySchoolUnknown()}
            <b> {i18n.contactToContinue()}</b>
          </div>
        )}
      </div>
    );
  }
}
