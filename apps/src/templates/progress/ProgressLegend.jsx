import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import BubbleBadge, {BadgeType} from './BubbleBadge';
import {
  BasicBubble,
  BubbleShape,
  BasicTooltip,
  BubbleSize,
} from './BubbleFactory';
import {defaultBubbleIcon} from './progressHelpers';
import {levelProgressStyle} from './progressStyles';

import './styles.scss';

const MAX_UNSPLIT_STATUS_COLUMNS = 5;

export default class ProgressLegend extends Component {
  static propTypes = {
    includeCsfColumn: PropTypes.bool.isRequired,
    includeProgressNotApplicable: PropTypes.bool,
    includeReviewStates: PropTypes.bool,
  };

  render() {
    const statusColumns = this.getLevelStatusColumns();
    const detailColumns = this.getLevelDetailsColumns();

    return this.renderTable(detailColumns, statusColumns);
  }

  renderTable(detailColumns, statusColumns) {
    // If we have too many status columns to show in the width allowed,
    // we split the table in two.
    if (detailColumns && statusColumns?.length > MAX_UNSPLIT_STATUS_COLUMNS) {
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
      <table className="progress-legend">
        <thead>
          <tr>
            <td>{i18n.levelType()}</td>
            {detailColumns && <td colSpan={3}>{i18n.levelDetails()}</td>}
            {statusColumns && (
              <td colSpan={statusColumns.length}>{i18n.levelStatus()}</td>
            )}
          </tr>
          {statusColumns && <tr>{rows[0].map(cell => cell)}</tr>}
        </thead>
        <tbody>
          <tr>{rows[1].map(cell => cell)}</tr>
          <tr>{rows[2].map(cell => cell)}</tr>
        </tbody>
      </table>
    );
  }

  getLevelStatusColumns() {
    const {
      includeCsfColumn,
      includeProgressNotApplicable,
      includeReviewStates,
    } = this.props;

    const columns = [];
    includeProgressNotApplicable && columns.push(this.getProgressNAColumn());
    columns.push(this.getNotStartedColumn());
    columns.push(this.getInProgressColumn());
    includeReviewStates && columns.push(this.getKeepWorkingColumn());
    includeReviewStates && columns.push(this.getNeedsReviewColumn());
    includeCsfColumn && columns.push(this.getTooManyBlocksColumn());
    columns.push(this.getPerfectColumn());
    columns.push(this.getAssessmentsColumn());

    return columns;
  }

  getLevelDetailsColumns() {
    const column1 = [
      <td key={_.uniqueId()} />,
      <td key={_.uniqueId()}>
        {this.getLevelDetails('file-text', i18n.text())}
      </td>,
      <td key={_.uniqueId()}>
        {this.getLevelDetails('scissors', i18n.unplugged())}
        {this.getLevelDetails('flag-checkered', i18n.stageExtras())}
      </td>,
    ];
    const column2 = [
      <td key={_.uniqueId()} />,
      <td key={_.uniqueId()}>
        {this.getLevelDetails('video-camera', i18n.video())}
      </td>,
      <td key={_.uniqueId()}>
        {this.getLevelDetails('desktop', i18n.online())}
        {this.getLevelDetails('check-circle', i18n.progressLegendAssessment())}
      </td>,
    ];
    const column3 = [
      <td key={_.uniqueId()} />,
      <td key={_.uniqueId()} className="end-border">
        {this.getLevelDetails('map', i18n.map())}
      </td>,
      <td key={_.uniqueId()} className="end-border">
        {this.getLevelDetails('list-ul', i18n.question())}
        {this.getLevelDetails('sitemap', i18n.choiceLevel())}
      </td>,
    ];
    return [column1, column2, column3];
  }

  getLevelTypeColumn() {
    return [
      <td key={_.uniqueId()} />,
      <td key={_.uniqueId()}>{i18n.concept()}</td>,
      <td key={_.uniqueId()}>{i18n.activity()}</td>,
    ];
  }

  getProgressNAColumn() {
    return [
      <td key={_.uniqueId()}>
        {i18n.progress()}
        <br />
        {i18n.notApplicable()}
      </td>,
      <td key={_.uniqueId()}>
        <div>—</div>
      </td>,
      <td key={_.uniqueId()} rowSpan={2}>
        <div>—</div>
      </td>,
    ];
  }

