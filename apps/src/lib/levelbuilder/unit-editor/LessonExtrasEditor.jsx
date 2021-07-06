import PropTypes from 'prop-types';
import React from 'react';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

/**
 * Component for editing lesson extras settings on units
 */
export default class LessonExtrasEditor extends React.Component {
  static propTypes = {
    projectWidgetVisible: PropTypes.bool,
    projectWidgetTypes: PropTypes.arrayOf(PropTypes.string),
    lessonExtrasAvailable: PropTypes.bool,
    updateLessonExtrasAvailable: PropTypes.func.isRequired,
    updateProjectWidgetVisible: PropTypes.func.isRequired,
    updateProjectWidgetTypes: PropTypes.func.isRequired
  };

  handleClearProjectWidgetSelectClick = () => {
    this.props.updateProjectWidgetTypes([]);
  };

  handleChangeProjectWidgetTypes = e => {
    var options = e.target.options;
    var projectWidgetTypes = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        projectWidgetTypes.push(options[i].value);
      }
    }
    this.props.updateProjectWidgetTypes(projectWidgetTypes);
  };

  render() {
    return (
      <div>
        <label>
          Allow Teachers to Enable Lesson Extras
          <input
            type="checkbox"
            checked={this.props.lessonExtrasAvailable}
            style={styles.checkbox}
            onChange={e => this.props.updateLessonExtrasAvailable(e)}
          />
          <HelpTip>
            <p>
              If also enabled by the teacher, show the lesson extras page at the
              end of each lesson.
            </p>
          </HelpTip>
        </label>
        {this.props.lessonExtrasAvailable && (
          <div>
            <label>
              Project widget visible
              <input
                type="checkbox"
                checked={this.props.projectWidgetVisible}
                style={styles.checkbox}
                onChange={this.props.updateProjectWidgetVisible}
              />
              <HelpTip>
                <p>
                  If checked this unit will have the projects widget (recent
                  projects and new project buttons) visible in lesson extras.
                </p>
              </HelpTip>
            </label>
            <label>
              Project widget new project types
              <p>
                Select up to 4 project type options to appear in the 'Start a
                new project' section. Select
                <a onClick={this.handleClearProjectWidgetSelectClick}> none </a>
                or shift-click or cmd-click to select multiple.
              </p>
              <select
                multiple
                value={this.props.projectWidgetTypes}
                onChange={this.handleChangeProjectWidgetTypes}
              >
                <option value="playlab">Play Lab</option>
                <option value="playlab_k1">Play Lab K1</option>
                <option value="artist">Artist</option>
                <option value="artist_k1">Artist K1</option>
                <option value="applab">App Lab</option>
                <option value="gamelab">Game Lab</option>
                <option value="weblab">Web Lab</option>
                <option value="calc">Calc</option>
                <option value="eval">Eval</option>
                <option value="frozen">Frozen</option>
                <option value="minecraft_adventurer">
                  Minecraft Adventurer
                </option>
                <option value="minecraft_designer">Minecraft Designer</option>
                <option value="minecraft_hero">Minecraft Hero</option>
                <option value="starwars">Star Wars</option>
                <option value="starwarsblocks">Star Wars Blocks</option>
                <option value="flappy">Flappy</option>
                <option value="sports">Sports</option>
                <option value="basketball">Basketball</option>
                <option value="bounce">Bounce</option>
                <option value="infinity">Infinity</option>
                <option value="iceage">Ice Age</option>
                <option value="gumball">Gumball</option>
              </select>
            </label>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  }
};
