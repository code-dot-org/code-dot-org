import React from 'react';
import Button from '@cdo/apps/templates/Button';
import {postOpenaiChatCompletion} from '@cdo/apps/aichat/chatApi';
import {Role} from '@cdo/apps/aichat/types';

// AI Tutor feature that explains to students why their code did not compile. 
export default class CompilationAssistant extends React.Component {

    handleSend = async () => {
        console.log("Ask Tutor clicked")
        const systemPrompt = 'You are a tutor in a high school computer science class. Students in the class are studying Java and they would like to know in age-appropriate, clear language why their code does not compile.'
        const studentCode = `public class NeighborhoodRunner {
            public static void main(String[] args) {
          
              // Creates a Painter object
              Painter silas = new Painter();
          
              // Moves forward three spaces
              silas.move(
              }
            }`
        const chatApiResponse = postOpenaiChatCompletion(
            [   {role: Role.SYSTEM, content: systemPrompt},
                {role: Role.USER, content: studentCode}
            ]
        );
        console.log("chatApiResponse", chatApiResponse)
      };

  render() {
    const {
    } = this.props;

    return (
        <div>
            <h4>Why didn't my code compile?</h4>
            <Button onClick={() => this.handleSend()}>
                Ask AI Tutor
            </Button>
        </div>
    );
  }
}