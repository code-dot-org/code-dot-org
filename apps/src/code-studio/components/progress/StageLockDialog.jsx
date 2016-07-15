import React from 'react';
import Radium from 'radium';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import progressStyles from './progressStyles';
import color from '../../../color';

const styles = {
  main: {
    margin: 20,
    color: color.charcoal
  },
  buttonsRow: {
    margin: 20,
    textAlign: 'center'
  },
  headerRow: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.light_teal,
    backgroundColor: color.light_teal,
    padding: 10,
    fontSize: '100%',
    fontFamily: '"Gotham 4r", sans-serif'
  },
  tableCell: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.light_gray,
    padding: 10
  },
  firstCol: {
    whiteSpace: 'nowrap'
  },
  secondCol: {
    width: '100%'
  }
};

const StageLockDialog = React.createClass({
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
    handleClose: React.PropTypes.func.isRequired,
    lockStatus: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        locked: React.PropTypes.bool.isRequired
      })
    ).isRequired
  },
  render() {
    // TODO - i18n
    return (
      <BaseDialog
          isOpen={this.props.isOpen}
          handleClose={this.props.handleClose}
      >
        <div style={styles.main}>
          <div>
            Unlock students only when you are ready to release this stage to them.
            Locked students will not have access to this stage.
          </div>
          <div style={styles.buttonsRow}>
            <button style={progressStyles.blueButton}>
              Lock all students
            </button>
            <button style={progressStyles.blueButton}>
              Unlock all students
            </button>
          </div>
          <table>
            <tbody>
              <tr>
                <th style={styles.headerRow}>Status</th>
                <th style={styles.headerRow}>Name</th>
              </tr>
              {this.props.lockStatus.map(({name, locked}, index) => (
                <tr key={index}>
                  <td style={[styles.tableCell, styles.firstCol]}>
                    <ToggleGroup
                        selected={locked ? 'Locked' : 'Unlocked'}
                        onChange={() => console.log('onchange')}>
                      <button value="Locked">Locked</button>
                      <button value="Unlocked">Unlocked</button>
                    </ToggleGroup>
                    {}
                  </td>
                  <td style={[styles.tableCell, styles.secondCol]}>{name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BaseDialog>
    );
  }
});

export default Radium(StageLockDialog);
