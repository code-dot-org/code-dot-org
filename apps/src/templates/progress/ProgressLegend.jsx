import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {
  BasicBubble,
  BubbleShape,
  BasicTooltip,
  BubbleSize
} from './BubbleFactory';
import {BubbleBadgeWrapper, KeepWorkingBadge} from './BubbleBadge';
import {defaultBubbleIcon} from './progressHelpers';
import {levelProgressStyle} from './progressStyles';
import FontAwesome from '../FontAwesome';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import _ from 'lodash';
export default class ProgressLegend extends Component {
  static propTypes = {
    includeCsfColumn: PropTypes.bool.isRequired,
    includeProgressNotApplicable: PropTypes.bool,
    includeReviewState: PropTypes.bool
  };

  static defaultProps = {
    includeReviewState: true
  };

  render() {
    const statusColumns = this.getLevelStatusColumns();
    const detailColumns = this.getLevelDetailsColumns();

    return (
      <div style={styles.container}>
        {this.renderTable(detailColumns, statusColumns)}
      </div>
    );
  }

  renderTable(detailColumns, statusColumns) {
    if (detailColumns && statusColumns?.length > 6) {
      return (
        <div>
          {this.renderTable(null, statusColumns)}
          {this.renderTable(detailColumns, null)}
        </div>
      );
    }

    let columns = [this.getLevelTypeColumn()];
    detailColumns && (columns = columns.concat(detailColumns));
    statusColumns && (columns = columns.concat(statusColumns));

    // transpose rows into columns
    const rows = _.zip(...columns);

    return (
      <table style={styles.table} className="progress-legend">
        <thead>
          <tr style={styles.header}>
            <TD style={styles.headerCell}>{i18n.levelType()}</TD>
            {detailColumns && (
              <TD style={styles.headerCell} colSpan={3}>
                {i18n.levelDetails()}
              </TD>
            )}
            {statusColumns && (
              <TD style={styles.headerCell} colSpan={statusColumns.length}>
                {i18n.levelStatus()}
              </TD>
            )}
          </tr>
          {statusColumns && (
            <tr style={styles.secondRow}>{rows[0].map(cell => cell)}</tr>
          )}
        </thead>
        <tbody>
          <tr style={styles.subsequentRow}>{rows[1].map(cell => cell)}</tr>
          <tr style={styles.subsequentRow}>{rows[2].map(cell => cell)}</tr>
        </tbody>
      </table>
    );
  }

  getLevelStatusColumns() {
    const {
      includeCsfColumn,
      includeProgressNotApplicable,
      includeReviewState
    } = this.props;

    const columns = [];
    includeProgressNotApplicable && columns.push(this.getProgressNAColumn());
    columns.push(this.getNotStartedColumn());
    columns.push(this.getInProgressColumn());
    includeReviewState && columns.push(this.getKeepWorkingColumn());
    includeReviewState && columns.push(this.getNeedsReviewColumn());
    includeCsfColumn && columns.push(this.getTooManyBlocksColumn());
    columns.push(this.getPerfectColumn());
    columns.push(this.getAssessmentsColumn());

    return columns;
  }

  getLevelDetailsColumns() {
    const column1 = [
      <TD />,
      <TD>
        <div style={styles.iconAndText}>
          <FontAwesome icon="file-text" style={styles.icon} />
          {i18n.text()}
        </div>
      </TD>,
      <TD>
        <div style={styles.iconAndTextDivTop}>
          <FontAwesome icon="scissors" style={styles.icon} />
          {i18n.unplugged()}
        </div>
        <div style={styles.iconAndTextDivBottom}>
          <FontAwesome icon="flag-checkered" style={styles.icon} />
          {i18n.stageExtras()}
        </div>
      </TD>
    ];
    const column2 = [
      <TD />,
      <TD>
        <div style={styles.iconAndText}>
          <FontAwesome icon="video-camera" style={styles.icon} />
          {i18n.video()}
        </div>
      </TD>,
      <TD>
        <div style={styles.iconAndTextDivTop}>
          <FontAwesome icon="desktop" style={styles.icon} />
          {i18n.online()}
        </div>
        <div style={styles.iconAndTextDivBottom}>
          <FontAwesome icon="check-circle" style={styles.icon} />
          {i18n.progressLegendAssessment()}
        </div>
      </TD>
    ];
    const column3 = [
      <TD />,
      <TD style={styles.endBorder}>
        <div style={styles.iconAndText}>
          <FontAwesome icon="map" style={styles.icon} />
          {i18n.map()}
        </div>
      </TD>,
      <TD style={styles.endBorder}>
        <div style={styles.iconAndTextDivTop}>
          <FontAwesome icon="list-ul" style={styles.icon} />
          {i18n.question()}
        </div>
        <div style={styles.iconAndTextDivBottom}>
          <FontAwesome icon="sitemap" style={styles.icon} />
          {i18n.choiceLevel()}
        </div>
      </TD>
    ];
    return [column1, column2, column3];
  }

