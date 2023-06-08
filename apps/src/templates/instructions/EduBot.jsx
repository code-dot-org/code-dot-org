import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './eduBotStyles.css';

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
  Loader,
} from '@chatscope/chat-ui-kit-react';

import Button from '@cdo/apps/templates/Button';
import {openaiCompletion} from '@cdo/apps/util/openai';
import eduBotPng from '@cdo/apps/templates/instructions/eduBot.png';
import {Modal} from 'react-bootstrap';

const SAMPLE_PROMPT =
  'You are a chatbot for a middle school classroom where they can chat with a historical figure. You must answer only questions about the formation of America and the founding fathers. You will act as George Washington; every question you answer must be from his perspective. Wait for the student to ask a question before responding.';
const MAD_LIBS_SAMPLE_PROMPT =
  'You are a chatbot for a [grade level] school classroom where they can chat with a historical figure from the list below. The user will give you a name of a historical figure. You will be acting as that historical figure and every question you answer must be from their perspective. Do not answer any questions that are not about the historical figure’s life, the historical figure’s career, the historical figure’s interests, things the historical figure may have liked, the historical figure’s ideas, and any possible feelings the historical figure may have felt about things. When you respond to the user, act as the historical figure they specified. Do not answer any questions about a historical figure not on the following list: [historical figures].';

// TODO: Seems like we don't have support for enums?
const EDIT_MODE = {
  LEVELBUILDER: 'levelbuilder',
  TEACHER: 'teacher',
  NONE: 'none',
};

class EduBot extends React.Component {
  constructor(props) {
    super(props);
    const starterPrompt = props.starterPrompt || MAD_LIBS_SAMPLE_PROMPT;
    const starterMadLibVariables = this.extractMadLibVariables(starterPrompt);

    this.state = {
      isOpen: false,
      editMode: EDIT_MODE.NONE,
      promptTemplate: starterPrompt,
      finalPrompt: starterPrompt,
      loading: false,
      conversation: [],
      userInput: '',
      savingPrompt: false,
      error: null,
      madLibVariables: starterMadLibVariables,
      madLibValues: {},
    };
  }

  extractMadLibVariables = string => {
    const matches = string.match(/\[(.*?)\]/g);
    if (matches) {
      return matches.map(match => match.match(/\[(.*?)\]/)[1]);
    }
    return [];
  };

  updateMadLibSystemPrompt = value => {
    const {promptTemplate} = this.state;
    this.setState({
      madLibVariables: this.extractMadLibVariables(value),
      promptTemplate: value,
      finalPrompt: value,
    });
  };

