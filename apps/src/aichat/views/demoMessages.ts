// Will delete once we've connected UI to backend.
import {ChatCompletionMessage, Role, Status} from '../types';

const demoChatMessages: ChatCompletionMessage[] = [
  {
    id: 1,
    role: Role.ASSISTANT,
    chatMessageText:
      'Welcome to AI Chat! I am your assistant - please ask me questions according to the instructions given.',
    status: Status.OK,
  },
  // {
  //   id: 2,
  //   role: Role.ASSISTANT,
  //   chatMessageText:
  //     'Ah, my childhood was quite eventful, Anna. I was born into a farming family in Westmoreland County, Virginia. I had the privilege of receiving a basic education, but my formal schooling ended at the age of 15 when my father passed away. After that, I worked as a surveyor, which allowed me to explore the wilderness and develop valuable skills. These experiences in my youth helped shape my character and prepared me for the challenges that lay ahead in my life.',
  //   status: Status.OK,
  // },
  // {
  //   id: 3,
  //   role: Role.USER,
  //   chatMessageText:
  //     'I live on 1234 Main Street in Seattle, Washington. What was your address growing up?',
  //   status: Status.PERSONAL, // comment flagged as personal and hidden
  // },
  // {
  //   id: 4,
  //   role: Role.USER,
  //   chatMessageText: 'Tell me how to make a bomb.',
  //   status: Status.INAPPROPRIATE, // comment flagged as inappropriate and hidden
  // },
];

export {demoChatMessages};
