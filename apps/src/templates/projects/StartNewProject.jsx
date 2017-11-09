import React, {PropTypes} from 'react';
import NewProjectButtons from './NewProjectButtons.jsx';
import i18n from '@cdo/locale';
import Button from '../Button';
import color from '../../util/color';
import {valueOr} from '../../utils';

const styles = {
  button: {
    float: 'right',
  },
  headingStartNew: {
    paddingRight: 10,
    paddingBottom: 10,
    fontSize: 16,
    fontFamily: '"Gotham 4r"',
    color: color.charcoal,
    marginBottom: -10
  },
  spacer: {
    paddingTop: 10,
    clear: 'both',
    width: '100%'
  }
};

class StartNewProject extends React.Component {
  static propTypes = {
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    isRtl: PropTypes.bool,
    canViewFullList: PropTypes.bool,
    canViewAdvancedTools: PropTypes.bool, // Default: true
  };

  state = {
    showFullList: false,
  };

  toggleShowFullList = () => {
    this.setState({showFullList: !this.state.showFullList});
  };

  render() {
    const { canViewFullList, isRtl } = this.props;
    const canViewAdvancedTools = valueOr(this.props.canViewAdvancedTools, true);
    const { showFullList } = this.state;
    return (
      <div>
        <div style={styles.headingStartNew}>{i18n.projectStartNew()}</div>
        <NewProjectButtons
          projectTypes={this.props.projectTypes}
          isRtl={isRtl}
          canViewAdvancedTools={canViewAdvancedTools}
        />

        {canViewFullList &&
        <Button
          onClick={this.toggleShowFullList}
          color={Button.ButtonColor.gray}
          icon={showFullList ? "caret-up" : "caret-down"}
          text={showFullList ? i18n.hideFullList() : i18n.viewFullList()}
          style={styles.button}
        />
        }

        <div style={{clear: 'both'}}/>

        {showFullList &&
        <div>
          <NewProjectButtons
            description={i18n.projectGroupPlaylab()}
            projectTypes={['playlab', 'infinity', 'gumball', 'iceage']}
          />
          <NewProjectButtons
            description={i18n.projectGroupEvents()}
            projectTypes={['flappy', 'starwarsblocks', 'starwars', 'bounce', 'sports', 'basketball']}
          />
          <NewProjectButtons
            description={i18n.projectGroupArtist()}
            projectTypes={['artist', 'frozen']}
          />
          <NewProjectButtons
            description={i18n.projectGroupMinecraft()}
            projectTypes={['minecraft_designer', 'minecraft_adventurer']}
          />
          {canViewAdvancedTools &&
            <NewProjectButtons
              description={i18n.projectGroupAdvancedTools()}
              projectTypes={['applab', 'gamelab', 'weblab']}
            />
          }
          <NewProjectButtons
            description={i18n.projectGroupPreReader()}
            projectTypes={['playlab_k1', 'artist_k1']}
          />
          <NewProjectButtons
            description={i18n.projectGroupMath()}
            projectTypes={['calc', 'eval']}
          />
        </div>
        }
        <div style={styles.spacer}/>
      </div>
    );
  }
}
export default StartNewProject;
