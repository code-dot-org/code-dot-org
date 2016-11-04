import React from 'react';
import _ from 'lodash';
import color from '../../../../util/color';
import { borderRadius } from './constants';
import OrderControls from './OrderControls';
import StageCard from './StageCard';

const styles = {
  groupHeader: {
    fontSize: 18,
    color: 'white',
    background: color.cyan,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    padding: 10
  },
  groupBody: {
    background: color.lightest_cyan,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    padding: 10,
    marginBottom: 20
  },
  addGroup: {
    fontSize: 14,
    color: 'white',
    background: color.cyan,
    border: `1px solid ${color.cyan}`,
    boxShadow: 'none',
    margin: '0 0 30px 0'
  },
  addStage: {
    fontSize: 14,
    color: '#5b6770',
    background: 'white',
    border: '1px solid #ccc',
    boxShadow: 'none',
    margin: '0 10px 10px 10px'
  }
};

const FlexGroup = React.createClass({
  propTypes: {
    handleAction: React.PropTypes.func.isRequired,
    stages: React.PropTypes.array.isRequired
  },

  handleAddGroup() {
    this.props.handleAction('ADD_GROUP');
  },

  handleAddStage(position) {
    this.props.handleAction('ADD_STAGE', {position});
  },

  render() {
    const groups = _.groupBy(this.props.stages, stage => (stage.flex_category || 'Default'));
    let count = 0;
    let afterStage = 1;

    return (
      <div>
        {_.map(groups, (stages, group) => {
          return (
            <div key={group}>
              <div style={styles.groupHeader}>
                Group {++count}: {group}
                <OrderControls
                  handleAction={this.props.handleAction}
                  type="GROUP"
                  position={afterStage}
                  total={Object.keys(groups).length}
                />
              </div>
              <div style={styles.groupBody}>
                {stages.map(stage => {
                  afterStage++;
                  return (
                    <StageCard
                      handleAction={this.props.handleAction}
                      key={stage.id}
                      stagesCount={this.props.stages.length}
                      stage={stage}
                    />
                  );
                })}
                <button onMouseDown={this.handleAddStage.bind(null, afterStage - 1)} className="btn" style={styles.addStage} type="button">
                  <i style={{marginRight: 7}} className="fa fa-plus-circle" />
                  Add Stage
                </button>
              </div>
            </div>
          );
        })}
        <button onMouseDown={this.handleAddGroup} className="btn" style={styles.addGroup} type="button">
          <i style={{marginRight: 7}} className="fa fa-plus-circle" />
          Add Group
        </button>
      </div>
    );
  }
});

export default FlexGroup;
