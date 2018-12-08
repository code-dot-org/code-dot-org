module Pd
  module FacilitatorCommonApplicationConstants
    # Remove newlines and leading whitespace from multiline strings
    def self.clean_multiline(string)
      string.gsub(/\n\s*/, ' ')
    end

    BASE_SECTION_HEADERS = {
      section_1_about_you: 'About You',
      section_2_choose_your_program: 'Professional Learning Program',
      section_3_experience_and_commitments: 'Experience and Commitments',
      section_4_leading_students: 'Leading Students',
      section_5_your_approach_to_learning_and_leading: 'Your Approach to Learning and Leading',
      section_6_logistics: 'Logistics',
      section_7_submission: 'Submission'
    }.freeze

    BASE_PAGE_LABELS = {
      section_1_about_you: {
        title: 'Title',
        first_name: 'First name',
        last_name: 'Last name',
        account_email: 'Code.org account email',
        alternate_email: 'If you use another email (especially during summer months), enter it here:',
        phone: 'Home or cell phone',
        address: 'Home address',
        city: 'City',
        state: 'State',
        zip_code: 'Zip code',
        institution_type: 'What type of institution do you work for?',
        current_employer: 'Current employer',
        job_title: 'What is your job title?',
      },

      section_2_choose_your_program: {
        program: 'Please choose the course for which you would like to become a facilitator.',
        code_org_facilitator: 'Are you currently (or have you been) a Code.org facilitator?',
        code_org_facilitator_years: 'In which years did you work as a Code.org facilitator? Mark all that apply.',
        code_org_facilitator_programs: "Please check the Code.org programs you currently facilitate, or have facilitated in the past. Mark all that apply.",
      },

      section_3_experience_and_commitments: {
      },

      section_4_leading_students: {
        currently_involved_in_cs_education: 'How are you currently involved in CS education? Mark all that apply.',
        grades_taught: 'If you do have classroom teaching experience, what grade levels have you taught? Mark all that apply.',
        experience_teaching_this_course: 'Do you have experience teaching the full {{CS Program}} curriculum to students? Mark all that apply.',
        plan_on_teaching: 'Do you plan on teaching {{CS Program}} in the 2019-20 school year?',
        completed_pd: "Have you participated as a teacher in Code.org's full Professional Learning Program for {{CS Program}}?",
        facilitator_availability: 'When do you anticipate being able to facilitate? Note that depending on the program, workshops may be hosted on Saturdays or Sundays. Mark all that apply.',
      },

      section_5_your_approach_to_learning_and_leading: {
        why_should_all_have_access: clean_multiline(
          "Code.org's Professional Learning Programs are open to all teachers, regardless of their
          experience with CS education. Why do you think Code.org believes that all teachers should
          have access to the opportunity to teach CS? (750 characters max)"
        ),

        skills_areas_to_improve: clean_multiline(
          "Please describe a workshop you've led (or a lesson you've taught, if you haven't facilitated
          a workshop). Include a brief description  of the workshop/lesson topic and audience (one or
          two sentences). Then describe __two strengths you demonstrated__, as well as __two facilitation skills
          you would like to improve__. (1,500 characters max)"
        ),

        inquiry_based_learning: clean_multiline(
          "Code.org Professional Learning experiences incorporate inquiry-based learning into the workshops.
          Please briefly define inquiry-based learning as you understand it (one or two sentences). Then, if
          you have led an inquiry-based activity for students, provide a concrete example of an inquiry-based
          lesson or activity you led. If you have not led an inquiry-based lesson, please write 'N/A.' (1,500
          characters max)"
        ),

        why_interested: clean_multiline(
          "Why do you want to become a Code.org facilitator? Please describe what you hope to learn and the
          impact you hope to make. (750 characters max)"
        ),

        anything_else: clean_multiline(
          "Is there anything else you would like us to know? You can provide a link to your resume, LinkedIn
          profile, website, or summarize your relevant past experience. (750 characters max)"
        ),

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
        gender_identity: 'Gender Identity',
        race: 'Race',
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
      completed_pd: 'Which of the following Code.org professional learning programs did you complete as a teacher?',
    }.freeze

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

    TEXT_FIELDS = {
      other_with_text: 'Other:'.freeze,
      other_please_list: 'Other (Please List):'.freeze,
      other_please_explain: 'Other (Please Explain):'.freeze,
      other_please_describe: 'Other (Please Describe):'.freeze,
      how_heard_facilitator: 'A Code.org facilitator (please share name):'.freeze,
      how_heard_code_org_staff: 'A Code.org staff member (please share name):'.freeze,
      how_heard_regional_partner: 'A Code.org Regional Partner (please share name):'.freeze,
      not_available_for_teachercon: "I'm not available for either TeacherCon. (Please Explain):".freeze,
      not_available_for_fit_weekend: "I'm not available for either Facilitator-in-Training workshop. (Please Explain):".freeze
    }.freeze
  end
end
