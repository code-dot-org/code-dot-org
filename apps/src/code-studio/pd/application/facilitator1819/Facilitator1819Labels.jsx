import React from 'react';

// Labels by page name
const pageLabels = {
  Section1QuestionsAboutYou: {
    title: "Title",
    firstName: "First Name",
    preferredFirstName: "Preferred First Name",
    lastName: "Last Name",
    accountEmail: "Account Email",
    alternateEmail: "If you use another email, enter it here:",
    phone: "Phone",
    address: "Home Address",
    city: "City",
    state: "State",
    zipCode: "Zip Code",
    genderIdentity: "Gender Identity",
    race: "Race",
    institutionType: "What type of institution do you work for?",
    currentEmployer: "Current employer",
    jobTitle: "What is your job title?",
    resumeLink: "Please provide a link to your resume, LinkedIn profile, website, or summarize your relevant past experience.",
    workedInCsJob: "Have you worked in a job that requires computer science knowledge?",
    csRelatedJobRequirements: "What were your CS-related job requirements?",
    completedCsCoursesAndActivities: "Which of the following computer science education courses or activities have you completed?",
    diversityTraining: "Have you engaged in training and development focused on diversity, equity, and/or inclusion?",
    diversityTrainingDescription: "Please briefly describe",
    howHeard: "How did you hear about this opportunity?"
  },

  Section2ChooseYourProgram: {
    program: (
      <span>
      We offer our Facilitator Development Program for three Code.org curricula.
      Please choose one curriculum for which you would like to become a facilitator this year.
      For more details about the requirements to facilitate each program, please visit the{' '}
        <a
          href="https://docs.google.com/document/d/1aX-KH-t6tgjGk2WyvJ7ik7alH4kFTlZ0s1DsrCRBq6U"
          target="_blank"
        >
        2018-19 Facilitator Development Program Description
      </a>.
    </span>
    ),
    planOnTeaching: "Do you plan on teaching this course in the 2018-19 school year?",
    abilityToMeetRequirements: (
      <span>
      After reviewing the{' '}
        <a
          href="https://docs.google.com/document/d/1aX-KH-t6tgjGk2WyvJ7ik7alH4kFTlZ0s1DsrCRBq6U"
          target="_blank"
        >
        Program Description
      </a>{' '}
        how would you rate your ability to meet the requirements and commitments for this program?
    </span>
    ),
    csfAvailability: "Are you available to attend the three-day Facilitator-in-Training workshop from Saturday, March 3 - Monday, March 5, 2018?",
    csfPartialAttendanceReason: "Please explain why you will be unable to attend the Monday portion of the training",
    csdCspTeacherconAvailability: "Are you available to attend one of the following five-day TeacherCons? (You only have to attend one. Mark all that you can attend)",
    csdCspFitAvailability: "Are you available to attend one of the following two-day Facilitator-in-Training workshops? (You only have to attend one. Mark all that you can attend):"
  },

  Section3LeadingStudents: {
    ledCsExtracurriculars: "Have you led or organized extracurricular computer science learning experiences? Please mark all that apply.",
    teachingExperience: "Do you have classroom teaching experience for K-12 students or adults?",
    gradesTaught: (
      <span>
      What grade levels have you taught
        {' '}<strong>in the past?</strong>{' '}
        Check all that apply.
    </span>
    ),
    gradesCurrentlyTeaching: (
      <span>
      What grade levels do you
        {' '}<strong>currently</strong>{' '}
        teach? Check all that apply.
    </span>
    ),
    subjectsTaught: "Which subjects do you currently or have you previously taught? Check all that apply.",
    yearsExperience: "How many years of experience do you have teaching computer science for K-12 students or adults?",
    experienceLeading: (
      <span>
      Which of the following do you have experience leading
        {' '}<strong>as a teacher</strong>{' '}
        (mark all that apply)?
    </span>
    ),
    completedPd: (
      <span>
      Which of the following Code.org professional learning programs did you complete
        {' '}<strong>as a teacher</strong>{' '}
        (mark all that apply)?
    </span>
    )
  },

  Section4FacilitationExperience: {
    codeOrgFacilitator: "Are you currently or have you been a Code.org facilitator in the past?",
    codeOrgFacilitatorYears: "In which years did you work as a Code.org facilitator (mark all that apply)?",
    codeOrgFacilitatorPrograms: "Please check the Code.org programs you’ve facilitated for us in the past (mark all that apply):",
    haveLedPd: "Have you led professional development in the past?",
    groupsLedPd: "What groups have you led professional development for in the past? (check all that apply)",
    describePriorPd: "Please describe your prior experience leading professional development experiences. (500 characters max)",
    whyNoPd: "Please give more context as to why you haven’t had prior experience leading professional development experiences. (500 characters max)"
  },

  Section5YourApproachToLearningAndLeading: {
    whoShouldHaveOpportunity: "Who should have the opportunity to learn computer science? Why?",
    howSupportEquity: "How do you support equity in your own classroom or role?",

    expectedTeacherNeeds:
      "Teachers in Code.org’s Professional Learning Program join us with a wide range of experiences \
      (or lack thereof) in computer science education. What are some of the unique needs you’d expect \
      to find in a cohort of these teachers?",

    describeAdaptingLessonPlan:
      "Describe a time when you’ve had to adapt a lesson plan in the moment to meet the needs of your students or participants.",

    describeStrategies:
      "Have you used “lead learner” or “inquiry-based” strategies in your work with youth and/or adults? \
      If so, briefly describe how you have used these strategies.",

    exampleHowUsedFeedback: (
      <span>
      Please provide a brief example of how you’ve used feedback
        {' '}<strong>you’ve received from a colleague</strong>{' '}
        to improve your performance.
    </span>
    ),

    exampleHowProvidedFeedback: (
      <span>
      Please provide a brief example of how
        {' '}<strong>you’ve provided feedback to a colleague</strong>
      , and how that person responded to your feedback.
    </span>
    ),

    hopeToLearn: "What do you hope to learn from the facilitator development program?"
  },

  Section6Logistics: {
    availableDuringWeek:
      "During the school year, are you available during the week (Monday - Friday) to attend phone calls or virtual meetings?",

    weeklyAvailability:
      "During the school year, what times during the week (Monday - Friday) \
      are you available to attend phone calls or virtual meetings? (mark all that apply)",

    travelDistance:
      "What distance are you willing to travel to facilitate workshops? \
      Expenses may be covered for travel that requires overnight stays."
  },

  Section7Submission: {
    additionalInfo:
      "Please provide any additional information you’d like Code.org to have about your application. (500 characters max)",

    agree: "By submitting this application, I agree to share my contact information and application with Code.org’s Regional Partners."
  }
};

const allLabels = Object.keys(pageLabels).reduce((allLabels, page) =>
  Object.assign(allLabels, pageLabels[page]), {});

export {pageLabels, allLabels};
