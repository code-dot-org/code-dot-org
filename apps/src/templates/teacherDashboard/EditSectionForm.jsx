import React, {Component, PropTypes} from 'react';
import {Heading1} from "../../lib/ui/Headings";
import ProgressButton from '../progress/ProgressButton';

export default class EditSectionForm extends Component{

  static propTypes = {
    handleSave: PropTypes.func.isRequired,
  };

  render(){
    return (
      <div>
       <Heading1>
         TemporaryTitle 2
       </Heading1>
        <ProgressButton onClick={this.props.handleSave} text="Save"/>
      </div>
    );
  }
}

