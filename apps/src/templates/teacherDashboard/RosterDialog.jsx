import React from 'react';
import BaseDialog from '../BaseDialog';
import color from '../../util/color';
import locale from '@cdo/locale';

const styles = {
  title: {
    position: 'absolute',
    left: 20,
    color: color.dark_charcoal,
    margin: '15px 0',
  },
  content: {
    position: 'absolute',
    left: 20,
    top: 50,
    right: 20,
    bottom: 70,
    overflowY: 'scroll',
  },
  classroomRow: {
    padding: 10,
    cursor: 'pointer',
  },
  highlightRow: {
    backgroundColor: color.default_blue,
    color: color.white,
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    left: 20,
  },
  buttonPrimary: {
    float: 'right',
    background: color.orange,
    color: color.white,
    border: '1px solid #b07202',
    borderRadius: 3,
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.63)',
    fontSize: 14,
    padding: '8px 20px',
  },
  buttonSecondary: {
    float: 'left',
    background: '#eee',
    color: '#5b6770',
    border: '1px solid #c5c5c5',
  },
};

const ClassroomList = ({classrooms, onSelect, selectedId}) => classrooms.length ?
  <div>
    {classrooms.map(classroom => (
      <div
        style={Object.assign({},
          styles.classroomRow,
          selectedId === classroom.id && styles.highlightRow
        )}
        key={classroom.id}
        onClick={onSelect.bind(null, classroom.id)}
      >
        {classroom.name}
        {classroom.section &&
          <span style={{color: '#aaa'}}> ({classroom.section})</span>
        }
        <span style={{float: 'right'}}>
          {locale.code()}
          <span style={{fontFamily: 'monospace'}}> {classroom.enrollmentCode}</span>
        </span>
      </div>
    ))}
  </div> :
  <div>
    <p>
      {locale.noClassroomsFound()}
    </p>
    <a href="https://classroom.google.com/">
      {locale.addRemoveGoogleClassrooms()}
    </a>
  </div>
;
ClassroomList.propTypes = {
  classrooms: React.PropTypes.array.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  selectedId: React.PropTypes.string,
};

export default class RosterDialog extends React.Component {
  static propTypes = {
    handleClose: React.PropTypes.func,
    isOpen: React.PropTypes.bool,
    classrooms: React.PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.handleClose = this.handleClose.bind(this);
    this.onClassroomSelected = this.onClassroomSelected.bind(this);
  }

  handleClose() {
    this.props.handleClose(this.state.selectedId);
  }

  onClassroomSelected(id) {
    this.setState({selectedId: id});
  }

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isOpen}
        handleClose={this.handleClose}
        assetUrl={() => ''}
        {...this.props}
      >
        <h2 style={styles.title}>
          {locale.selectGoogleClassroom()}
        </h2>
        <div style={styles.content}>
          {this.props.classrooms ?
            <ClassroomList
              classrooms={this.props.classrooms}
              onSelect={this.onClassroomSelected}
              selectedId={this.state.selectedId}
            /> :
            locale.loading()
          }
        </div>
        <div style={styles.footer}>
          <button
            onClick={this.handleClose}
            style={{...styles.buttonPrimary, ...styles.buttonSecondary}}
          >
            {locale.dialogCancel()}
          </button>
          <button
            onClick={this.handleClose}
            style={Object.assign({},
              styles.buttonPrimary,
              !this.state.selectedId && {opacity: 0.5}
            )}
          >
            {locale.chooseSection()}
          </button>
        </div>
      </BaseDialog>
    );
  }
}
