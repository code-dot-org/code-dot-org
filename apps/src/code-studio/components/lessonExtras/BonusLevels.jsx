import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import color from '../../../util/color';
import i18n from '@cdo/locale';
import {stageOfBonusLevels} from './shapes';
import SublevelCard from '../SublevelCard';

const CARD_AREA_SIZE = 900;
const RadiumFontAwesome = Radium(FontAwesome);

const styles = {
  challengeRow: {
    clear: 'both',
    overflow: 'hidden',
    display: 'inline-block',
    position: 'relative',
    whiteSpace: 'normal',
    transition: 'left 0.25s ease-out',
    paddingBottom: 10
  },
  challenges: {
    display: 'inline-block',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'width 0.1s ease-out',
    verticalAlign: 'top'
  },
  stageNumberHeading: {
    backgroundColor: color.purple,
    width: '100%',
    textAlign: 'center',
    color: color.white,
    fontSize: 20,
    lineHeight: '35px'
  },
  arrow: {
    fontSize: 40,
    cursor: 'pointer',
    verticalAlign: -30,
    margin: 10
  },
  arrowDisabled: {
    color: color.lighter_gray,
    cursor: 'default'
  },
  cards: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: color.white
  },
  scroller: {
    backgroundColor: color.white,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
};

class BonusLevels extends React.Component {
  static propTypes = {
    bonusLevels: PropTypes.arrayOf(PropTypes.shape(stageOfBonusLevels)),
    sectionId: PropTypes.number,
    userId: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      stageIndex: props.bonusLevels.length - 1
    };
  }

  nextStage = () => {
    if (this.state.stageIndex < this.props.bonusLevels.length - 1) {
      this.setState({stageIndex: this.state.stageIndex + 1});
    }
  };

  previousStage = () => {
    if (this.state.stageIndex > 0) {
      this.setState({stageIndex: this.state.stageIndex - 1});
    }
  };

  render() {
    const previousNumStages = this.props.bonusLevels.filter(
      stage =>
        stage.stageNumber <
        this.props.bonusLevels[this.state.stageIndex].stageNumber
    ).length;
    const scrollAmount = -1 * previousNumStages * CARD_AREA_SIZE;

    const leftDisabled = this.state.stageIndex === 0;
    const rightDisabled =
      this.state.stageIndex === this.props.bonusLevels.length - 1;

    return (
      <div>
        <div style={styles.stageNumberHeading}>
          {i18n.extrasStageNChallenges({
            stageNumber: this.props.bonusLevels[this.state.stageIndex]
              .stageNumber
          })}
        </div>
        <div style={styles.scroller}>
          <RadiumFontAwesome
            icon="caret-left"
            onClick={this.previousStage}
            style={[styles.arrow, leftDisabled && styles.arrowDisabled]}
          />
          <div
            style={{
              ...styles.challenges,
              width: CARD_AREA_SIZE
            }}
          >
            {this.props.bonusLevels.map(stage => (
              <div
                key={stage.stageNumber}
                style={{
                  ...styles.challengeRow,
                  left: scrollAmount,
                  width: CARD_AREA_SIZE
                }}
              >
                <div style={styles.cards}>
                  {stage.levels.map(level => (
                    <SublevelCard
                      isLessonExtra={true}
                      sublevel={level}
                      key={level.id}
                      sectionId={this.props.sectionId}
                      userId={this.props.userId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <RadiumFontAwesome
            icon="caret-right"
            onClick={this.nextStage}
            style={[styles.arrow, rightDisabled && styles.arrowDisabled]}
          />
        </div>
      </div>
    );
  }
}

export default Radium(BonusLevels);
