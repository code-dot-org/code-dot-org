export const EXPLAIN_CONCEPT_PROMPT = {
  label: 'Explain a concept',
  prompt:
    'I need an explanation of a concept. You can ask me a follow-up question to find out what concept needs to be explained.',
};

export const EXAMPLE_PROMPT = {
  label: 'Give me an example',
  prompt:
    'Can I have an example to use with my class? You can ask me a follow-up question to get more details for the kind of example needed.',
};

export const FINISH_EARLY_PROMPT = {
  label: 'Write an extension activity for students who finish early',
  prompt:
    'Write an extension activity for this lesson for students who finish early',
};

export const EXTRA_PRACTICE_PROMPT = {
  label: 'Write an extension activity for extra practice',
  prompt:
    'Write an extension activity for this lesson for students who need extra practice',
};

export const EXIT_TICKET_PROMPT = {
  label: 'Write an exit ticket',
  prompt:
    'I need an exit ticket to quickly assess if my class understood a concept. You can ask me a follow-up question to find out what concept needs to be assessed and if they have a preference in question type.',
};

export const MINI_LESSON_PROMPT = {
  label: 'Generate a mini lesson',
  prompt: `I need a mini lesson.  You can ask me a follow-up question to find out what concept needs to be assessed and how much time they have. Ask about any known misconceptions in the class.

    Create a 10-15 (adjust for time based on their answer) minute mini-lesson on [use the topic given by the teacher] for teaching computer science. Include:
    1. An engaging hook that connects to students' real-world experiences
    2. A clear, specific learning objective that can be achieved in this timeframe
    3. A step-by-step demonstration that shows your thought process
    4. At least two points of student interaction or checks for understanding
    5. One common misconception or error to address (use the misconception they provide)
    6. A 2-3 minute practice exercise that lets students apply the concept immediately

    Focus on a single, specific concept that students can understand and practice right away. Keep explanations concise and student-friendly.`,
};

export const LESSON_HOOK_PROMPT = {
  label: 'Write a lesson hook',
  prompt: `I need a lesson hook to engage students on a topic. You can write a message asking teachers for the essential context needed to create an engaging lesson hook. The message should:
    - Request student age/grade level
    - Ask about student interests and hobbies
    - Ask about recent class topics or context
    - Ask about the specific concept being introduced
    Use this information to create a relevant, 1-2 minute hook that connects to students' experiences and creates curiosity about the new concept.

    Format the questions as a clear, easy-to-read list`,
};

export const ADJUST_TIMING_PROMPT = {
  label: 'Adjust curriculum for timing',
  prompt: `I need to adjust a lesson for a different amount of instructional time.  You can clarify what lesson and how much time I have.

    Help me adapt my lesson on [topic given by teacher] to fit a [time period given by teacher] class. I need to preserve the key learning objectives while adjusting the activities and pacing. Please suggest which components to prioritize, what could be condensed or expanded, and provide a minute-by-minute breakdown that includes introduction, instruction, guided practice, independent work, and closure. Include time-saving tips and contingency options if activities run long or short.'`,
};

export const DEBUG_MISTAKES_PROMPT = {
  label: 'Debug common mistakes',
  prompt:
    'Outline the most common mistakes students make when learning key topics in this curriculum at this grade level, provide code examples of these mistakes, and suggest teaching strategies to prevent and address them. Include how to turn these mistakes into learning opportunities and specific questions to ask students to guide their debugging process.',
};

export const REAL_WORLD_PROMPT = {
  label: 'Real world connection',
  prompt: `I need real world connections to the curriculum I am teaching.  Feel free to clarify what concept we are creating real world connections to.

    Create engaging examples that connect [topic given by user] to real-world applications students care about. Consider target age of curriculum as well as current technology trends, popular apps, games, and everyday problems that can be solved using this concept. Include discussion prompts that help students see how this concept is used in technology they interact with daily students to guide their debugging process.`,
};

export const SUGGEST_CURRICULUM_PROMPT = {
  label: 'Suggest a curriculum',
  prompt: `What Code.org curriculum should I use with my class? You can write a message asking me for the essential context about my class needed to give a suitable curriculum suggestion. Your message should:
  - Request student age/grade level
  - Ask about topics I want to cover in the curriculum
  - Ask how often I see my students and how long the course should be

  Use this information to find a few suitable Code.org curricula that I could teach my students

  Format the questions as a clear, easy-to-read list`,
};

export const GET_STARTED_PROMPT = {
  label: 'Get started with Code.org',
  prompt: `How do I get started as a teacher on Code.org?`,
};

