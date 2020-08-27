import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button, {ButtonColor, ButtonSize} from '@cdo/apps/templates/Button';
import LevelToken2 from './LevelToken2';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif'
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    margin: 15
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    margin: 15
  },
  textArea: {
    width: '95%'
  },
  levelsBox: {
    border: '1px solid black',
    width: '95%',
    height: '100%',
    padding: 10
  },
  filters: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  dropdown: {
    width: 125,
    margin: 5
  },
  filtersAndLevels: {
    display: 'flex',
    flexDirection: 'column'
  },
  th: {
    width: '20%'
  }
};

export default class AddLevelDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    currentLevels: PropTypes.array
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>Add Levels</h2>
        <div style={styles.dialogContent}>
          <div style={styles.leftColumn}>
            <ToggleGroup selected={'Find Level'} onChange={() => {}}>
              <button type="button" value={'Find Level'}>
                Find Level
              </button>
              <button type="button" value={'Create New Level'}>
                Create New Level
              </button>
            </ToggleGroup>
            <div style={styles.filtersAndLevels}>
              <div style={styles.filters}>
                <label>
                  By Name:
                  <input
                    style={styles.dropdown}
                    onChange={() => {
                      console.log('filter by name');
                    }}
                  />
                </label>
                <label>
                  By Type:
                  <select
                    style={styles.dropdown}
                    onClick={() => {
                      console.log('filter by type');
                    }}
                  >
                    <option />
                    <option>App Lab</option>
                    <option>Game Lab</option>
                    <option>Standalone Video</option>
                  </select>
                </label>
                <label>
                  By Script:
                  <select
                    style={styles.dropdown}
                    onClick={() => {
                      console.log('filer by script');
                    }}
                  >
                    <option />
                    <option>csp1-2020</option>
                    <option>csd3-2020</option>
                    <option>coursea-2020</option>
                  </select>
                </label>
                <label>
                  By Owner:
                  <select
                    style={styles.dropdown}
                    onClick={() => {
                      console.log('filter by owner');
                    }}
                  >
                    <option />
                    <option>Hannah</option>
                    <option>Mike</option>
                    <option>Dan</option>
                  </select>
                </label>
                <Button
                  icon="search"
                  onClick={() => {
                    console.log('Search');
                  }}
                />
              </div>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>Actions</th>
                      <th style={styles.th}>
                        Name
                        <FontAwesome icon="sort" />
                      </th>
                      <th style={styles.th}>
                        Type
                        <FontAwesome icon="sort" />
                      </th>
                      <th style={styles.th}>
                        Owner
                        <FontAwesome icon="sort" />
                      </th>
                      <th style={styles.th}>
                        Last Updated
                        <FontAwesome icon="sort" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <Button
                          icon="plus"
                          onClick={() => {
                            console.log('Add level');
                          }}
                          color={ButtonColor.blue}
                          size={ButtonSize.narrow}
                        />
                        <Button
                          icon="files-o"
                          onClick={() => {
                            console.log('Clone Level and Add');
                          }}
                          color={ButtonColor.blue}
                          size={ButtonSize.narrow}
                        />
                      </td>
                      <td>
                        <div>My Level</div>
                      </td>
                      <td>
                        <div>App Lab</div>
                      </td>
                      <td>
                        <div>Hannah</div>
                      </td>
                      <td>
                        <div>Tuesday at 5 pm</div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Button
                          icon="plus"
                          onClick={() => {
                            console.log('Add level');
                          }}
                          color={ButtonColor.blue}
                          size={ButtonSize.narrow}
                        />
                        <Button
                          icon="files-o"
                          onClick={() => {
                            console.log('Clone Level and Add');
                          }}
                          color={ButtonColor.blue}
                          size={ButtonSize.narrow}
                        />
                      </td>
                      <td>
                        <div>Super Awesome Level</div>
                      </td>
                      <td>
                        <div>Sprite Lab</div>
                      </td>
                      <td>
                        <div>Mike</div>
                      </td>
                      <td>
                        <div>5 minutes ago</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div style={styles.rightColumn}>
            <h4>Levels in Progression</h4>
            <div style={styles.levelsBox}>
              {this.props.currentLevels.map(level => (
                <LevelToken2
                  key={level.position + '_' + level.ids[0]}
                  level={level}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter rightAlign>
          <Button
            __useDeprecatedTag
            text={i18n.closeAndSave()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
