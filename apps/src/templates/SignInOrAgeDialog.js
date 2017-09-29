import React, { Component } from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';
import Button from '@cdo/apps/templates/Button';
import AgeDropdown from '@cdo/apps/templates/AgeDropdown';

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
    display: 'flex',

  },
  middleCell: {
    display: 'inline-block',
    verticalAlign: 'top',
    maxWidth: '50%',
  },
  center: {
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'column',
    display: 'flex',
  },
  centerLine: {
    borderLeft: `1px solid ${color.lighter_gray}`,
    marginLeft: '50%',
    height: '100%',
  },
  centerText: {
    padding: 3
  },
  button: {
    paddingTop: 15
  },
  age: {
    paddingTop: 15,
  },
  dropdown: {
    verticalAlign: 'top',
    marginRight: 10,
    marginTop: 2,
    width: 160
  }
};

export default class SignInOrAgeDialog extends Component {
  state = {
    open: true
  };

  onClickAgeOk = () => {
    const value = this.ageDropdown.getValue();
    // Ignore click if nothing selected
    if (!value) {
      return;
    }

    if (parseInt(value, 10) < 13) {
      // redirect to /home, with an info warning if possible
      window.location = '/too_young';
      return;
    }

    // Over 13, let them do the tutorial
    this.setState({
      open: false
    });
  };

  render() {
    // TODO: i18n
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.open}
        assetUrl={() => ''}
        uncloseable
      >
        <div style={styles.container}>
          <div style={styles.heading}>
            Sign in or provide your age to continue
          </div>
          <div style={styles.middle}>
            <div style={styles.middleCell}>
              If you want to be able to save your progress, sign in to Code.org.
              <div style={styles.button}>
                <Button
                  href="/users/sign_in"
                  text="Sign in to Code.org"
                  color={Button.ButtonColor.gray}
                />
              </div>
            </div>
            <div style={styles.center}>
              <div style={styles.centerLine}/>
              <div style={styles.centerText}>
                or
              </div>
              <div style={styles.centerLine}/>
            </div>
            <div style={styles.middleCell}>
              Provide your age below and click OK to continue.
              <div style={styles.age}>
                <AgeDropdown
                  style={styles.dropdown}
                  ref={element => this.ageDropdown = element}
                />
                <Button
                  onClick={this.onClickAgeOk}
                  text="OK"
                  color={Button.ButtonColor.gray}
                />
              </div>
            </div>
          </div>
          <div>
            <a href="https://code.org/privacy">Our privacy policy</a>
          </div>
        </div>
      </BaseDialog>
    );
  }
}
