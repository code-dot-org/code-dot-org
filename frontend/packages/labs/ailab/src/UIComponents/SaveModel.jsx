/* React component to handle saving a trained model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setTrainedModelDetail } from "../redux";
import {
  getDatasetDescription,
  isUserUploadedDataset
} from "../helpers/datasetDetails";
import { getSelectedColumnsDescriptions } from "../selectors";
import { styles, ModelNameMaxLength } from "../constants";
import Statement from "./Statement";
import ScrollableContent from "./ScrollableContent";
import I18n from "../i18n";
import { getLocalizedColumnName, getLocalizedColumnDescription } from "../helpers/columnDetails.js";

class SaveModel extends Component {
  static propTypes = {
    trainedModel: PropTypes.object,
    setTrainedModelDetail: PropTypes.func,
    trainedModelDetails: PropTypes.object,
    labelColumn: PropTypes.string,
    columnDescriptions: PropTypes.array,
    dataDescription: PropTypes.string,
    isUserUploadedDataset: PropTypes.bool,
    datasetId: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      showColumnDescriptions: this.props.isUserUploadedDataset
    };
  }

  toggleColumnDescriptions = () => {
    this.setState({
      showColumnDescriptions: !this.state.showColumnDescriptions
    });
  };

  handleChange = (event, field, isColumn) => {
    this.props.setTrainedModelDetail(field, event.target.value, isColumn);
  };

  getColumnFields = () => {
    var fields = [];

    for (const columnDescription of this.props.columnDescriptions) {
      const datasetId = this.props.datasetId;
      const labelType = I18n.t("saveModelColumnTypeLabel");
      const featureType = I18n.t("saveModelColumnTypeFeature");
      const columnType =
        columnDescription.id === this.props.labelColumn ? labelType : featureType
      fields.push({
        id: columnDescription.id,
        isColumn: true,
        columnType,
        answer: getLocalizedColumnDescription(datasetId, columnDescription.description),
        localizedName: getLocalizedColumnName(datasetId, columnDescription.id)
      });
    }
    return fields;
  };

  getUsesFields = () => {
    var fields = [];
    fields.push({
      id: "potentialUses",
      text: I18n.t("potentialUsesLabel"),
      description: I18n.t("potentialUsesDescription"),
      placeholder: I18n.t("potentialUsesPlaceholder")
    });
    fields.push({
      id: "potentialMisuses",
      text: I18n.t("potentialMisusesLabel"),
      description: I18n.t("potentialMisusesDescription"),
      descriptionDetails: [
        I18n.t("potentialMisusesDescriptionRepresent"),
        I18n.t("potentialMisusesDescriptionEnough"),
        I18n.t("potentialMisusesDescriptionSituations")
      ],
      placeholder: I18n.t("potentialMisusesPlaceholder")
    });

    return fields;
  };

  render() {
    const nameField = {
      id: "name",
      text: I18n.t("modelNameLabel")
    };

    const dataDescriptionField = {
      id: "datasetDescription",
      text: I18n.t("datasetDescriptionLabel"),
      placeholder: I18n.t("datasetDescriptionPlaceholder"),
      answer: this.props.dataDescription
    };

    const arrowIcon = this.state.showColumnDescriptions
      ? "fa fa-caret-up"
      : "fa fa-caret-down";

    const columnCount = this.getColumnFields().length;

    return (
      <div id="uitest-model-card-form" style={styles.panel}>
        <Statement />
        <ScrollableContent tinted={true}>
          <div key={nameField.id} style={styles.cardRow}>
            <span style={styles.bold}>{nameField.text}</span>
            &nbsp;
            <span style={styles.italic}>({I18n.t("saveModelFieldRequired")})</span>
            <div>
              <input
                id="uitest-model-name-input"
                onChange={event =>
                  this.handleChange(event, nameField.id, nameField.isColumn)
                }
                maxLength={ModelNameMaxLength}
              />
            </div>
          </div>
          <div>
            {this.getUsesFields().map(field => {
              return (
                <div key={field.id} style={styles.cardRow}>
                  <div style={styles.bold}>{field.text}</div>
                  <div>{field.description}</div>
                  <ul>
                    {field.descriptionDetails &&
                      field.descriptionDetails.map((detail, index) => {
                        return (
                          <li style={styles.regularText} key={index}>
                            {detail}
                          </li>
                        );
                      })}
                  </ul>
                  {!field.answer && (
                    <div>
                      <textarea
                        rows="4"
                        onChange={event =>
                          this.handleChange(event, field.id, field.isColumn)
                        }
                        placeholder={field.placeholder}
                        style={styles.saveInputsWidth}
                      />
                    </div>
                  )}
                  {field.answer && <div>{field.answer}</div>}
                </div>
              );
            })}
          </div>
          <div key={dataDescriptionField.id} style={styles.cardRow}>
            <div style={styles.bold}>{dataDescriptionField.text}</div>
            {this.props.isUserUploadedDataset && (
              <div>
                <textarea
                  rows="4"
                  onChange={event =>
                    this.handleChange(event, dataDescriptionField.id, false)
                  }
                  placeholder={dataDescriptionField.placeholder}
                  style={styles.saveInputsWidth}
                />
              </div>
            )}
            {!this.props.isUserUploadedDataset && (
              <div>{dataDescriptionField.answer}</div>
            )}
          </div>
          <div>
            <span
              onClick={this.toggleColumnDescriptions}
              onKeyDown={this.toggleColumnDescriptions}
              style={styles.saveModelToggle}
              role="button"
              tabIndex={0}
            >
              <i className={arrowIcon} />
              &nbsp;
              <span style={styles.bold}>{I18n.t("saveModelColumnCountLabel")}</span>
              &nbsp;
              ({columnCount})
            </span>
            {this.state.showColumnDescriptions && (
              <div style={styles.saveModelToggleContents}>
                {this.getColumnFields().map(field => {
                  return (
                    <div key={field.id} style={styles.cardRow}>
                      <div>
                        <span style={styles.bold}>{field.localizedName}</span> (
                        {field.columnType})
                      </div>
                      {this.props.isUserUploadedDataset && (
                        <div>
                          <textarea
                            rows="1"
                            onChange={event =>
                              this.handleChange(event, field.id, field.isColumn)
                            }
                            placeholder={field.placeholder}
                            value={field.answer || ""}
                            style={styles.saveInputsWidth}
                          />
                        </div>
                      )}
                      {!this.props.isUserUploadedDataset && (
                        <div>{field.answer}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollableContent>
      </div>
    );
  }
}

export default connect(
  state => ({
    trainedModel: state.trainedModel,
    trainedModelDetails: state.trainedModelDetails,
    labelColumn: state.labelColumn,
    columnDescriptions: getSelectedColumnsDescriptions(state),
    dataDescription: getDatasetDescription(state),
    isUserUploadedDataset: isUserUploadedDataset(state),
    datasetId: state.metadata && state.metadata.name
  }),
  dispatch => ({
    setTrainedModelDetail(field, value, isColumn) {
      dispatch(setTrainedModelDetail(field, value, isColumn));
    }
  })
)(SaveModel);
