import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import * as Table from 'reactabular-table';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import {Heading1} from '@cdo/apps/lib/ui/Headings';

const PADDING = 20;
const TABLE_WIDTH = 300;
const DIALOG_WIDTH = 800;

const styles = {
  dialog: {
    padding: PADDING,
    width: DIALOG_WIDTH,
    marginLeft: -(DIALOG_WIDTH / 2)
  },
  container: {
    display: 'flex'
  },
  table: {
    width: TABLE_WIDTH,
    margin: 2
  },
  rightColumn: {
    flex: 1,
    paddingLeft: PADDING,
    paddingRight: PADDING
  },
  infoText: {
    paddingTop: PADDING / 4,
    paddingBottom: PADDING / 2
  },
  label: {
    paddingTop: PADDING / 2
  },
  input: {
    marginLeft: PADDING / 2
  }
};

export default class MultiAssignModal extends React.Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,

    columns: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
    options: PropTypes.array.isRequired,
    onChooseOption: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,

    isSaveDisabled: PropTypes.bool,
    isSavePending: PropTypes.bool,
    optionsDescriptionText: PropTypes.string,
    dialogDescriptionText: PropTypes.string,
    titleText: PropTypes.string,
    children: PropTypes.node
  }

  renderOptions = () => {
    const {options} = this.props;
    let selectOptions = options.map(option => {
      return(
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      );
    });
    selectOptions.unshift(<option key="empty" value="" />);
    return selectOptions;
  }

  render() {
    const {
      isDialogOpen,
      closeDialog,
      columns,
      rows,
      onChooseOption,
      onSave,

      isSaveDisabled,
      isSavePending,
      optionsDescriptionText,
      dialogDescriptionText,
      titleText,
      children
    } = this.props;
    return(
      <BaseDialog
        useUpdatedStyles
        isOpen={isDialogOpen}
        style={styles.dialog}
        handleClose={closeDialog}
      >
        {titleText &&
          <Heading1>{titleText}</Heading1>
        }
        <div style={styles.container}>
          <Table.Provider columns={columns} style={styles.table}>
            <Table.Header />
            <Table.Body rows={rows} rowKey="id" />
          </Table.Provider>
          <div style={styles.rightColumn}>
            {dialogDescriptionText &&
              <div style={styles.infoText}>{dialogDescriptionText}</div>
            }
            {optionsDescriptionText &&
              <label htmlFor="selectOption" style={styles.label}>
                {optionsDescriptionText}
              </label>
            }
            <select
              name="selectOption"
              style={styles.input}
              onChange={onChooseOption}
            >
              {this.renderOptions()}
            </select>
            {children}
          </div>
        </div>
        <DialogFooter>
          <Button
            text={i18n.dialogCancel()}
            onClick={closeDialog}
            color={Button.ButtonColor.gray}
          />
          <Button
            text={"Save changes"}
            onClick={onSave}
            color={Button.ButtonColor.orange}
            disabled={isSavePending || isSaveDisabled}
            isPending={isSavePending}
            pendingText={"Saving changes..."}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}