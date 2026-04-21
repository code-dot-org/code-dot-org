/**
 * AI Fundamentals (AIF) Course-Specific Prompts
 *
 * These prompts are specific to the AI Fundamentals curriculum and appear only when
 * teachers have AIF assigned to their sections.
 *
 * Use this file for prompts that:
 * - Explain AIF course philosophy and pedagogy
 * - Help with curriculum logistics and pacing
 * - Support teacher preparation for teaching AI concepts
 * - Direct teachers to AIF-specific resources and materials
 *
 * Structure:
 * - Individual prompts organized by category
 * - Menu launcher prompts (*_MENU) that show a response + follow-up prompts
 *
 * These prompts are injected as additionalPrompts when curriculumCourses includes 'aif'.
 */

import {ChatPrompt} from '@cdo/apps/aiDifferentiation/types';

// ==================== COURSE PHILOSOPHY & BIG PICTURE ====================

export const AIF_PEDAGOGY: ChatPrompt = {
  label: 'More about Pedagogy',
  prompt: 'What is the underlying pedagogy?',
};

export const AIF_WHICH_UNITS: ChatPrompt = {
  label: 'Which units should I teach?',
  prompt: 'Which units should I teach?',
};

export const AIF_PREREQUISITES: ChatPrompt = {
  label: 'Explore Prerequisites',
  prompt: 'Are there prerequisites for this course?',
};

// ==================== CURRICULUM LOGISTICS & PACING ====================

export const AIF_PACING_GUIDE: ChatPrompt = {
  label: 'Explore Pacing Guide',
  prompt: 'Where is the pacing guide?',
};

export const AIF_COURSE_PROJECTS: ChatPrompt = {
  label: 'Learn about projects',
  prompt: 'What are the major course projects?',
};

export const AIF_TECHNICAL_REQUIREMENTS: ChatPrompt = {
  label: 'More about technical requirements',
  prompt: 'What are the technical requirements?',
};

export const AIF_GRADING_PHILOSOPHY: ChatPrompt = {
  label: 'Learn about grading philosophy',
  prompt: 'What is the grading philosophy for this course?',
};

// ==================== TEACHER PREPARATION & SUPPORT ====================

export const AIF_TEACHER_PREP: ChatPrompt = {
  label: 'Prepare to teach',
  prompt: 'What concepts should I know before teaching this course?',
};

export const AIF_PROFESSIONAL_DEVELOPMENT: ChatPrompt = {
  label: 'Explore Professional Development',
  prompt: 'Is there professional development for this course?',
};

export const AIF_TEACHER_COMMUNITY: ChatPrompt = {
  label: 'Join the teacher community',
  prompt: 'Is there a teacher community I can join?',
};

export const AIF_TECHNICAL_SUPPORT: ChatPrompt = {
  label: 'Get Technical Support',
  prompt: 'How can I get technical support?',
};

// ==================== FINDING AND UNDERSTANDING MATERIALS ====================

export const AIF_STUDENT_RESOURCES: ChatPrompt = {
  label: 'Explore Student Resources',
  prompt: 'Where are the student-facing resources?',
};

export const AIF_LESSON_PLANS: ChatPrompt = {
  label: 'Lesson Plans',
  prompt: 'Where can I find the lesson plans?',
};

export const AIF_TEACHER_RESOURCES: ChatPrompt = {
  label: 'Explore Teacher Resources',
  prompt: 'Where can I find any teacher resources?',
};

// ==================== MENU LAUNCHER PROMPTS ====================

export const AIF_PHILOSOPHY_MENU: ChatPrompt = {
  label: 'Course Philosophy & Big Picture',
  prompt: '',
  response: `Let's explore the philosophy and structure of the AI Fundamentals course. Here are some ideas you can ask me, or type your question below`,
  followUpPrompts: [AIF_PEDAGOGY, AIF_WHICH_UNITS, AIF_PREREQUISITES],
};

export const AIF_LOGISTICS_MENU: ChatPrompt = {
  label: 'Curriculum Logistics & Pacing',
  prompt: '',
  response: `Let's look at the logistics and pacing for AI Fundamentals. Here are some ideas you can ask me, or type your question below`,
  followUpPrompts: [
    AIF_PACING_GUIDE,
    AIF_COURSE_PROJECTS,
    AIF_TECHNICAL_REQUIREMENTS,
    AIF_GRADING_PHILOSOPHY,
  ],
};

export const AIF_TEACHER_PREP_MENU: ChatPrompt = {
  label: 'Teacher Preparation & Support',
  prompt: '',
  response: `Let's talk about preparing to teach AI Fundamentals. Here are some ideas you can ask me, or type your question below`,
  followUpPrompts: [
    AIF_TEACHER_PREP,
    AIF_PROFESSIONAL_DEVELOPMENT,
    AIF_TEACHER_COMMUNITY,
    AIF_TECHNICAL_SUPPORT,
  ],
};

export const AIF_MATERIALS_MENU: ChatPrompt = {
  label: 'Finding Materials & Resources',
  prompt: '',
  response: `Let's find the materials you need for AI Fundamentals. Here are some ideas you can ask me, or type your question below`,
  followUpPrompts: [
    AIF_STUDENT_RESOURCES,
    AIF_LESSON_PLANS,
    AIF_TEACHER_RESOURCES,
  ],
};
