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
      csd_csp_lead_summer_workshop_requirement: YES_NO,
      csd_csp_fit_weekend_requirement: YES_NO,
      csd_training_requirement: YES_NO,
      csd_csp_deeper_learning_requirement: YES_NO,
      csd_csp_good_standing_requirement: YES_NO,
      csp_training_requirement: YES_NO,
      # Bonus Points
      currently_involved_in_cs_education: [5, 3, 0],
      grades_taught: [5, 3, 0],
      experience_teaching_this_course: [5, 3, 0],
      completed_pd: [5, 3, 0],
      why_should_all_have_access: [5, 3, 0],
      skills_areas_to_improve: [5, 3, 0],
      inquiry_based_learning: [5, 3, 0],
      why_interested: [5, 3, 0],
      question_1: [5, 3, 0],
      question_2: [5, 3, 0],
      question_3: [5, 3, 0],
      question_4: [5, 3, 0],
      question_5: [5, 3, 0]
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
      interview_score: [],
      teaching_experience_score: [
        :grades_taught,
        :inquiry_based_learning
      ],
      leadership_score: [],
      champion_for_cs_score: [
        :question_5,
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
        'Question 1: Code.org’s programs are designed for teachers of all backgrounds, especially teachers with
        little-to-no experience with computer science. What are two strategies you would use to engage and support
        these teachers in your workshops?'
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
        'Question 4: Imagine that you are preparing to co-lead an upcoming workshop. You suggest to your
        co-facilitator, whom you have not worked with, that you meet the week before to talk through the
        agenda for the day, decide which portions you’ll each lead, and discuss any questions or concerns
        you each have regarding the material. Your co-facilitator declines to meet and instead sends you an
        email with the agenda items they will lead. How would you respond in the moment? What are the next
        steps you would take? How do you prefer to give feedback to a colleague?'
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
  end
end
