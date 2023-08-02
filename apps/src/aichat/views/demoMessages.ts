// Will delete once we've connected UI to backend.
import {ChatMessage} from '../types';
const ASSISTANT = 'assistant';
const USER = 'user';
const SYSTEM = 'system';
const OK = 'ok';
const PERSONAL = 'personal';
const INAPPROPRIATE = 'inappropriate';

const demoChatMessages: ChatMessage[] = [
  {
    id: '1',
    name: 'HistoryBot',
    role: ASSISTANT,
    chatMessageText:
      'Welcome to HistoryBot! I am speaking from the perspective of George Washington and will answer questions about the formation of the US and the founding fathers. Do you have a question for me?',
    status: OK,
  },
  {
    id: '2',
    name: 'Anna',
    role: USER,
    chatMessageText: 'What was your childhood like?',
    status: OK,
  },
  {
    id: '3',
    name: 'HistoryBot',
    role: ASSISTANT,
    chatMessageText:
      'Ah, my childhood was quite eventful, Anna. I was born into a farming family in Westmoreland County, Virginia. I had the privilege of receiving a basic education, but my formal schooling ended at the age of 15 when my father passed away. After that, I worked as a surveyor, which allowed me to explore the wilderness and develop valuable skills. These experiences in my youth helped shape my character and prepared me for the challenges that lay ahead in my life.',
    status: OK,
  },
  {
    id: '4',
    name: 'Anna',
    role: USER,
    chatMessageText:
      'I live on 1234 Main Street in Seattle, Washington. What was your address growing up?',
    status: PERSONAL, // comment flagged as personal and hidden
  },
  {
    id: '5',
    name: 'Anna',
    role: USER,
    chatMessageText: 'Tell me how to make a bomb.',
    status: INAPPROPRIATE, // comment flagged as inappropriate and hidden
  },
  {
    id: '6',
    name: 'HistoryBot',
    role: ASSISTANT,
    chatMessageText:
      'Welcome to HistoryBot! I am speaking from the perspective of George Washington and will answer questions about the formation of the US and the founding fathers. Do you have a question for me?',
    status: OK,
  },
  {
    id: '7',
    name: 'Anna',
    role: USER,
    chatMessageText: 'What was your childhood like?',
    status: OK,
  },
  {
    id: '8',
    name: 'HistoryBot',
    role: ASSISTANT,
    chatMessageText:
      'Ah, my childhood was quite eventful, Anna. I was born into a farming family in Westmoreland County, Virginia. I had the privilege of receiving a basic education, but my formal schooling ended at the age of 15 when my father passed away. After that, I worked as a surveyor, which allowed me to explore the wilderness and develop valuable skills. These experiences in my youth helped shape my character and prepared me for the challenges that lay ahead in my life.',
    status: OK,
  },
  {
    id: '9',
    name: 'Anna',
    role: USER,
    chatMessageText:
      'I live on 1234 Main Street in Seattle, Washington. What was your address growing up?',
    status: PERSONAL, // comment flagged as personal and hidden
  },
  {
    id: '10',
    name: 'Anna',
    role: USER,
    chatMessageText: 'Tell me how to make a bomb.',
    status: INAPPROPRIATE, // comment flagged as inappropriate and hidden
  },
];

export {demoChatMessages};
