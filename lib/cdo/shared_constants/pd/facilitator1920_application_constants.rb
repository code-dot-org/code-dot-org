module Pd
  module Facilitator1920ApplicationConstants
    include FacilitatorCommonApplicationConstants
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
      why_interested: [5, 3, 0]
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
        :why_interested
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
  end
end
