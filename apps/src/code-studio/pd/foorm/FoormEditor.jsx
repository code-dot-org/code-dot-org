import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, DropdownButton, MenuItem} from 'react-bootstrap';
import Foorm from './Foorm';

class FoormEditor extends React.Component {
  static propTypes = {
    // populated by redux
    formQuestions: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      formKey: 0,
      formPreviewQuestions: {}
    };
  }

  previewFoorm = () => {
    console.log(this.props.formQuestions);
    $.ajax({
      url: '/api/v1/pd/foorm/form_with_library_items',
      type: 'post',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify({
        form_questions: this.props.formQuestions
      })
    }).done(result => {
      console.log(result);
      this.setState({
        formKey: this.state.formKey + 1,
        formPreviewQuestions: result
      });
    });
  };

  render() {
    return (
      <div>
        <DropdownButton id="load_config" title="Load Existing Configuration">
          <MenuItem key={1} eventKey={'ack'}>
            Sample
          </MenuItem>
        </DropdownButton>
        <textarea
          ref="content"
          // 3rd parameter specifies number of spaces to insert into the output JSON string for readability purposes.
          // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
          value={this.props.formQuestions}
          // Change handler is required for this element, but changes will be handled by the code mirror.
          onChange={() => {}}
        />
        <Button onClick={this.previewFoorm}>Preview</Button>
        <Foorm
          formQuestions={this.props.formQuestions}
          formName={'preview'}
          formVersion={0}
          submitApi={'/none'}
          key={this.state.formKey}
        />
      </div>
    );
  }
}

export default connect(
  state => ({formQuestions: state.foorm.formQuestions || {}}),
  dispatch => ({})
)(FoormEditor);
