import $ from 'jquery';
import {getAuthenticityToken} from './AuthenticityTokenStore';

// initialize chat with system prompt
// get message input from user
// append to conversation to send to openAI (but don't update state yet)
// get response from openAI. append both response and new message from user to conversation?

export const openaiCompletion = async messages => {
  const token = await getAuthenticityToken();

  return $.ajax({
    url: '/openai/chat_completion',
    method: 'POST',
    data: JSON.stringify({messages}),
    contentType: 'application/json',
    headers: {
      'X-CSRF-Token': token,
    },
    dataType: 'json',
  });
};

// handleSend = () => {
//   const {conversation, userInput} = this.state;
//
//   const newMessage = {sender: 'user', text: userInput};
//   const updatedConversation = [...conversation, newMessage];
//
//   const payload = this.formatForOpenAI(updatedConversation);
//   if (!payload.length) {
//     return;
//   }
//
//   openaiCompletion(payload).then(
//     response => {
//       const {content, role} = response;
//       this.setState({
//         conversation: [...updatedConversation, {sender: role, text: content}],
//         loading: false,
//       });
//     },
//     err => {
//       this.setState({
//         error: JSON.stringify(err.responseJSON),
//         loading: false,
//         editMode: EDIT_MODE.NONE,
//       });
//     }
//   );
// };
