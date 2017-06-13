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

const ClassroomList = ({classrooms}) => classrooms.length ?
  <div>
    {classrooms.map(classroom => (
      <div style={styles.classroomRow} key={classroom.id}>
        {classroom.name}
        {classroom.section && <span style={{color: '#999'}}> ({classroom.section})</span>}
        <span style={{float: 'right'}}>Code: <span style={{fontFamily: 'monospace'}}>{classroom.code}</span></span>
      </div>
    ))}
  </div> :
  <div>
    No classrooms found. Visit <a href="https://classroom.google.com/">https://classroom.google.com/</a> to add and remove classrooms.
  </div>
;
ClassroomList.propTypes = {
  classrooms: React.PropTypes.array.isRequired,
};

export default class RosterDialog extends React.Component {
  static propTypes = {
    handleClose: React.PropTypes.func,
    isOpen: React.PropTypes.bool,
    classrooms: React.PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.handleClose = this.props.handleClose.bind(this);
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
            <ClassroomList classrooms={this.props.classrooms} /> :
            "Loading..."
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
            style={styles.buttonPrimary}
          >
            {locale.chooseSection()}
          </button>
        </div>
      </BaseDialog>
    );
  }
}