  formatForOpenAI = messages => {
    const {finalPrompt} = this.state;
    let payload = [{content: finalPrompt, role: 'system'}];
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
      loading: true,
      error: null,
    });

    const payload = this.formatForOpenAI(updatedConversation);
    if (!payload.length) {
      return;
    }

    openaiCompletion(payload).then(
      response => {
        const {content, role} = response;
        this.setState({
          conversation: [...updatedConversation, {sender: role, text: content}],
          loading: false,
        });
      },
      err => {
        this.setState({
          error: JSON.stringify(err.responseJSON),
          loading: false,
          editMode: EDIT_MODE.NONE,
        });
      }
    );
  };

  injectPromptConfiguration = ev => {
    ev.preventDefault();
    const {promptTemplate, madLibValues} = this.state;
    let prompt = promptTemplate;
    Object.keys(madLibValues).forEach(key => {
      prompt = prompt.replace(`[${key}]`, madLibValues[key]);
    });
    this.setState({finalPrompt: prompt});
  };

  startConversation = () => {
    const {finalPrompt} = this.state;
    this.setState({savingPrompt: true, error: null});
    openaiCompletion([{content: finalPrompt, role: 'system'}]).done(
      ({content, role}) => {
        this.setState({
          conversation: [{sender: role, text: content}],
          savingPrompt: false,
          userInput: '',
          editMode: EDIT_MODE.NONE,
        });
      }
    );
  };

  handleClear = () => {
    this.setState({conversation: [], error: null});
  };

  closeModal = () => this.setState({editMode: EDIT_MODE.NONE});

  handleMadLibChange = ({target: {value, id}}) => {
    console.log('id', id);
    console.log('values', value);
    this.setState(prevState => {
      const nextState = {...prevState};
      nextState.madLibValues[id] = value;
      console.log('nextState', nextState);
      return nextState;
    });
  };

  renderModalBody = () => {
    const {promptTemplate, madLibVariables, finalPrompt} = this.state;

    switch (this.state.editMode) {
      case EDIT_MODE.TEACHER:
        return (
          <div>
            <span>
              <b>Instructions:</b>
              <ul>
                <li>
                  Customize the provided system prompt using the fields below.
                </li>
                <li>
                  To give students a choice from multiple options, separate each
                  option with a delimiter like a comma (e.g. George Washington,
                  Thomas Jefferson, John Adams).
                </li>
                <li>Please include only one set of choices in your prompt.</li>
              </ul>
            </span>
            <form onSubmit={this.handleSubmit}>
              {madLibVariables.map((variable, index) => {
                // Convert variable name to sentence case
                const variableName =
                  variable.charAt(0).toUpperCase() + variable.slice(1);

                return (
                  <div key={index}>
                    <label htmlFor={variable}>{variableName}:</label>
                    <input
                      type="text"
                      id={variable}
                      value={this.state.madLibValues[variable] || ''}
                      onChange={this.handleMadLibChange}
                    />
                  </div>
                );
              })}
              <button
                onClick={this.injectPromptConfiguration}
                style={{fontSize: '14px'}}
              >
                Preview Prompt
              </button>
            </form>
            <span>
              <i>{this.state.finalPrompt}</i>
            </span>
          </div>
        );
      case EDIT_MODE.LEVELBUILDER:
      default:
        return (
          <div>
            <textarea
              style={{width: '95%', height: '150px'}}
              placeholder="value"
              value={promptTemplate}
              onChange={({target: {value}}) => {
                const containsSquareBrackets = /\[.*?\]/.test(value);

                if (containsSquareBrackets) {
                  this.updateMadLibSystemPrompt(value);
                } else {
                  this.setState({
                    promptTemplate: value,
                    finalPrompt: value,
                    madLibVariables: this.extractMadLibVariables(value),
                    conversation: [],
                  });
                }
              }}
            />
          </div>
        );
    }
  };

  render() {
    const {isOpen, conversation, madLibVariables, finalPrompt} = this.state;
    if (!isOpen) {
      return (
        <Button
          onClick={() => this.setState({isOpen: true})}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            backgroundColor: '#6232a8',
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
          height: '600px',
          width: '800px',
          bottom: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <MainContainer>
          <ChatContainer>
            <ConversationHeader>
              <Avatar src={eduBotPng} name="EduBot" />
              <ConversationHeader.Content userName="EduBot" />
              <ConversationHeader.Actions>
                <div
                  style={{
                    fontSize: '1em',
                  }}
                >
                  <ChatButton
                    icon={<FontAwesome icon="edit" />}
                    onClick={() =>
                      this.setState({editMode: EDIT_MODE.LEVELBUILDER})
                    }
                    labelPosition="left"
                  >
                    Edit Prompt{' '}
                  </ChatButton>
                  {madLibVariables.length > 0 && (
                    <ChatButton
                      icon={<FontAwesome icon="gear" />}
                      onClick={() =>
                        this.setState({editMode: EDIT_MODE.TEACHER})
                      }
                      labelPosition="left"
                    >
                      Configure{' '}
                    </ChatButton>
                  )}
                  <ChatButton
                    icon={<FontAwesome icon="trash" />}
                    onClick={() => this.setState({conversation: []})}
                    labelPosition="left"
                  >
                    Clear History{' '}
                  </ChatButton>
                  <ChatButton
                    icon={<FontAwesome icon="caret-down" />}
                    onClick={() => this.setState({isOpen: false})}
                    labelPosition="left"
                  >
                    Close{' '}
                  </ChatButton>
                </div>
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
                        message.sender === 'user' ? 'outgoing' : 'incoming',
                    }}
                  />
                );
              })}
              {this.state.error && (
                <Message
                  key={'edubot-error'}
                  model={{
                    message: this.state.error,
                    sender: 'assistant',
                    direction: 'incoming',
                  }}
                />
              )}
            </MessageList>
            <MessageInput
              onKeyDown={ev => {
                const {userInput} = this.state;
                if (ev.key === 'Backspace') {
                  this.setState({userInput: userInput.slice(0, -1)});
                }
              }}
              onChange={value => {
                this.setState({userInput: value.replace(/&nbsp;/g, ' ')});
              }}
              onSend={this.handleSend}
              placeholder="Type message here"
              autoFocus
              attachButton={false}
              value={this.state.userInput.replace(/ /g, '\u00A0')}
            />
          </ChatContainer>
        </MainContainer>
        <Modal
          id="edu-bot-modal"
          show={[EDIT_MODE.LEVELBUILDER, EDIT_MODE.TEACHER].includes(
            this.state.editMode
          )}
          onHide={this.closeModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.state.editMode === EDIT_MODE.LEVELBUILDER
                ? 'From Code.org Team'
                : 'Configure System Prompt'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.renderModalBody()}</Modal.Body>
          <Modal.Footer>
            {this.state.savingPrompt ? (
              <Loader />
            ) : (
              <ChatButton
                disabled={
                  EDIT_MODE.TEACHER === this.state.editMode &&
                  /\[.*?\]/.test(finalPrompt)
                }
                onClick={() => {
                  console.log(
                    'this.state.promptTemplate',
                    this.state.promptTemplate
                  );
                  console.log('this.state.finalPrompt', this.state.finalPrompt);
                  console.log(
                    'this.state.madLibVariables',
                    this.state.madLibVariables
                  );
                  if (EDIT_MODE.LEVELBUILDER === this.state.editMode) {
                    if (madLibVariables.length === 0) {
                      this.startConversation();
                    } else {
                      this.setState({conversation: [], madLibValues: {}});
                      this.closeModal();
                    }
                  } else if (EDIT_MODE.TEACHER === this.state.editMode) {
                    if (madLibVariables.length === 0) {
                      // no-op/not possible
                    } else {
                      this.startConversation();
                    }
                  }
                }}
              >
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
