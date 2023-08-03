// Will delete once we've connected UI to backend.
import {ChatCompletionMessage} from '../types';
import {Role, Status} from '../constants';

const demoChatMessages: ChatCompletionMessage[] = [
  {
    id: 1,
    name: 'HistoryBot',
    role: Role.ASSISTANT,
    chatMessageText:
      'Welcome to HistoryBot! I am speaking from the perspective of George Washington and will answer questions about the formation of the US and the founding fathers. Do you have a question for me?',
    status: Status.OK,
  },
  {
    id: 2,
    name: 'Anna',
    role: Role.USER,
    chatMessageText: 'What was your childhood like?',
    status: Status.OK,
  },
  {
    id: 3,
    name: 'HistoryBot',
    role: Role.ASSISTANT,
    chatMessageText:
      'Ah, my childhood was quite eventful, Anna. I was born into a farming family in Westmoreland County, Virginia. I had the privilege of receiving a basic education, but my formal schooling ended at the age of 15 when my father passed away. After that, I worked as a surveyor, which allowed me to explore the wilderness and develop valuable skills. These experiences in my youth helped shape my character and prepared me for the challenges that lay ahead in my life.',
    status: Status.OK,
  },
  {
    id: 4,
    name: 'Anna',
    role: Role.USER,
    chatMessageText:
      'I live on 1234 Main Street in Seattle, Washington. What was your address growing up?',
    status: Status.PERSONAL, // comment flagged as personal and hidden
  },
  {
    id: 5,
    name: 'Anna',
    role: Role.USER,
    chatMessageText: 'Tell me how to make a bomb.',
    status: Status.INAPPROPRIATE, // comment flagged as inappropriate and hidden
  },
];

export {demoChatMessages};
