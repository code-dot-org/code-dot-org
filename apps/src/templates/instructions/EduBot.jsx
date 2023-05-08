import React, {useState} from 'react';
// import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import {openaiCompletion} from '@cdo/apps/util/openai';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const systemPrompts = [
  'You are a chatbot for a middle school classroom where they can chat with a historical figure. Do not answer any questions that are not about the formation of america and the founding fathers. You will be acting as george washington and every question you answer must be from his perspective.'
  // Add more prompts here...
];

class EduBot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      selectedPrompt: systemPrompts[0],
      conversation: [],
      userInput: ''
    };
  }

  handleAsk = () => {
    const {conversation, userInput} = this.state;
    // Here you would make the API call and add the response to the conversation
    const newMessage = {sender: 'user', text: userInput};
    this.setState({
      conversation: [...conversation, newMessage],
      userInput: ''
    });
  };

  handleClear = () => {
    this.setState({conversation: []});
  };

  render() {
    const {isOpen, selectedPrompt, conversation, userInput} = this.state;
    console.log('isOpen?', isOpen);
    if (!isOpen) {
      return (
        <button
          type="button"
          onClick={() => this.setState({isOpen: true})}
          style={{position: 'fixed', bottom: 20, right: 20, zIndex: 1000}}
        >
          Open EduBot
        </button>
      );
    }

    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '800px',
          height: '600px',
          border: '1px solid black',
          backgroundColor: 'white',
          zIndex: 1000
        }}
      >
        <button
          type="button"
          onClick={() => this.setState({isOpen: false})}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            border: 'none',
            background: 'none',
            fontSize: 'large'
          }}
        >
          X
        </button>
        <h1>EduBot</h1>
        <div>
          <select
            value={selectedPrompt}
            onChange={({target: {value}}) =>
              this.setState({selectedPrompt: value})
            }
          >
            {systemPrompts.map((prompt, index) => (
              <option key={index} value={prompt}>
                {prompt}
              </option>
            ))}
          </select>
        </div>
        <div style={{height: '400px', overflow: 'auto'}}>
          {conversation.map((message, index) => (
            <p
              key={index}
              style={{color: message.sender === 'user' ? 'blue' : 'red'}}
            >
              {message.text}
            </p>
          ))}
          <button
            type="button"
            onClick={this.handleClear}
            style={{
              display: 'block',
              margin: '0 auto',
              border: 'none',
              background: 'none',
              color: 'blue',
              textDecoration: 'underline'
            }}
          >
            Clear
          </button>
        </div>
        <div>
          <input
            type="text"
            value={userInput}
            onChange={({target: {value}}) => this.setState({userInput: value})}
            style={{width: '90%', margin: '0 auto'}}
          />
          <button type="button" onClick={this.handleAsk}>
            Ask!
          </button>
        </div>
      </div>
    );
  }
}

export default EduBot;

// class AiTab extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       preprompt:
//         "You are a chatbot for a middle school classroom where they can chat with a historical figure. Do not answer any questions that are not about the formation of america and the founding fathers. You will be acting as george washington and every question you answer must be from his perspective. You do not know about anything that happened after he died. You will refuse to answer any questions that are not about George Washington's life, the revolutionary war, the founding of America and his death.",
//       prompt: '',
//       result: '',
//       loading: false,
//     };
//   }

//   handleChange1 = ({target: {value}}) => {
//     console.log(value);
//     this.setState({preprompt: value});
//   };

//   handleChange2 = ({target: {value}}) => {
//     console.log(value);
//     this.setState({prompt: value});
//   };

//   handleSubmit = () => {
//     this.setState({loading: true});
//     openaiCompletion(prompt).then((result) => {
//       this.setState({loading: false, result: result});
//     });
//   };

//   render() {
//     const result = '';

//     // const historyText =
//     //   "You are a chatbot for a middle school classroom where they can chat with a historical figure. Do not answer any questions that are not about the formation of america and the founding fathers. You will be acting as george washington and every question you answer must be from his perspective. You do not know about anything that happened after he died. You will refuse to answer any questions that are not about George Washington's life, the revolutionary war, the founding of America and his death.";

//     return (
//       <div>
//         <div>
//           <label htmlFor="preprompt">Preprompt</label>
//           <textarea
//             type="text"
//             id="preprompt"
//             value={this.state.preprompt}
//             onChange={this.handleChange1}
//             style={{width: '700px', height: '100px'}} // Set the width and height of the textarea
//             wrap="soft" // Enable text wrapping
//           />
//         </div>
//         <div>
//           <label htmlFor="prompt">Student Question</label>
//           <textarea
//             id="prompt"
//             type="text"
//             value={this.state.prompt}
//             onChange={this.handleChange2}
//             style={{width: '700px', height: '100px'}} // Set the width and height of the textarea
//             wrap="soft" // Enable text wrapping
//           />
//           <Button
//             text={'Generate!'}
//             onClick={this.handleSubmit}
//             color={Button.ButtonColor.orange}
//           />
//         </div>
//         {this.state.loading && <div>loading...</div>}
//         {!!this.state.result && (
//           <div className="ai-tab">
//             <SafeMarkdown markdown={result} />
//           </div>
//         )}
//       </div>
//     );
//   }
// }

// export default AiTab;

// // export const AiTab = props => {
// //   // const {
// //   //   teacherOnly,
// //   // } = props;

// //   const [result, setResult] = useState(null);

// //   const currentCode = window.currentCode;

// //   useEffect(() => {
// //     const prompt = `Please evaluate and briefly summarize whether each of the
// //     following statements are true or false with respect to the javascript code for my
// //     program which follows. Please give your response formatted as a markdown
// //     table with the following columns: "Statement", "True/False", and "Reason".
// //     please use backticks to escape any code in your reason. the statement column
// //     should contain the entire original statement. please be sure to ignore any
// //     commented-out code when deciding what the program does or does not do.

// //     statements:

// //     ${exampleStatements}

// //     code:

// //     ${currentCode}`;

// //     console.log(prompt);

// //     openaiCompletion(prompt).then(setResult);
// //   }, [currentCode]);

// //   return (
// // <div>
// //   {!result && <div>loading...</div>}
// //   {result && (
// //     <div className="ai-tab">
// //       <SafeMarkdown markdown={result} />
// //     </div>
// //   )}
// // </div>
// //   );
// // };

// // const exampleStatements = `
// // 1. You used multiple sprites
// // 2. Your program uses at least one random number to set the value of a property on a sprite or other object.
// // 3. Your program uses multiple conditionals inside the draw loop
// // 4. At least one variable or property uses the counter pattern
// // `;
