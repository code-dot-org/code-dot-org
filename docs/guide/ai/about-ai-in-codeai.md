---
title: About AI in CodeAI
description: What the AI features do, what student data they use, and the safety measures in place.
type: concept
---

CodeAI uses AI in several places. Each feature is available only in specific courses and only when certain conditions are met.

## AI evaluation for rubrics

On rubric-backed levels, you can ask AI to suggest an evidence level for each learning goal. The AI reads the student's code and highlights the lines it considered. You review, adjust, and submit the final scores.

AI evaluation is available on levels where a curriculum author has configured a rubric with AI-enabled learning goals. If the rubric panel shows a **Run AI Assessment for Project** button, AI evaluation is available for that level. You must be a [verified teacher](/guide/professional-learning/become-a-verified-teacher/).

See [Review an AI evaluation](/guide/ai/review-ai-evaluation/).

## AI Chat in lessons

Some courses include levels where students chat with an AI model about the lesson topic. You control whether your class has access, and you can see each student's chat history. The **AI Settings** tab appears in the teacher dashboard sidebar when your section is assigned a course that includes AI Chat levels.

See [Control AI for your class](/guide/ai/control-ai-for-your-class/).

## Other AI-powered features

In **AI Lab**, students train a small machine-learning model on a dataset and see what it predicts; this runs entirely in the browser. Some levels also include practice problems where AI evaluates answers for correctness.

## What the AI does not do

- It does not assign final grades. A teacher always submits the rubric evaluation.
- It does not contact students directly. AI Chat responds only when a student types in a chat level.
- It does not make decisions about a student's placement, advancement, or eligibility.

## Student data and privacy

AI Chat messages are sent to a language model hosted by a third-party provider. The message content includes what the student typed and the lesson context; it does not include the student's name, email, or other personal information that CodeAI holds.

Before any message reaches the AI model, CodeAI screens it for personally identifiable information (PII) and profanity. If screening finds PII or blocked language, the request is stopped and the student sees an error. The same screening runs on the AI's response before it reaches the student. A teacher can see a student's AI Chat history for their section.

## Safety measures

Every AI request passes through a safety pipeline:

1. **Input screening.** Text is checked for PII (via Amazon Comprehend in production) and profanity (via WebPurify).
2. **Model response.** The AI model generates a response.
3. **Output screening.** The response is checked for inappropriate content before it is shown.

For AI Chat levels that generate images, an additional image-safety check runs on the generated image. These measures reduce risk but do not eliminate it. If a student sees something inappropriate, they or their teacher can report it.

## Further reading

- [Review an AI evaluation](/guide/ai/review-ai-evaluation/)
- [Control AI for your class](/guide/ai/control-ai-for-your-class/)
