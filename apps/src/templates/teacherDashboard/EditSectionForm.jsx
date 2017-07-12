import React, {Component} from 'react';
import {Heading1} from "../../lib/ui/Headings";
import ProgressButton from '../progress/ProgressButton';

export default class EditSectionForm extends Component{

  render(){
    return (
      <div>
       <Heading1>
         TemporaryTitle 2
       </Heading1>
        <ProgressButton href="#" text="Save"/>
      </div>
    );
  }
}
