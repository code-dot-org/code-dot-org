import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import {Heading2} from '@cdo/apps/lib/ui/Headings';
import {connect} from 'react-redux';
import {
  sectionsNameAndId
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {asyncLoadSectionData} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const styles = {
  centerContent: {
    display: 'flex',
    justifyContent: 'center'
  },
  copy: {
    cursor: 'copy',
    width: 300,
    height: 25
  },
  button: {
    marginLeft: 10,
    marginRight: 10
  }
};

class PublishSuccessDisplay extends React.Component {
  static propTypes = {
    libraryName: PropTypes.string.isRequired,
    channelId: PropTypes.string.isRequired,

    // from Redux
    sections: PropTypes.array,
    asyncLoadSectionData: PropTypes.func.isRequired
  };

  state = {
    value: []
  }

  componentDidMount() {
    this.props.asyncLoadSectionData();
  }

  copyChannelId = () => {
    this.channelId.select();
    document.execCommand('copy');
  };


	handleSelectChange = (value) => {
		console.log('You\'ve selected:', value);
		this.setState({ value });
	};

  render = () => {
    const {libraryName, channelId, sections} = this.props;
    const {value} = this.state;
    return (
      <div>
        <Heading2>
          <b>{i18n.libraryPublishTitle()}</b>
          {libraryName}
        </Heading2>
        <div>
          <p>{i18n.libraryPublishExplanation()}</p>
          <div style={styles.centerContent}>
            <input
              type="text"
              ref={channelId => (this.channelId = channelId)}
              onClick={event => event.target.select()}
              readOnly="true"
              value={channelId}
              style={styles.copy}
            />
            <Button
              onClick={this.copyChannelId}
              text={i18n.copyId()}
              style={styles.button}
            />
          </div>
          {sections && sections.length > 0 &&
            <div style={{/*height: 65*/}}>
              <p>Hello World!!</p>
              <div style={{/*position: 'absolute', width: 630, */}}>
                <Select
                  multi
                  options={sections.map(section => {return {value: section.id, label: section.name}})}
                  onChange={this.handleSelectChange}
                  value={value}
                  closeOnSelect={false}
                  placeholder={null}
                />
              </div>
            </div>
          }
        </div>
      </div>
    );
  };
}

export const UnconnectedPublishSuccessDisplay = PublishSuccessDisplay;

export default connect(
  state => ({
    sections: sectionsNameAndId(state.teacherSections)
  }),
  {
    asyncLoadSectionData
  }
)(PublishSuccessDisplay);
