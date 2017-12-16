module Facilitator1819ApplicationConstants
  # Remove newlines and leading whitespace from multiline strings
  def self.clean_multiline(string)
    string.gsub(/\n\s*/, ' ')
  end

  SECTION_HEADERS = {
    section_1_about_you: 'About You',
    section_2_choose_your_program: 'Choose Your Program',
    section_3_leading_students: 'Leading Students',
    section_4_facilitation_experience: 'Facilitation Experience',
    section_5_your_approach_to_learning_and_leading: 'Your Approach to Learning and Leading',
    section_6_logistics: 'Logistics',
    section_7_submission: 'Submission'
  }.freeze

  PAGE_LABELS = {
    section_1_about_you: {
      title: 'Title',
      first_name: 'First Name',
      preferred_first_name: 'Preferred First Name',
      last_name: 'Last Name',
      account_email: 'Account Email',
      alternate_email: 'If you use another email, enter it here:',
      phone: 'Phone',
      address: 'Home Address',
      city: 'City',
      state: 'State',
      zip_code: 'Zip Code',
      gender_identity: 'Gender Identity',
      race: 'Race',
      institution_type: 'What type of institution do you work for?',
      current_employer: 'Current employer',
      job_title: 'What is your job title?',
      resume_link: 'Please provide a link to your resume, LinkedIn profile, website, or summarize your relevant past experience. (500 characters max)',
      worked_in_cs_job: 'Have you worked in a job that requires computer science knowledge?',
      cs_related_job_requirements: 'What were your CS-related job requirements? (500 characters max)',
      completed_cs_courses_and_activities: 'Which of the following computer science education courses or activities have you completed?',
      diversity_training: 'Have you engaged in training and development focused on diversity, equity, and/or inclusion?',
      diversity_training_description: 'Please briefly describe (500 characters max)',
      how_heard: 'How did you hear about this opportunity?'
    },

    section_2_choose_your_program: {
      program: clean_multiline(
        'We offer our Facilitator Development Program for three Code.org curricula.
         Please choose one curriculum for which you would like to become a facilitator this year.
         For more details about the requirements to facilitate each program, please visit the
         [2018-19 Facilitator Development Program Description](https://docs.google.com/document/d/1aX-KH-t6tgjGk2WyvJ7ik7alH4kFTlZ0s1DsrCRBq6U).'
      ),
      plan_on_teaching: 'Do you plan on teaching this course in the 2018-19 school year?',
      ability_to_meet_requirements: clean_multiline(
        'After reviewing the [Program Description](https://docs.google.com/document/d/1aX-KH-t6tgjGk2WyvJ7ik7alH4kFTlZ0s1DsrCRBq6U)
         how would you rate your ability to meet the requirements and commitments for this program?'
      ),
      csf_availability: 'Are you available to attend the three-day Facilitator-in-Training workshop from Saturday, March 3 - Monday, March 5, 2018?',
      csf_partial_attendance_reason: 'Please explain why you will be unable to attend the Monday portion of the training',
      csd_csp_teachercon_availability:
        'Are you available to attend one of the following five-day TeacherCons? (You only have to attend one. Mark all that you can attend)',
      csd_csp_fit_availability: clean_multiline(
        'Are you available to attend one of the following two-day Facilitator-in-Training workshops?
        (You only have to attend one. Mark all that you can attend):'
      )
    },

    section_3_leading_students: {
      led_cs_extracurriculars: 'Have you led or organized extracurricular computer science learning experiences? Please mark all that apply.',
      teaching_experience: 'Do you have classroom teaching experience for K-12 students or adults?',
      grades_taught: 'What grade levels have you taught __in the past?__ Check all that apply.',
      grades_currently_teaching: 'What grade levels do you __currently__ teach? Check all that apply.',
      subjects_taught: 'Which subjects do you currently or have you previously taught? Check all that apply.',
      years_experience: 'How many years of experience do you have teaching computer science for K-12 students or adults?',
      experience_leading: 'Which of the following do you have experience leading __as a teacher__ (mark all that apply)?',
      completed_pd: 'Which of the following Code.org professional learning programs did you complete __as a teacher__ (mark all that apply)?'
    },

    section_4_facilitation_experience: {
      code_org_facilitator: 'Are you currently or have you been a Code.org facilitator in the past?',
      code_org_facilitator_years: 'In which years did you work as a Code.org facilitator (mark all that apply)?',
      code_org_facilitator_programs: "Please check the Code.org programs you've facilitated for us in the past (mark all that apply):",
      have_led_pd: 'Have you led professional development in the past?',
      groups_led_pd: 'What groups have you led professional development for in the past? (check all that apply)',
      describe_prior_pd: 'Please describe your prior experience leading professional development experiences. (500 characters max)'
    },

    section_5_your_approach_to_learning_and_leading: {
      who_should_have_opportunity: 'Who should have the opportunity to learn computer science? Why? (750 characters max)',
      how_support_equity: 'How do you support equity in your own classroom or role? (750 characters max)',

      expected_teacher_needs: clean_multiline(
        "Teachers in Code.org's Professional Learning Program join us with a wide range of experiences
         (ex: from brand new teachers to teachers who have taught CS for 10+ years)
         in computer science education. What are some of the unique needs you'd expect
         to find in a cohort of these teachers? (750 characters max)"
      ),
      describe_adapting_lesson_plan: clean_multiline(
        "Describe a time when you've had to adapt a lesson plan in the moment to meet the needs of your
         students or participants. (750 characters max)"
      ),

      describe_strategies: clean_multiline(
        'Have you used “lead learner” or “inquiry-based” strategies in your work with youth and/or adults?
         If so, briefly describe how you have used these strategies. (750 characters max)'
      ),

      example_how_used_feedback: clean_multiline(
        "Please provide a brief example of how you've used feedback __you've received from a colleague__
         to improve your performance. (750 characters max)"
      ),

      example_how_provided_feedback: clean_multiline(
        "Please provide a brief example of how __you've provided feedback to a colleague__
         and how that person responded to your feedback. (750 characters max)"
      ),

      hope_to_learn: 'What do you hope to learn from the facilitator development program? (750 characters max)'
    },

    section_6_logistics: {
      available_during_week:
        'During the school year, are you available during the week (Monday - Friday) to attend phone calls or virtual meetings?',

      weekly_availability: clean_multiline(
        'During the school year, what times during the week (Monday - Friday)
         are you available to attend phone calls or virtual meetings? (mark all that apply)'
      ),

      travel_distance: clean_multiline(
        'What distance are you willing to travel to facilitate workshops?
         Expenses may be covered for travel that requires overnight stays.'
      )
    },

    section_7_submission: {
      additional_info:
        "Please provide any additional information you'd like Code.org to have about your application. (500 characters max)",

      agree: "By submitting this application, I agree to share my contact information and application with Code.org's Regional Partners."
    }
  }.freeze

  LABEL_OVERRIDES = {
    program: 'Please choose one curriculum for which you would like to become a facilitator this year.',
    ability_to_meet_requirements: 'How would you rate your ability to meet the requirements and commitments for this program?',
    grades_taught: 'What grade levels have you taught in the past?',
    grades_currently_teaching: 'What grade levels do you teach?',
    experience_leading: 'Which of the following do you have experience leading as a teacher?',
    completed_pd: 'Which of the following Code.org professional learning programs did you complete as a teacher?'
  }.freeze

  ALL_LABELS = PAGE_LABELS.values.reduce(:merge).freeze
  ALL_LABELS_WITH_OVERRIDES = ALL_LABELS.map {|k, v| [k, LABEL_OVERRIDES[k] || v]}.to_h.freeze

  NUMBERED_QUESTIONS = %w(
    workedInCsJob csRelatedJobRequirements diversityTraining program
    abilityToMeetRequirements csfAvailability csdCspTeacherconAvailability
    csdCspFitAvailability ledCsExtracurriculars teachingExperience gradesTaught
    gradesCurrentlyTeaching subjectsTaught yearsExperience experienceLeading completedPd
    codeOrgFacilitator codeOrgFacilitatorYears codeOrgFacilitatorPrograms haveLedPd
    groupsLedPd describePriorPd whoShouldHaveOpportunity howSupportEquity
    expectedTeacherNeeds describeAdaptingLessonPlan describeStrategies
    exampleHowUsedFeedback exampleHowProvidedFeedback hopeToLearn
  ).freeze
end
