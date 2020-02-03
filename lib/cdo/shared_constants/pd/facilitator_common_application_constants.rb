module Pd
  module FacilitatorCommonApplicationConstants
    # Remove newlines and leading whitespace from multiline strings
    def self.clean_multiline(string)
      string.gsub(/\n\s*/, ' ')
    end

    BASE_SECTION_HEADERS = {
      about_you: 'About You',
      choose_your_program: 'Professional Learning Program',
      experience_and_commitments: 'Experience and Commitments',
      leading_students: 'Leading Students',
      your_approach_to_learning_and_leading: 'Your Approach to Learning and Leading',
      submission: 'Submission'
    }.freeze

    BASE_PAGE_LABELS = {
      about_you: {
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
        gender_identity: 'Gender Identity',
        race: 'Race',
        how_heard: 'How did you hear about this opportunity?',
      },

      choose_your_program: {
        program: 'Please choose the course for which you would like to become a facilitator.',
        csf_good_standing_requirement: 'Can you commit to remaining in good standing with Code.org and your assigned Regional Partner?',
        code_org_facilitator: 'Are you currently (or have you been) a Code.org facilitator?',
        code_org_facilitator_years: 'In which years did you work as a Code.org facilitator? Mark all that apply.',
        code_org_facilitator_programs: "Please check the Code.org programs you currently facilitate, or have facilitated in the past. Mark all that apply.",
      },

      experience_and_commitments: {
        teaching_experience: 'Do you have experience as a K-12 classroom teacher?',
        have_led_adults: 'Have you led learning experiences for adults?',
        csf_summit_requirement: 'Can you commit to attending the 2019 Facilitator Summit (May 17-19, 2019 in Atlanta, GA)?',
        csf_workshop_requirement: 'Can you commit to facilitating a minimum of 4-6 one-day workshops starting summer 2019 and continuing throughout the 2019-2020 school year?',
        csf_community_requirement: 'Can you commit to attending monthly webinars, or watching recordings, and staying up to date through bi-weekly newsletters and online facilitator communities?',
        csd_csp_fit_weekend_requirement: 'Can you commit to attending one 3-day 2019 Facilitator-in-Training Workshop?',
        csd_csp_which_fit_weekend: 'Please indicate which FiT Workshop you are able to attend.',
        csd_csp_workshop_requirement: 'Can you commit to leading 2019-20 academic year workshops hosted by your assigned Regional Partner (generally four days across the academic year)?',
        csd_training_requirement: 'Can you commit to attending __one__ 2- or 3-day training in the spring of 2020 to prepare to co-lead 5-day summer workshops?',
        csp_training_requirement: 'Can you commit to attending __two__ 2- or 3-day trainings in the spring of 2020 to prepare to co-lead 5-day summer workshops?',
        csd_csp_lead_summer_workshop_requirement: 'Can you commit to leading a 5-day summer workshop in the summer of 2020 hosted by your assigned Regional Partner?',
        csd_csp_deeper_learning_requirement: 'Can you commit to engaging in the Deeper Learning Program, a series of written reflections and peer reviews for each unit of the curriculum throughout the year?',
        development_and_preparation_requirement: clean_multiline(
          'Can you commit to engaging in appropriate development and preparation to be ready to lead workshops
          (time commitment will vary depending on experience with the curriculum and experience as a facilitator)?'
        ),
        csd_csp_good_standing_requirement: 'Can you commit to remaining in good standing with Code.org and your assigned Regional Partner?',
        csd_csp_no_partner_summer_workshop: clean_multiline(
          'The program requires attending one 5-day summer workshop hosted by your assigned Regional Partner.
          If a nearby region is interested in considering your application, we will share those workshop dates with you.'
        ),
        csd_csp_partner_but_no_summer_workshop: clean_multiline(
          'The program requires attending one 5-day summer workshop hosted by your assigned Regional Partner.
          However, summer workshop dates have not yet been finalized for your region. We will coordinate with
          you once workshop dates and locations are known.'
        ),
        csd_csp_partner_with_summer_workshop: clean_multiline(
          'The program requires attending one 5-day summer workshop hosted by your assigned Regional Partner.
          Can you commit to attending one 5-day summer workshop hosted by your assigned Regional Partner?'
        ),
        csd_csp_which_summer_workshop: 'Your Regional Partner is hosting summer workshop(s) at the following dates and locations. Please indicate which workshops you are able to attend.',
      },

      leading_students: {
        currently_involved_in_cs_education: 'How are you currently involved in CS education? Mark all that apply.',
        grades_taught: 'If you do have classroom teaching experience, what grade levels have you taught? Mark all that apply.',
        experience_teaching_this_course: 'Do you have experience teaching the full {{CS Program}} curriculum to students? Mark all that apply.',
        plan_on_teaching: 'Do you plan on teaching {{CS Program}} in the 2019-20 school year?',
        csf_previous_workshop: 'Have you attended a Code.org CS Fundamentals workshop?',
        csd_csp_completed_pd: "Have you participated as a teacher in Code.org's full Professional Learning Program for {{CS Program}}?",
        facilitator_availability: 'When do you anticipate being able to facilitate? Note that depending on the program, workshops may be hosted on Saturdays or Sundays. Mark all that apply.',
      },

      your_approach_to_learning_and_leading: {
        why_should_all_have_access: clean_multiline(
          "Code.org's Professional Learning Programs are open to all teachers, regardless of their
          experience with CS education. Why do you think Code.org believes that all teachers should
          have access to the opportunity to teach CS? (1500 characters max)"
        ),

        skills_areas_to_improve: clean_multiline(
          "Please describe a workshop you've led (or a lesson you've taught, if you haven't facilitated
          a workshop). Include a brief description  of the workshop/lesson topic and audience (one or
          two sentences). Then describe __two strengths you demonstrated__, as well as __two facilitation skills
          you would like to improve__. (1500 characters max)"
        ),

        inquiry_based_learning: clean_multiline(
          "Code.org Professional Learning experiences incorporate inquiry-based learning into the workshops.
          Please briefly define inquiry-based learning as you understand it (one or two sentences). Then, if
          you have led an inquiry-based activity for students, provide a concrete example of an inquiry-based
          lesson or activity you led. If you have not led an inquiry-based lesson, please write 'N/A.' (1500
          characters max)"
        ),

        why_interested: clean_multiline(
          "Why do you want to become a Code.org facilitator? Please describe what you hope to learn and the
          impact you hope to make. (1500 characters max)"
        ),

        anything_else: clean_multiline(
          "Is there anything else you would like us to know? You can provide a link to your resume, LinkedIn
          profile, website, or summarize your relevant past experience. (1500 characters max)"
        ),
      },

      submission: {
        agree: "By submitting this application, I agree to share my contact information and application with Code.org's Regional Partners."
      }
    }.freeze

    LABEL_OVERRIDES = {
      program: 'Please choose one curriculum for which you would like to become a facilitator this year.',
      grades_taught: 'What grade levels have you taught in the past?',
    }.freeze

    NUMBERED_QUESTIONS = %w(
      program csfAvailability
      csdCspFitAvailability ledCsExtracurriculars teachingExperience gradesTaught
      gradesCurrentlyTeaching subjectsTaught yearsExperience experienceLeading completedPd
      codeOrgFacilitator codeOrgFacilitatorYears codeOrgFacilitatorPrograms whoShouldHaveOpportunity
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
      not_available_for_fit_weekend: "I'm not available for either Facilitator-in-Training workshop. (Please Explain):".freeze,
      not_sure_please_explain: 'Not sure (Please explain):'.freeze,
      unable_to_attend_please_explain: "I'm not able to attend any of the above workshop dates. (Please explain):".freeze
    }.freeze
  end
end