export const PROFESSIONAL_LEARNING_PROMPT = {
  label: 'Learn about Professional Learning',
  prompt: `What Code.org Professional Learning opportunities are available and where can I find them? You can ask me follow-up questions about what topics I want to learn about in order to suggest a professional learning course to me.`,
};

export const CREATE_SECTION_PROMPT = {
  label: 'How to create a section?',
  prompt: `How do I create a classroom section? You can write a message asking me for the essential context about my class needed to give me specific instructions for creating my classroom section. Your message should:

  - Ask me if I use an LMS like Schoology, Clever, Canvas, or Google Classrooms, or if I want my students to have a log-in on Code.org
  - Ask me what grade level my students are

  Use this information to give me specific instructions on how to create a classroom section for the log-in type I need to use for my students.`,
};

export const ADDITIONAL_HELP_PROMPT = {
  label: 'Get help using Code.org',
  prompt: `Who can I go to if I have more questions about Code.org? Encourage me to ask you for help with most issues in the chat or look at the Code.org support center. The last part of your answer must include directing me to the "Submit a request" page at https://support.code.org/hc/en-us/requests/new to get support from a staff member at Code.org.`,
};

export const APCSP_EXAM_SAMPLE_QUESTIONS = {
  label: 'Find sample questions',
  prompt: `Where can I find sample questions for the AP CSP exam?`,
};

export const APCSP_EXAM_BIG_IDEAS = {
  label: 'Breakdown of weighting big ideas',
  prompt: `What is the breakdown of the weighting of each big idea?`,
};

export const APCSP_EXAM_PREPARATION_RESOURCES = {
  label: 'Find resources to prepare students for the exam',
  prompt: `Where can I find resources to help prepare students for the exam?`,
};

export const APCSP_EXAM_CONNECT_WITH_TEACHERS = {
  label: 'Connect with other AP CSP teachers',
  prompt: `Where can I connect with other AP CSP teachers?`,
};

export const APCSP_EXAM_TIME_STRATEGIES = {
  label: 'Strategies to help students manage their time on the exam',
  prompt: `What are some strategies to help students manage their time on the CSP exam?`,
};

export const APCSP_CREATE_PT_SAMPLE = {
  label: 'Create Performance Task samples',
  prompt: `Where can I find Create performance tasks samples?`,
};

export const APCSP_CREATE_PT_REVIEW = {
  label: 'Can teachers review student submissions?',
  prompt: `Can teachers review student submissions before they are sent to CB for scoring?`,
};

export const APCSP_CREATE_PT_COLLAB = {
  label: 'Student collaboration on the Create Task',
  prompt: `Who can students collaborate with on the Create PT?`,
};

export const APCSP_CREATE_PT_AI = {
  label: 'AI Tools on the Create Task',
  prompt: `Can students use AI tools on the Create PT?`,
};

export const APCSP_CREATE_PT_GRADE = {
  label: 'Can I grade the Create Task',
  prompt: `Can I give students a grade on their Create PT?`,
};

export const APCSP_CREATE_PT_PREPARATION = {
  label: 'Resources to prepare for written responses',
  prompt: `Where can I find resources to help students prepare the written response portion of the Create PT?`,
};

export const APCSP_DUMMY_CREATE = {
  label: 'Create task support',
  prompt: '',
  response: `Let’s chat about the Create Task! Here are some ideas you can ask me, or type your question below`,
  followUpPrompts: [
    APCSP_CREATE_PT_AI,
    APCSP_CREATE_PT_COLLAB,
    APCSP_CREATE_PT_GRADE,
    APCSP_CREATE_PT_PREPARATION,
    APCSP_CREATE_PT_REVIEW,
    APCSP_CREATE_PT_SAMPLE,
  ],
};

export const APCSP_DUMMY_EXAM = {
  label: 'AP exam support',
  prompt: '',
  response: `I would love to support your classroom as you get ready for the AP exam.  Here are some ideas you can ask me, or type your question below`,
  followUpPrompts: [
    APCSP_EXAM_BIG_IDEAS,
    APCSP_EXAM_CONNECT_WITH_TEACHERS,
    APCSP_EXAM_PREPARATION_RESOURCES,
    APCSP_EXAM_SAMPLE_QUESTIONS,
    APCSP_EXAM_TIME_STRATEGIES,
  ],
};

export const DEBUG_THIS_CODE = {
  label: 'Debug this code',
  prompt: 'Please tell me what the bugs are in this student code.',
};

export const IMPROVE_THIS_CODE = {
  label: 'Improve this code',
  prompt: 'How can this student code be improved?',
};