  getLevelTypeColumn() {
    return [
      <TD key={_.uniqueId()} />,
      <TD key={_.uniqueId()} style={styles.endBorder}>
        {i18n.concept()}
      </TD>,
      <TD key={_.uniqueId()} style={styles.endBorder}>
        {i18n.activity()}
      </TD>
    ];
  }

  getProgressNAColumn() {
    return [
      <TD key={_.uniqueId()}>
        {i18n.progress()}
        <br />
        {i18n.notApplicable()}
      </TD>,
      <TD key={_.uniqueId()}>
        <div style={styles.center}>—</div>
      </TD>,
      <TD key={_.uniqueId()} rowSpan={2}>
        <div style={styles.center}>—</div>
      </TD>
    ];
  }

  getNotStartedColumn() {
    return [
      <TD key={_.uniqueId()}>{i18n.notStarted()}</TD>,
      <TD key={_.uniqueId()}>
        <div style={styles.center}>
          {this.getBubble(
            LevelStatus.not_tried,
            true,
            `${i18n.concept()}: ${i18n.notStarted()}`
          )}
        </div>
      </TD>,
      <TD key={_.uniqueId()}>
        <div style={styles.center}>
          {this.getBubble(
            LevelStatus.not_tried,
            false,
            `${i18n.activity()}: ${i18n.notStarted()}`
          )}
        </div>
      </TD>
    ];
  }

  getInProgressColumn() {
    return [
      <TD key={_.uniqueId()}>{i18n.inProgress()}</TD>,
      <TD key={_.uniqueId()}>
        <div style={styles.center}>
          {this.getBubble(
            LevelStatus.attempted,
            true,
            `${i18n.concept()}: ${i18n.inProgress()}`
          )}
        </div>
      </TD>,
      <TD key={_.uniqueId()} rowSpan={2}>
        <div style={styles.center}>
          {this.getBubble(
            LevelStatus.attempted,
            false,
            `${i18n.activity()}: ${i18n.inProgress()}`
          )}
        </div>
      </TD>
    ];
  }

  getKeepWorkingColumn() {
    return [
      <TD key={_.uniqueId()}>{i18n.keepWorking()}</TD>,
      this.getNotApplicableCell(),
      <TD key={_.uniqueId()} rowSpan={2}>
        <div style={styles.center}>
          {this.getBubble(
            LevelStatus.attempted,
            false,
            `${i18n.activity()}: ${i18n.keepWorking()}`,
            true
          )}
        </div>
      </TD>
    ];
  }

  getNeedsReviewColumn() {
    return [
      <TD key={_.uniqueId()}>{i18n.needsReview()}</TD>,
      this.getNotApplicableCell(),
      <TD key={_.uniqueId()} rowSpan={2}>
        <div style={styles.center}>
          {this.getBubble(
            LevelStatus.perfect,
            false,
            `${i18n.activity()}: ${i18n.needsReview()}`,
            true
          )}
        </div>
      </TD>
    ];
  }

