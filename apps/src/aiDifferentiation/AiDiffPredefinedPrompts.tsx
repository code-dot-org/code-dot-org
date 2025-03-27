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
