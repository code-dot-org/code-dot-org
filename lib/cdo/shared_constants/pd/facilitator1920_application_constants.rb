module Pd
  module Facilitator1920ApplicationConstants
    include FacilitatorCommonApplicationConstants
    # Remove newlines and leading whitespace from multiline strings
    def self.clean_multiline(string)
      string.gsub(/\n\s*/, ' ')
    end
    YES_NO = %w(Yes No).freeze

    SECTION_HEADERS = BASE_SECTION_HEADERS.freeze
    PAGE_LABELS = BASE_PAGE_LABELS.freeze

    ALL_LABELS = PAGE_LABELS.values.reduce(:merge).freeze
    ALL_LABELS_WITH_OVERRIDES = ALL_LABELS.map {|k, v| [k, LABEL_OVERRIDES[k] || v]}.to_h.freeze

    ALL_KEYS = PAGE_LABELS.values.flat_map(&:keys)
    CSF_SPECIFIC_KEYS = ALL_KEYS.select {|a| a.to_s =~ /^csf/}
    CSD_SPECIFIC_KEYS = ALL_KEYS.select {|a| a.to_s =~ /^csd/}
    CSP_SPECIFIC_KEYS = ALL_KEYS.select {|a| a.to_s =~ /(^csd_csp|^csp)/}

    VALID_SCORES = {
      # Minimum requirements
      regional_partner_name: YES_NO,
      csf_good_standing_requirement: YES_NO,
      teaching_experience: YES_NO,
      have_led_adults: YES_NO,
      csf_summit_requirement: YES_NO,
      csf_workshop_requirement: YES_NO,
      csf_community_requirement: YES_NO,
      development_and_preparation_requirement: YES_NO,
      csd_csp_workshop_requirement: YES_NO,
      csd_csp_lead_summer_workshop_requirement: YES_NO,
      csd_csp_fit_weekend_requirement: YES_NO,
      csd_training_requirement: YES_NO,
      csd_csp_deeper_learning_requirement: YES_NO,
      csd_csp_good_standing_requirement: YES_NO,
      csp_training_requirement: YES_NO,
      # Bonus Points
      currently_involved_in_cs_education: [0, 3, 5],
      grades_taught: [0, 3, 5],
      experience_teaching_this_course: [0, 3, 5],
      completed_pd: [0, 3, 5],
      why_should_all_have_access: [0, 3, 5],
      skills_areas_to_improve: [0, 3, 5],
      inquiry_based_learning: [0, 3, 5],
      why_interested: [0, 3, 5],
      question_1: [0, 3, 5],
      question_2: [0, 3, 5],
      question_3: [0, 3, 5],
      question_4: [0, 3, 5],
      question_5: [0, 3, 5]
    }

    SCOREABLE_QUESTIONS = {
      bonus_points: [
        :currently_involved_in_cs_education,
        :grades_taught,
        :experience_teaching_this_course,
        :completed_pd,
        :why_should_all_have_access,
        :skills_areas_to_improve,
        :inquiry_based_learning,
        :why_interested,
        :question_1,
        :question_2,
        :question_3,
        :question_4,
        :question_5
      ],
      criteria_score_questions_csf: [
        :regional_partner_name,
        :csf_good_standing_requirement,
        :teaching_experience,
        :have_led_adults,
        :csf_summit_requirement,
        :csf_workshop_requirement,
        :csf_community_requirement,
        :development_and_preparation_requirement
      ],
      criteria_score_questions_csd: [
        :regional_partner_name,
        :teaching_experience,
        :have_led_adults,
        :csd_csp_workshop_requirement,
        :csd_csp_lead_summer_workshop_requirement,
        :csd_csp_fit_weekend_requirement,
        :csd_training_requirement,
        :csd_csp_lead_summer_workshop_requirement,
        :csd_csp_deeper_learning_requirement,
        :development_and_preparation_requirement,
        :csd_csp_good_standing_requirement
      ],
      criteria_score_questions_csp: [
        :regional_partner_name,
        :teaching_experience,
        :have_led_adults,
        :csd_csp_workshop_requirement,
        :csd_csp_lead_summer_workshop_requirement,
        :csd_csp_fit_weekend_requirement,
        :csp_training_requirement,
        :csd_csp_lead_summer_workshop_requirement,
        :csd_csp_deeper_learning_requirement,
        :development_and_preparation_requirement,
        :csd_csp_good_standing_requirement
      ]
    }

    BONUS_POINT_CATEGORIES = {
      application_score: [
        :currently_involved_in_cs_education,
        :grades_taught,
        :experience_teaching_this_course,
        :completed_pd,
        :why_should_all_have_access,
        :skills_areas_to_improve,
        :inquiry_based_learning,
        :why_interested
      ],
      interview_score: [
        :question_1,
        :question_2,
        :question_3,
        :question_4,
        :question_5
      ],
      teaching_experience_score: [
        :grades_taught,
        :inquiry_based_learning
      ],
      leadership_score: [
        :question_5
      ],
      champion_for_cs_score: [
        :currently_involved_in_cs_education
      ],
      equity_score: [
        :question_1,
        :question_2,
        :why_should_all_have_access
      ],
      growth_minded_score: [
        :question_3,
        :question_4,
        :skills_areas_to_improve
      ],
      content_knowledge_score: [
        :experience_teaching_this_course,
        :completed_pd
      ],
      program_commitment_score: [
        :why_interested
      ]
    }

    INTERVIEW_QUESTIONS = {
      question_1: clean_multiline(
        "Question 1: Code.org's programs are designed for teachers of all backgrounds, especially teachers with
        little to no experience with computer science. What are two strategies you would use to engage and support
        these teachers in your workshops?"
      ),

      question_2: clean_multiline(
        'Question 2: Code.org believes all students should have access to computer science education, but it can
        be challenging to help all teachers believe every student can learn computer science. What are two strategies
        you would use to support teachers who are doubtful that this material is accessible to all of their students?'
      ),

      question_3: clean_multiline(
        'Question 3: Imagine that you are co-leading a workshop with another facilitator. You are leading a
        discussion and from your perspective, the participants seem engaged. During the next break, you mention
        to your co-facilitator that you think things are going well, but she seems concerned and says that she
        thinks you should have led the session differently. How would you respond in the moment? What are the
        next steps you would take? How do you prefer to receive feedback from a colleague?'
      ),

      question_4: clean_multiline(
        "Question 4: Imagine that you are preparing to co-lead an upcoming workshop. You suggest to your
        co-facilitator, whom you have not worked with, that you meet the week before to talk through the
        agenda for the day, decide which portions you'll each lead, and discuss any questions or concerns
        you each have regarding the material. Your co-facilitator declines to meet and instead sends you an
        email with the agenda items they will lead. How would you respond in the moment? What are the next
        steps you would take? How do you prefer to give feedback to a colleague?"
      ),

      question_5: clean_multiline(
        'Question 5: Imagine you are three hours into leading a workshop. Despite your careful planning and
        following the agenda, you notice that certain voices in the room are overpowering others. Often, these
        voices do not align with the philosophy of the curriculum or the Professional Learning Program. What
        strategies would you implement to balance and redirect the conversation so more voices could be heard?
        How would you know when you were successful?'
      ),

      question_6: clean_multiline(
        'Question 6: This program requires a significant time commitment throughout the year. (Review the time
        commitments associated with the specific program). What concerns do you have about meeting this commitment?
        What support will you need from us (the Regional Partner) to fulfill this commitment? What support will
        you need from Code.org? Do you anticipate being a facilitator for multiple years?'
      ),

      question_7: clean_multiline(
        'Question 7: (Optional) If applicable, ask the applicant questions that will address regional needs.
        Does your availability match our needs in terms of frequency and timing? (ex: are you available to
        facilitate on weekdays?) Are you able and willing to assist with teacher recruitment? Are you able and
        willing to hold office hours? Other requirements?'
      )
    }.freeze

    CSV_LABELS = {
      date_applied: 'Date Applied',
      date_accepted: 'Date Accepted',
      status: 'Status',
      locked?: 'Locked',
      meets_criteria: 'Meets Minimum Requirements?',
      teaching_experience_score: 'Teaching Experience Score',
      leadership_score: 'Leadership Score',
      champion_for_cs_score: 'Champion for CS Score',
      equity_score: 'Equity Score',
      growth_minded_score: 'Growth Minded Score',
      content_knowledge_score: 'Content Knowledge Score',
      program_commitment_score: 'Program Commitment Score',
      application_score: 'Application Total Score',
      interview_score: 'Interview Total Score',
      total_score: 'Grand Total Score',
      notes: "General Notes",
      notes_2: "Notes 2",
      notes_3: "Notes 3",
      notes_4: "Notes 4",
      notes_5: "Notes 5",
      title: "Title",
      first_name: "First Name",
      last_name: "Last Name",
      account_email: "Account Email",
      alternate_email: "Alternate Email",
      phone: "Home or Cell Phone",
      address: "Home Address",
      city: "City",
      state: "State",
      zip_code: "Zip Code",
      gender_identity: "Gender Identity",
      race: "Race",
      assigned_workshop_date_and_location: 'Assigned Summer Workshop',
      friendly_registered_workshop: 'Registered Summer Workshop?',
      fit_workshop_date_and_location: 'Assigned FiT Workshop',
      friendly_registered_fit_workshop: 'Registered FiT Workshop?',
      regional_partner_name: 'Regional Partner',
      application_url: 'Link to Application',
      institution_type: 'What type of institution do you work for?',
      current_employer: 'Current employer',
      job_title:  'What is your job title?',
      program: 'Program',
      code_org_facilitator: 'Are you currently (or have you been) a Code.org facilitator?',
      code_org_facilitator_years: 'In which years did you work as a Code.org facilitator?',
      code_org_facilitator_programs: 'Please check the Code.org programs you currently facilitate, or have facilitated in the past:',
      teaching_experience: 'Do you have experience as a classroom teacher?',
      have_led_adults: 'Have you led learning experiences for adults?',
      csf_summit_requirement: 'Can you commit to attending the 2019 Facilitator Summit (May 17 - 19, 2019)?',
      csf_workshop_requirement: 'Can you commit to facilitating a minimum of 4-6 one-day workshops starting summer 2019 and continuing throughout the 2019-2020 school year?',
      csf_community_requirement: 'Can you commit to attending monthly webinars, or watching recordings, and staying up to date through bi-weekly newsletters and online facilitator communities?',
      csd_csp_no_partner_summer_workshop: clean_multiline(
        '[Not asked of everyone] The program requires attending one 5-day summer workshop hosted by your assigned Regional Partner.
        If a nearby region is interested in considering your application, we will share those workshop dates with you.'
      ),
      csd_csp_partner_but_no_summer_workshop: clean_multiline(
        '[Not asked of everyone] The program requires attending one 5-day summer workshop hosted by your assigned Regional Partner.
        However, summer workshop dates have not yet been finalized for your region. We will coordinate with
        you once workshop dates and locations are known.'
      ),
      csd_csp_partner_with_summer_workshop: clean_multiline(
        '[Not asked of everyone] The program requires attending one 5-day summer workshop hosted by your assigned Regional Partner.
        Can you commit to attending one 5-day summer workshop hosted by your assigned Regional Partner?'
      ),
      csd_csp_which_summer_workshop: '[Not asked of everyone] Your Regional Partner is hosting summer workshop(s) at the following dates and locations. Please indicate which workshops you are able to attend.',
      csd_csp_fit_weekend_requirement: 'Can you commit to attending one 3-day 2019 Facilitator-in-Training Event (during the week of July 22 - 26 or August 5 - 9)? ',
      csd_csp_which_fit_weekend: 'Please indicate which FiT Workshop you are able to attend.',
      csd_csp_workshop_requirement: 'Can you commit to leading 2019-20 academic year workshops hosted by your assigned Regional Partner (generally four days across the academic year)?',
      csd_training_requirement: 'Can you commit to attending one 2- or 3-day training in the spring of 2020 to prepare to co-lead five-day summer workshops?',
      csp_training_requirement: 'Can you commit to attending two 2- or 3-day trainings in the spring of 2020 to prepare to co-lead five-day summer workshops?',
      csd_csp_lead_summer_workshop_requirement: 'Can you commit to leading a 5-day summer workshop in the summer of 2020 hosted by your assigned Regional Partner?',
      csd_csp_deeper_learning_requirement: 'Can you commit to engaging in the Deeper Learning Program, a series of written reflections and peer reviews for each unit of the curriculum throughout the year?',
      development_and_preparation_requirement: 'Can you commit to engaging in appropriate development and preparation to be ready to lead workshops (time commitment will vary depending on experience with the curriculum and experience as a facilitator)?',
      csd_csp_good_standing_requirement: 'Can you commit to remaining in good standing with Code.org and your assigned Regional Partner?',
      csf_good_standing_requirement: 'Can you commit to remaining in good standing with Code.org and your assigned Regional Partner?',
      currently_involved_in_cs_education: 'How are you currently involved in CS education?',
      grades_taught: 'If you do have classroom teaching experience, what grade levels have you taught? Check all that apply.',
      experience_teaching_this_course: 'Do you have experience teaching the full {{CS Program}} curriculum to students?',
      plan_on_teaching: 'Do you plan on teaching this course in the 2019-20 school year?',
      csd_csp_completed_pd: "Have you participated as a teacher in Code.org's full Professional Learning Program for {{CS Program}}?",
      csf_previous_workshop: 'Have you attended a Code.org CS Fundamentals workshop?',
      facilitator_availability: 'When do you anticipate being able to facilitate? Note that depending on the program, workshops may be hosted on Saturdays or Sundays.',
      why_should_all_have_access: clean_multiline(
        "Code.org's Professional Learning Programs are open to all teachers, regardless of their experience with CS education.
        Why do you think Code.org believes that all teachers should have access to the opportunity to teach CS?"
      ),
      skills_areas_to_improve: clean_multiline(
        "Please describe a workshop you've led (or a lesson you've taught, if you haven't facilitated a workshop). Include a brief description of the workshop/lesson
        topic and audience (one or two sentences). Then describe two strengths you demonstrated, as well as two facilitation skills you would like to improve.",
      ),
      inquiry_based_learning: clean_multiline(
        "Code.org Professional Learning experiences incorporate inquiry-based learning into the workshops. Please briefly define  inquiry-based
        learning as you understand it (one or two sentences). Then, if you have led an inquiry-based activity for students, provide a concrete
        example of an inquiry-based lesson or activity you led. If you have not led an inquiry-based lesson, please write 'N/A.'",
      ),
      why_interested: 'Why do you want to become a Code.org facilitator? Please describe what you hope to learn and the impact you hope to make.',
      anything_else: 'Is there anything else you would like us to know? You can provide a link to your resume, LinkedIn profile, website, or summarize your relevant past experience.',
      how_heard: 'How did you hear about this opportunity?',
      question_1: "Interview #{INTERVIEW_QUESTIONS[:question_1]}",
      question_2: "Interview #{INTERVIEW_QUESTIONS[:question_2]}",
      question_3: "Interview #{INTERVIEW_QUESTIONS[:question_3]}",
      question_4: "Interview #{INTERVIEW_QUESTIONS[:question_4]}",
      question_5: "Interview #{INTERVIEW_QUESTIONS[:question_5]}",
      question_6: "Interview #{INTERVIEW_QUESTIONS[:question_6]}",
      question_7: "Interview #{INTERVIEW_QUESTIONS[:question_7]}"
    }
  end
end
