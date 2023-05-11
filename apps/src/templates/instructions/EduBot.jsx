import React from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  Avatar,
  MainContainer,
  ChatContainer,
  ConversationHeader,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  Button as ChatButton,
  Loader
} from '@chatscope/chat-ui-kit-react';
import Button from '@cdo/apps/templates/Button';
import {openaiCompletion} from '@cdo/apps/util/openai';
import eduBotPng from '@cdo/apps/templates/instructions/edubot.png';
import {Modal} from 'react-bootstrap';

const systemPrompts = [
  'You are a chatbot for a middle school classroom where they can chat with a historical figure. Do not answer any questions that are not about the formation of america and the founding fathers. You will be acting as george washington and every question you answer must be from his perspective.'
  // Add more prompts here...
];

class EduBot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      editSystemPrompt: false,
      selectedPrompt: systemPrompts[0],
      loeading: false,
      conversation: [],
      userInput: '',
      savingPrompt: false
    };
  }

  formatForOpenAI = messages => {
    const {selectedPrompt} = this.state;
    let payload = [{content: selectedPrompt, role: 'system'}];
    messages.forEach(message => {
      payload.push({content: message.text, role: message.sender});
    });
    return payload;
  };

  handleSend = () => {
    const {conversation, userInput} = this.state;

    const newMessage = {sender: 'user', text: userInput};
    const updatedConversation = [...conversation, newMessage];

    this.setState({
      conversation: updatedConversation,
      userInput: '',
      loading: true
    });

    const payload = this.formatForOpenAI(updatedConversation);
    if (!payload.length) {
      return;
    }

    openaiCompletion(payload).done(({content, role}) => {
      this.setState({
        conversation: [...updatedConversation, {sender: role, text: content}],
        loading: false
      });
    });
  };

  handleSaveSystemPrompt = () => {
    const {selectedPrompt} = this.state;
    this.setState({savingPrompt: true});

    openaiCompletion([{content: selectedPrompt, role: 'system'}]).done(
      ({content, role}) => {
        this.setState({
          conversation: [{sender: role, text: content}],
          savingPrompt: false,
          userInput: '',
          editSystemPrompt: false
        });
      }
    );
  };

  handleClear = () => {
    this.setState({conversation: []});
  };

  closeModal = () => this.setState({editSystemPrompt: false});

  render() {
    const {isOpen, conversation} = this.state;
    if (!isOpen) {
      return (
        <Button
          onClick={() => this.setState({isOpen: true})}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            backgroundColor: '#6232a8'
          }}
        >
          Open EduBot
        </Button>
      );
    }

    return (
      <div
        id="edubot"
        style={{
          position: 'fixed',
          height: '400px',
          width: '600px',
          bottom: 0,
          right: 0,
          zIndex: 1000
        }}
      >
        <MainContainer>
          <ChatContainer>
            <ConversationHeader>
              <Avatar src={eduBotPng} name="EduBot" />
              <ConversationHeader.Content userName="EduBot" />
              <ConversationHeader.Actions>
                <ChatButton
                  icon={<FontAwesome icon="edit" />}
                  onClick={() => this.setState({editSystemPrompt: true})}
                />
                <ChatButton
                  icon={<FontAwesome icon="trash" />}
                  onClick={() => this.setState({conversation: []})}
                />
                <ChatButton
                  icon={<FontAwesome icon="caret-down" />}
                  onClick={() => this.setState({isOpen: false})}
                />
              </ConversationHeader.Actions>
            </ConversationHeader>
            <MessageList
              typingIndicator={
                this.state.loading ? (
                  <TypingIndicator content="EduBot is typing" />
                ) : null
              }
            >
              {conversation.map((message, idx) => {
                return (
                  <Message
                    key={`$edubot-message-${idx}`}
                    model={{
                      message: message.text,
                      sender: message.sender,
                      direction:
                        message.sender === 'user' ? 'outgoing' : 'incoming'
                    }}
                  />
                );
              })}
            </MessageList>
            <MessageInput
              onKeyDown={ev => {
                const {userInput} = this.state;
                if (ev.key === 'Backspace') {
                  this.setState({userInput: userInput.slice(0, -1)});
                }
              }}
              onChange={value => this.setState({userInput: value})}
              onSend={this.handleSend}
              placeholder="Type message here"
              autoFocus
              attachButton={false}
              value={this.state.userInput}
            />
          </ChatContainer>
        </MainContainer>
        <Modal show={this.state.editSystemPrompt} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit System Prompt</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{marginLeft: '-110px'}}>
            <textarea
              style={{width: '95%', height: '150px'}}
              placeholder="value"
              value={this.state.selectedPrompt}
              onChange={({target: {value}}) =>
                this.setState({selectedPrompt: value})
              }
            />
          </Modal.Body>
          <Modal.Footer>
            {this.savingPrompt ? (
              <Loader />
            ) : (
              <ChatButton onClick={this.handleSaveSystemPrompt}>
                Save
              </ChatButton>
            )}
            <ChatButton onClick={this.closeModal}>Close</ChatButton>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default EduBot;
