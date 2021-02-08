/* React component to handle saving a trained model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setTrainedModelDetail,
  getTrainedModelDataToSave,
  getSelectedColumnDescriptions
} from "../redux";
import { styles } from "../constants";

class SaveModel extends Component {
  static propTypes = {
    saveTrainedModel: PropTypes.func,
    trainedModel: PropTypes.object,
    setTrainedModelDetail: PropTypes.func,
    trainedModelDetails: PropTypes.object,
    dataToSave: PropTypes.object,
    labelColumn: PropTypes.string,
    columnDescriptions: PropTypes.array
  };

  handleChange = (event, field, isColumn) => {
    this.props.setTrainedModelDetail(field, event.target.value, isColumn);
  };

  onClickSave = () => {
    if (this.props.trainedModelDetails.name !== undefined) {
      this.props.saveTrainedModel(this.props.dataToSave);
    }
  };

  getFields = () => {
    var fields = [];

    fields.push({ id: "name", text: "Name" });

    for (const columnDescription of this.props.columnDescriptions) {
      fields.push({
        id: columnDescription.id,
        isColumn: true,
        text: "Describe " + columnDescription.id,
        answer: columnDescription.description
      });
    }

    fields.push({ id: "potentialUses", text: "How can this model be used?" });
    fields.push({
      id: "potentialMisuses",
      text: "How can this model be potentially misused?"
    });
    fields.push({
      id: "identifySubgroup",
      type: "checkbox",
      text: "Has this model been trained on data that can identify a subgroup?"
    });
    fields.push({
      id: "representSubgroup",
      type: "checkbox",
      text: "Have we ensured the data has adequate representation of subgroups?"
    });
    fields.push({
      id: "decisionsLife",
      type: "checkbox",
      text:
        "Could this model be used to inform decisions central to human life?"
    });

    return fields;
  };

  render() {
    return (
      <div>
        <div style={{ ...styles.subPanel, overflow: "hidden" }}>
          {this.getFields().map(field => {
            return (
              <div
                key={field.id}
                style={{ clear: "both", overflow: "hidden", padding: 5 }}
              >
                {field.type === "checkbox" && (
                  <input
                    type="checkbox"
                    onChange={event => this.handleChange(event, field.id)}
                  />
                )}

                <label>{field.text}</label>

                {field.type !== "checkbox" && !field.answer && (
                  <div style={{ width: "100%" }}>
                    <textarea
                      rows="2"
                      style={{ width: "100%" }}
                      onChange={event =>
                        this.handleChange(event, field.id, field.isColumn)
                      }
                    />
                  </div>
                )}

                {field.type !== "checkbox" && field.answer && (
                  <div style={{ width: "100%" }}>{field.answer}</div>
                )}
              </div>
            );
          })}
        </div>

        <button type="button" onClick={this.onClickSave}>
          Save Trained Model
        </button>
      </div>
    );
  }
}

export default connect(
  state => ({
    trainedModel: state.trainedModel,
    trainedModelDetails: state.trainedModelDetails,
    dataToSave: getTrainedModelDataToSave(state),
    columnDescriptions: getSelectedColumnDescriptions(state)
  }),
  dispatch => ({
    setTrainedModelDetail(field, value, isColumn) {
      dispatch(setTrainedModelDetail(field, value, isColumn));
    }
  })
)(SaveModel);
