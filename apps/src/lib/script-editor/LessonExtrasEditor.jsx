import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  }
};

/**
 * Component for editing lesson extras settings on scripts
 */
export default class LessonExtrasEditor extends React.Component {
  static propTypes = {
    projectWidgetVisible: PropTypes.bool,
    projectWidgetTypes: PropTypes.arrayOf(PropTypes.string),
    lessonExtrasAvailable: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      lessonExtras: this.props.lessonExtrasAvailable
    };
  }

  handleClearProjectWidgetSelectClick = () => {
    $(this.projectWidgetSelect)
      .children('option')
      .removeAttr('selected', true);
  };

  render() {
    return (
      <div>
        <label>
          Allow Teachers to Enable Lesson Extras
          <input
            name="lesson_extras_available"
            type="checkbox"
            checked={this.state.lessonExtras}
            style={styles.checkbox}
            onChange={e => this.setState({lessonExtras: e.target.checked})}
          />
          <HelpTip>
            <p>
              If also enabled by the teacher, show the lesson extras page at the
              end of each lesson.
            </p>
          </HelpTip>
        </label>
        {this.state.lessonExtras && (
          <div>
            <label>
              Project widget visible
              <input
                name="project_widget_visible"
                type="checkbox"
                defaultChecked={this.props.projectWidgetVisible}
                style={styles.checkbox}
              />
              <HelpTip>
                <p>
                  If checked this script will have the projects widget (recent
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
                name="project_widget_types[]"
                multiple
                defaultValue={this.props.projectWidgetTypes}
                ref={select => (this.projectWidgetSelect = select)}
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