  getNotStartedColumn() {
    return [
      <td key={_.uniqueId()}>{i18n.notStarted()}</td>,
      <td key={_.uniqueId()}>
        <div>
          {this.getBubble(
            LevelStatus.not_tried,
            true,
            `${i18n.concept()}: ${i18n.notStarted()}`
          )}
        </div>
      </td>,
      <td key={_.uniqueId()}>
        <div>
          {this.getBubble(
            LevelStatus.not_tried,
            false,
            `${i18n.activity()}: ${i18n.notStarted()}`
          )}
        </div>
      </td>,
    ];
  }

  getInProgressColumn() {
    return [
      <td key={_.uniqueId()}>{i18n.inProgress()}</td>,
      <td key={_.uniqueId()}>
        <div>
          {this.getBubble(
            LevelStatus.attempted,
            true,
            `${i18n.concept()}: ${i18n.inProgress()}`
          )}
        </div>
      </td>,
      <td key={_.uniqueId()} rowSpan={2}>
        <div>
          {this.getBubble(
            LevelStatus.attempted,
            false,
            `${i18n.activity()}: ${i18n.inProgress()}`
          )}
        </div>
      </td>,
    ];
  }

  getKeepWorkingColumn() {
    return [
      <td key={_.uniqueId()}>{i18n.keepWorking()}</td>,
      this.getNotApplicableCell(),
      <td key={_.uniqueId()} rowSpan={2}>
        <div>
          {this.getBubble(
            LevelStatus.attempted,
            false,
            `${i18n.activity()}: ${i18n.keepWorking()}`,
            true
          )}
        </div>
      </td>,
    ];
  }

  getNeedsReviewColumn() {
    return [
      <td key={_.uniqueId()}>{i18n.needsReview()}</td>,
      this.getNotApplicableCell(),
      <td key={_.uniqueId()} rowSpan={2}>
        <div>
          {this.getBubble(
            LevelStatus.perfect,
            false,
            `${i18n.activity()}: ${i18n.needsReview()}`,
            true
          )}
        </div>
      </td>,
    ];
  }

  getTooManyBlocksColumn() {
    return [
      <td key={_.uniqueId()}>
        <div>{i18n.completed()}</div>
        <div>({i18n.tooManyBlocks()})</div>
      </td>,
      this.getNotApplicableCell(),
      <td key={_.uniqueId()} rowSpan={2}>
        <div>
          {this.getBubble(
            LevelStatus.passed,
            false,
            `${i18n.activity()}: ${i18n.completed()} (${i18n.tooManyBlocks()})`
          )}
        </div>
      </td>,
    ];
  }

  getPerfectColumn() {
    return [
      <td key={_.uniqueId()}>
        <div>{i18n.completed()}</div>
        {this.props.includeCsfColumn && <div>({i18n.perfect()})</div>}
      </td>,
      <td key={_.uniqueId()}>
        <div>
          {this.getBubble(
            LevelStatus.perfect,
            true,
            `${i18n.concept()}: ${i18n.completed()} (${i18n.perfect()})`
          )}
        </div>
      </td>,
      <td key={_.uniqueId()} rowSpan={2}>
        <div>
          {this.getBubble(
            LevelStatus.perfect,
            false,
            `${i18n.activity()}: ${i18n.completed()} (${i18n.perfect()})`
          )}
        </div>
      </td>,
    ];
  }

  getAssessmentsColumn() {
    return [
      <td key={_.uniqueId()}>{i18n.assessmentAndSurvey()}</td>,
      this.getNotApplicableCell(),
      <td key={_.uniqueId()} rowSpan={2}>
        <div>
          {this.getBubble(
            LevelStatus.submitted,
            false,
            `${i18n.activity()}: ${i18n.submitted()}`
          )}
        </div>
      </td>,
    ];
  }

  getNotApplicableCell() {
    return <td key={_.uniqueId()}>{i18n.notApplicable()}</td>;
  }

  getLevelDetails(icon, text) {
    return (
      <div className="level-details">
        <FontAwesome icon={icon} />
        {text}
      </div>
    );
  }

  getBubble(status, isConcept, text, includeKeepWorkingBadge = false) {
    const shape = isConcept ? BubbleShape.diamond : BubbleShape.circle;
    return (
      <BasicTooltip icon={defaultBubbleIcon} text={text}>
        <BasicBubble
          shape={shape}
          size={BubbleSize.full}
          progressStyle={levelProgressStyle(status)}
        >
          {includeKeepWorkingBadge && (
            <BubbleBadge
              badgeType={BadgeType.keepWorking}
              bubbleSize={BubbleSize.full}
              bubbleShape={shape}
            />
          )}
        </BasicBubble>
      </BasicTooltip>
    );
  }
}
