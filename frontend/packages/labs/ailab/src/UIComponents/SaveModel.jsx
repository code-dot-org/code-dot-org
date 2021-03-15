/* React component to handle saving a trained model. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setTrainedModelDetail, getSelectedColumnDescriptions } from "../redux";
import { styles, saveMessages } from "../constants";

class SaveModel extends Component {
  static propTypes = {
    trainedModel: PropTypes.object,
    setTrainedModelDetail: PropTypes.func,
    trainedModelDetails: PropTypes.object,
    labelColumn: PropTypes.string,
    columnDescriptions: PropTypes.array,
    saveStatus: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      showColumnDescriptions: false
    };
  }

  toggleColumnDescriptions = () => {
    this.setState({showColumnDescriptions: !this.state.showColumnDescriptions})
  };

  handleChange = (event, field, isColumn) => {
    this.props.setTrainedModelDetail(field, event.target.value, isColumn);
  };

  getColumnFields = () => {
    var fields = [];

    for (const columnDescription of this.props.columnDescriptions) {
      fields.push({
        id: columnDescription.id,
        isColumn: true,
        text: "Description for: " + columnDescription.id,
        answer: columnDescription.description
      });
    }
    return fields;
  }

  getUsesFields = () => {
    var fields = [];
    fields.push({
      id: "potentialUses",
      text: "How can this model be used?",
      placeholder: "Write a brief description."
    });
    fields.push({
      id: "potentialMisuses",
      text: "How can this model be potentially misused?",
      description: "Consider whether this model was trained on data that can identify subgroups, whether the data has adequate representation of subgroups, and whether this data could be used to inform decisions central to human life.",
      placeholder: "Write a brief description."
    });

    return fields;
  };

  render() {
    const nameField = {
      id: "name",
      text: "What will you name the model? (required)"
    };

    const arrowIcon = this.state.showColumnDescriptions
      ? 'fa fa-caret-up' : 'fa fa-caret-down';

    const columnCount = this.getColumnFields().length;

    return (
      <div style={styles.panel}>
        <div style={styles.largeText}>Model Details</div>
        <div style={styles.scrollableContentsTinted}>
          <div style={styles.scrollingContents}>
            <div key={nameField.id} style={styles.cardRow}>
              <label>{nameField.text}</label>
              <div>
                <textarea
                  rows="1"
                  onChange={event =>
                    this.handleChange(event, field.id, field.isColumn)
                  }
                />
              </div>
            </div>
            <div>
              <span onClick={this.toggleColumnDescriptions}>
                <i className={arrowIcon}/>
                <span> Column Descriptions ({columnCount})</span>
              </span>
              {this.state.showColumnDescriptions && (
                <div>
                  {this.getColumnFields().map(field => {
                    return (
                      <div key={field.id} style={styles.cardRow}>
                        <label>{field.text}</label>
                        {!field.answer && (
                          <div>
                            <textarea
                              rows="1"
                              onChange={event =>
                                this.handleChange(event, field.id, field.isColumn)
                              }
                              placeholder={field.placeholder}
                            />
                          </div>
                        )}
                        {field.answer && (
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
                    <label>{field.text}</label>
                    <div>{field.description}</div>
                    {!field.answer && (
                      <div>
                        <textarea
                          rows="4"
                          onChange={event =>
                            this.handleChange(event, field.id, field.isColumn)
                          }
                          placeholder={field.placeholder}
                          style={styles.ninetyFiveWidth}
                        />
                      </div>
                    )}
                    {field.answer && (
                      <div>{field.answer}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          {this.props.saveStatus && (
            <div style={{ position: "absolute", bottom: 0 }}>
              {saveMessages[this.props.saveStatus]}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    trainedModel: state.trainedModel,
    trainedModelDetails: state.trainedModelDetails,
    columnDescriptions: getSelectedColumnDescriptions(state),
    saveStatus: state.saveStatus
  }),
  dispatch => ({
    setTrainedModelDetail(field, value, isColumn) {
      dispatch(setTrainedModelDetail(field, value, isColumn));
    }
  })
)(SaveModel);
