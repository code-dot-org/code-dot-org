// Will delete once we've connected UI to backend.

const ASSISTANT = 'assistant' as const;
const USER = 'user' as const;
const SYSTEM = 'system' as const;
const OK = 'ok' as const;
const PERSONAL = 'personal' as const;
const INAPPROPRIATE = 'inappropriate' as const;

const demoChatMessages = [
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
];

export {demoChatMessages};
