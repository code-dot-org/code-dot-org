/* React component to handle saving a trained model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setTrainedModelDetail,
  getSelectedColumnDescriptions,
  getDataDescription,
  isUserUploadedDataset
} from "../redux";
import { styles, ModelNameMaxLength } from "../constants";
import Statement from "./Statement";

class SaveModel extends Component {
  static propTypes = {
    trainedModel: PropTypes.object,
    setTrainedModelDetail: PropTypes.func,
    trainedModelDetails: PropTypes.object,
    labelColumn: PropTypes.string,
    columnDescriptions: PropTypes.array,
    saveStatus: PropTypes.string,
    dataDescription: PropTypes.string,
    isUserUploadedDataset: PropTypes.bool
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
      const columnType =
        columnDescription.id === this.props.labelColumn ? "label" : "feature";
      fields.push({
        id: columnDescription.id,
        isColumn: true,
        columnType,
        answer: columnDescription.description
      });
    }
    return fields;
  };

  getUsesFields = () => {
    var fields = [];
    fields.push({
      id: "potentialUses",
      text: "Intended Use:",
      description:
        "Describe the problem you think this model could help solve, or one \
        potential app someone could make with this model.",
      placeholder: "Write a brief description."
    });
    fields.push({
      id: "potentialMisuses",
      text: "Warnings:",
      description:
        "Describe any situations where this model could potentially \
        be misused, or any places where bias could potentially show up in the \
        model. Important questions to consider are:",
      descriptionDetails: [
        "Is there enough data to create an accurate model?",
        "Does the data represent all possible users and scenarios?"
      ],
      placeholder: "Write a brief description."
    });

    return fields;
  };

  render() {
    const nameField = {
      id: "name",
      text: "Model name:"
    };

    const dataDescriptionField = {
      id: "datasetDescription",
      text: "Description:",
      placeholder:
        "How was the data collected? Who collected it? When was it collected?",
      answer: this.props.dataDescription
    };

    const arrowIcon = this.state.showColumnDescriptions
      ? "fa fa-caret-up"
      : "fa fa-caret-down";

    const columnCount = this.getColumnFields().length;

    return (
      <div style={styles.panel}>
        <Statement />
        <div style={styles.scrollableContentsTinted}>
          <div style={styles.scrollingContents}>
            <div key={nameField.id} style={styles.cardRow}>
              <span style={styles.bold}>{nameField.text}</span>{" "}
              <span style={styles.italic}>(required)</span>
              <div>
                <input
                  onChange={event =>
                    this.handleChange(event, nameField.id, nameField.isColumn)
                  }
                  maxLength={ModelNameMaxLength}
                />
              </div>
            </div>
            <div key={dataDescriptionField.id} style={styles.cardRow}>
              <label style={styles.bold}>{dataDescriptionField.text}</label>
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
                style={styles.saveModelToggle}
              >
                <i className={arrowIcon} />
                &nbsp;
                <span style={styles.bold}>Column Descriptions</span> (
                {columnCount})
              </span>
              {this.state.showColumnDescriptions && (
                <div style={styles.saveModelToggleContents}>
                  {this.getColumnFields().map(field => {
                    return (
                      <div key={field.id} style={styles.cardRow}>
                        <div>
                          <span style={styles.bold}>{field.id}</span> (
                          {field.columnType})
                        </div>
                        {!field.answer && (
                          <div>
                            <textarea
                              rows="1"
                              onChange={event =>
                                this.handleChange(
                                  event,
                                  field.id,
                                  field.isColumn
                                )
                              }
                              placeholder={field.placeholder}
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
            <div>
              {this.getUsesFields().map(field => {
                return (
                  <div key={field.id} style={styles.cardRow}>
                    <label style={styles.bold}>{field.text}</label>
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
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    trainedModel: state.trainedModel,
    trainedModelDetails: state.trainedModelDetails,
    labelColumn: state.labelColumn,
    columnDescriptions: getSelectedColumnDescriptions(state),
    saveStatus: state.saveStatus,
    dataDescription: getDataDescription(state),
    isUserUploadedDataset: isUserUploadedDataset(state)
  }),
  dispatch => ({
    setTrainedModelDetail(field, value, isColumn) {
      dispatch(setTrainedModelDetail(field, value, isColumn));
    }
  })
)(SaveModel);
