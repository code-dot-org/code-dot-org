module Pd
  module TeacherCommonApplicationConstants
    YES_NO = %w(Yes No).freeze

    # Remove newlines and leading whitespace from multiline strings
    def self.clean_multiline(string)
      string.gsub(/\n\s*/, ' ')
    end

    LABEL_OVERRIDES = {
      taught_in_past: 'Have you taught computer science courses or activities in the past?',
      program: 'Which professional learning program would you like to join for the 2020-21 school year?',
      csd_which_grades: 'To which grades does your school plan to offer CS Discoveries?',
      csp_which_grades: 'To which grades does your school plan to offer CS Principles?',
      csp_ap_exam: 'Are you planning for your students to take the AP CS Principles exam in the spring of 2019?',
      alternate_workshops: 'Which of the following alternate workshops are you available to attend?',
      willing_to_travel: 'How far would you be willing to travel to each workshop?'
    }.freeze

    VALID_SCORES = {
      regional_partner_name: YES_NO,
      previous_yearlong_cdo_pd: YES_NO,
      committed: YES_NO,
      able_to_attend_single: YES_NO,
      able_to_attend_multiple: YES_NO,
      csp_which_grades: YES_NO,
      csp_course_hours_per_year: YES_NO,
      csd_which_grades: YES_NO,
      csd_terms_per_year: YES_NO,
      principal_approval: YES_NO,
      schedule_confirmed: YES_NO,
      diversity_recruitment: YES_NO,
      free_lunch_percent: [5, 0],
      underrepresented_minority_percent: [5, 0],
      wont_replace_existing_course: [5, 0],
      taught_in_past: [2, 0],
      csp_how_offer: [2, 0]
    }.freeze

    CRITERIA_SCORE_QUESTIONS_CSP = (
      VALID_SCORES.select {|_, v| v == YES_NO}.keys - [:csd_which_grades, :csd_terms_per_year]
    ).freeze
    CRITERIA_SCORE_QUESTIONS_CSD = (
      VALID_SCORES.select {|_, v| v == YES_NO}.keys -
        [:csp_how_offer, :csp_which_grades, :csp_course_hours_per_year]
    ).freeze

    TEXT_FIELDS = {
      other_with_text: 'Other:'.freeze,
      other_please_list: 'Other (Please List):'.freeze,
      other_please_explain: 'Other (Please Explain):'.freeze,
      not_teaching_this_year: "I'm not teaching this year (Please Explain):".freeze,
      not_teaching_next_year: "I'm not teaching next year (Please Explain):".freeze,
      dont_know_if_i_will_teach_explain: "I don't know if I will teach this course (Please Explain):".freeze,
      unable_to_attend: "No, I'm unable to attend (Please Explain):".freeze,
      able_to_attend_single: "Yes, I'm able to attend".freeze,
      no_explain: "No (Please Explain):".freeze,
      no_pay_fee: "No, my school or I will not be able to pay the summer workshop program fee.".freeze,
      i_dont_know_explain: "I don't know (Please Explain):",
      no_pay_fee_2021: 'No, my school will not be able to pay the program fee. I would like to be considered for a scholarship.',
      no_pay_fee_1920: 'No, my school will not be able to pay the program fee. I would like to be considered for a scholarship.',
      not_sure_explain: 'Not sure (Please Explain):',
      unable_to_attend_2021: 'I’m not able to attend any of the above workshop dates. (Please Explain):',
      unable_to_attend_1920: 'I’m not able to attend any of the above workshop dates. (Please Explain):'
    }.freeze

    SUBJECTS_TAUGHT_IN_PAST = [
      'CS Fundamentals',
      'CS in Algebra',
      'CS in Science',
      'CS Discoveries',
      'CS Principles (intro or AP-level)',
      'AP CS A',
      'Beauty and Joy of Computing',
      'Code HS',
      'Edhesive',
      'Exploring Computer Science',
      'Mobile CSP',
      'NMSI',
      'Project Lead the Way',
      'Robotics',
      'ScratchEd'
    ].freeze
  end
end
