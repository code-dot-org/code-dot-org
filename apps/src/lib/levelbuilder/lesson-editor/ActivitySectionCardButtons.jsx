import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AddLevelDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelDialog';
import UploadImageDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/UploadImageDialog';
import LessonTipIconWithTooltip from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonTipIconWithTooltip';
import FindProgrammingExpressionDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/FindProgrammingExpressionDialog';
import FindResourceDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/FindResourceDialog';
import FindVocabularyDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/FindVocabularyDialog';
import EditTipDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/EditTipDialog';
import {
  activitySectionShape,
  vocabularyShape
} from '@cdo/apps/lib/levelbuilder/shapes';
import {connect} from 'react-redux';
import {
  addTip,
  updateTip,
  removeTip
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';

const AddButton = function(props) {
  let className = 'btn';
  if (props.className) {
    className += ' ' + props.className;
  }

  return (
    <button
      onClick={props.handler}
      className={className}
      style={styles.addButton}
      type="button"
    >
      <i style={{marginRight: 7}} className="fa fa-plus-circle" />
      {props.displayText}
    </button>
  );
};

AddButton.propTypes = {
  className: PropTypes.string,
  displayText: PropTypes.string.isRequired,
  handler: PropTypes.func
};

class ActivitySectionCardButtons extends Component {
  static propTypes = {
    activitySection: activitySectionShape.isRequired,
    activityPosition: PropTypes.number.isRequired,
    addTip: PropTypes.func.isRequired,
    addLevel: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired,
    updateTip: PropTypes.func.isRequired,
    removeTip: PropTypes.func.isRequired,
    appendProgrammingExpressionLink: PropTypes.func.isRequired,
    appendResourceLink: PropTypes.func.isRequired,
    appendVocabularyLink: PropTypes.func.isRequired,
    appendSlide: PropTypes.func.isRequired,
    hasLessonPlan: PropTypes.bool.isRequired,
    vocabularies: PropTypes.arrayOf(vocabularyShape).isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      editingExistingTip: false,
      addProgrammingExpressionOpen: false,
      addResourceOpen: false,
      addVocabularyOpen: false,
      addLevelOpen: false,
      uploadImageOpen: false,
      tipToEdit: null
    };
  }

  handleOpenAddLevel = () => {
    this.setState({addLevelOpen: true});
  };

  handleCloseAddLevel = () => {
    this.setState({addLevelOpen: false});
  };

  handleOpenUploadImage = () => {
    this.setState({uploadImageOpen: true});
  };

  handleCloseUploadImage = () => {
    this.setState({uploadImageOpen: false});
  };

  handleEditTip = tip => {
    this.setState({tipToEdit: tip, editingExistingTip: true});
  };

  handleOpenAddTip = () => {
    this.setState({
      tipToEdit: {
        key: this.generateTipKey(),
        type: 'teachingTip',
        markdown: ''
      }
    });
  };

  generateTipKey = () => {
    let tipNumber = this.props.activitySection.tips.length + 1;
    while (
      this.props.activitySection.tips.some(
        tip => tip.key === `tip-${tipNumber}`
      )
    ) {
      tipNumber++;
    }

    return `tip-${tipNumber}`;
  };

  handleCloseAddTip = tip => {
    /*
      If no tip was provided then user exited without saving
      and we should not update the tips
    */
    if (tip) {
      this.state.editingExistingTip
        ? this.props.updateTip(
            this.props.activityPosition,
            this.props.activitySection.position,
            tip
          )
        : this.props.addTip(
            this.props.activityPosition,
            this.props.activitySection.position,
            tip
          );
    }
    this.setState({tipToEdit: null, editingExistingTip: false});
  };

  handleOpenAddProgrammingExpression = () => {
    this.setState({addProgrammingExpressionOpen: true});
  };

  handleOpenAddResource = () => {
    this.setState({addResourceOpen: true});
  };

  handleOpenAddVocabulary = () => {
    this.setState({addVocabularyOpen: true});
  };

  handleAddSlide = () => {
    this.props.appendSlide();
  };

  handleCloseAddProgrammingExpression = programmingExpression => {
    this.setState(
      {addProgrammingExpressionOpen: false},
      this.props.appendProgrammingExpressionLink(programmingExpression)
    );
  };

  handleCloseAddResource = resourceKey => {
    this.setState(
      {addResourceOpen: false},
      this.props.appendResourceLink(resourceKey)
    );
  };

  handleCloseAddVocabulary = vocabularyKey => {
    this.setState(
      {addVocabularyOpen: false},
      this.props.appendVocabularyLink(vocabularyKey)
    );
  };

  handleDeleteTip = tipKey => {
    this.props.removeTip(
      this.props.activityPosition,
      this.props.activitySection.position,
      tipKey
    );
  };

  render() {
    return (
      <div>
        <div style={styles.bottomControls}>
          <span>
            <AddButton
              className="uitest-open-add-level-button"
              displayText="Level"
              handler={this.handleOpenAddLevel}
            />
            {this.props.hasLessonPlan && (
              <span>
                <AddButton
                  displayText="Callout"
                  handler={this.handleOpenAddTip}
                />
                <AddButton
                  displayText="Code Doc"
                  handler={this.handleOpenAddProgrammingExpression}
                />
                <AddButton
                  displayText="Resource"
                  handler={this.handleOpenAddResource}
                />
                {this.props.vocabularies.length > 0 && (
                  <AddButton
                    displayText="Vocab"
                    handler={this.handleOpenAddVocabulary}
                  />
                )}
                <AddButton displayText="Slide" handler={this.handleAddSlide} />
                <AddButton
                  displayText="Image"
                  handler={this.handleOpenUploadImage}
                />
              </span>
            )}
          </span>
          {this.props.hasLessonPlan &&
            this.props.activitySection.tips.length > 0 && (
              <span>
                {this.props.activitySection.tips.map(tip => (
                  <LessonTipIconWithTooltip
                    tip={tip}
                    key={tip.key}
                    onClick={this.handleEditTip}
                  />
                ))}
              </span>
            )}
        </div>
        {this.props.hasLessonPlan && (
          <div>
            <FindResourceDialog
              isOpen={this.state.addResourceOpen}
              handleConfirm={this.handleCloseAddResource}
              handleClose={() => this.setState({addResourceOpen: false})}
            />
            <FindVocabularyDialog
              isOpen={this.state.addVocabularyOpen}
              handleConfirm={this.handleCloseAddVocabulary}
              handleClose={() => this.setState({addVocabularyOpen: false})}
              vocabularies={this.props.vocabularies}
            />
            <FindProgrammingExpressionDialog
              isOpen={this.state.addProgrammingExpressionOpen}
              handleConfirm={this.handleCloseAddProgrammingExpression}
              handleClose={() =>
                this.setState({addProgrammingExpressionOpen: false})
              }
            />
            {/* Prevent dialog from trying to render when there is no tip to edit*/}
            {this.state.tipToEdit && (
              <EditTipDialog
                isOpen={true}
                handleConfirm={this.handleCloseAddTip}
                tip={this.state.tipToEdit}
                handleDelete={this.handleDeleteTip}
              />
            )}
          </div>
        )}

        <AddLevelDialog
          isOpen={this.state.addLevelOpen}
          handleConfirm={this.handleCloseAddLevel}
          addLevel={this.props.addLevel}
          activitySection={this.props.activitySection}
          activityPosition={this.props.activityPosition}
        />

        <UploadImageDialog
          isOpen={this.state.uploadImageOpen}
          handleClose={this.handleCloseUploadImage}
          uploadImage={this.props.uploadImage}
        />
      </div>
    );
  }
}

const styles = {
  bottomControls: {
    height: 30,
    display: 'flex',
    justifyContent: 'space-between'
  },
  addButton: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '0 5px 0 0'
  }
};

export const UnconnectedActivitySectionCardButtons = ActivitySectionCardButtons;

export default connect(
  state => ({
    vocabularies: state.vocabularies
  }),
  {
    addTip,
    updateTip,
    removeTip
  }
)(ActivitySectionCardButtons);