  getTooManyBlocksColumn() {
    return [
      <TD key={_.uniqueId()}>
        <div>{i18n.completed()}</div>
        <div style={styles.secondaryText}>({i18n.tooManyBlocks()})</div>
      </TD>,
      this.getNotApplicableCell(),
      <TD key={_.uniqueId()} rowSpan={2}>
        <div style={styles.center}>
          {this.getBubble(
            LevelStatus.passed,
            false,
            `${i18n.activity()}: ${i18n.completed()} (${i18n.tooManyBlocks()})`
          )}
        </div>
      </TD>
    ];
  }

  getPerfectColumn() {
    return [
      <TD key={_.uniqueId()}>
        <div>{i18n.completed()}</div>
        {this.props.includeCsfColumn && (
          <div style={styles.secondaryText}>({i18n.perfect()})</div>
        )}
      </TD>,
      <TD key={_.uniqueId()}>
        <div style={styles.center}>
          {this.getBubble(
            LevelStatus.perfect,
            true,
            `${i18n.concept()}: ${i18n.completed()} (${i18n.perfect()})`
          )}
        </div>
      </TD>,
      <TD key={_.uniqueId()} rowSpan={2}>
        <div style={styles.center}>
          {this.getBubble(
            LevelStatus.perfect,
            false,
            `${i18n.activity()}: ${i18n.completed()} (${i18n.perfect()})`
          )}
        </div>
      </TD>
    ];
  }

  getAssessmentsColumn() {
    return [
      <TD key={_.uniqueId()}>{i18n.assessmentAndSurvey()}</TD>,
      this.getNotApplicableCell(),
      <TD key={_.uniqueId()} rowSpan={2}>
        <div style={styles.center}>
          {this.getBubble(
            LevelStatus.submitted,
            false,
            `${i18n.activity()}: ${i18n.submitted()}`
          )}
        </div>
      </TD>
    ];
  }

  getNotApplicableCell() {
    return <TD key={_.uniqueId()}>{i18n.notApplicable()}</TD>;
  }

  getBubble(status, isConcept, text, includeKeepWorkingBadge = false) {
    return (
      <BasicTooltip icon={defaultBubbleIcon} text={text}>
        <BasicBubble
          shape={isConcept ? BubbleShape.diamond : BubbleShape.circle}
          size={BubbleSize.full}
          progressStyle={levelProgressStyle(status)}
        >
          {includeKeepWorkingBadge && (
            <BubbleBadgeWrapper isDiamond={isConcept}>
              <KeepWorkingBadge />
            </BubbleBadgeWrapper>
          )}
        </BasicBubble>
      </BasicTooltip>
    );
  }
}

const styles = {
  container: {
    marginTop: 60
  },
  table: {
    textAlign: 'center',
    marginBottom: 20,
    // Margin to get it to line up with ProgressLesson
    marginLeft: 3,
    marginRight: 3
  },
  tdStyle: {
    padding: 10,
    borderStyle: 'none'
  },
  header: {
    backgroundColor: color.white,
    color: color.charcoal,
    whiteSpace: 'nowrap'
  },
  secondRow: {
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    borderWidth: 2,
    borderColor: color.lightest_gray,
    borderStyle: 'solid',
    verticalAlign: 'top'
  },
  subsequentRow: {
    backgroundColor: color.white,
    borderWidth: 2,
    borderColor: color.lightest_gray,
    borderStyle: 'solid'
  },
  endBorder: {
    borderInlineEnd: 'solid',
    borderWidth: 2,
    borderColor: color.lightest_gray
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 18
  },
  secondaryText: {
    fontSize: 10
  },
  iconAndText: {
    whiteSpace: 'nowrap'
  },
  iconAndTextDiv: {
    whiteSpace: 'nowrap',
    paddingBottom: 16
  },
  iconAndTextDivTop: {
    whiteSpace: 'nowrap',
    paddingTop: 10,
    paddingBottom: 16
  },
  iconAndTextDivBottom: {
    whiteSpace: 'nowrap',
    paddingBottom: 10
  },
  icon: {
    marginInlineEnd: 5,
    size: 20
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

// Give all of our TDs a padding
const TD = ({style, ...props}) => (
  <td
    style={{
      ...styles.tdStyle,
      ...style
    }}
    {...props}
  />
);
TD.propTypes = {
  style: PropTypes.object
};
