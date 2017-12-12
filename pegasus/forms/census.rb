require_relative './form'

class Census2017 < Form
  def self.normalize(data)
    result = {}

    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = stripped data[:name_s]
    result[:role_s] = data[:role_s]

    result[:country_s] = data[:country_s]
    result[:nces_school_s] = data[:nces_school_s]
    result[:school_type_s] = data[:school_type_s]
    result[:school_state_s] = data[:school_state_s]
    result[:school_district_id_s] = data[:school_district_id_s]
    result[:school_district_other_b] = data[:school_district_other_b]
    result[:school_district_name_s] = data[:school_district_name_s]
    result[:school_id_s] = data[:school_id_s]
    result[:school_other_b] = data[:school_other_b]
    result[:school_name_s] = data[:school_name_s]
    result[:school_zip_s] = data[:school_zip_s]
    result[:school_full_address_s] = data[:school_full_address_s]

    result[:hoc_s] = data[:hoc_s]
    result[:after_school_s] = data[:after_school_s]
    result[:ten_hours_s] = data[:ten_hours_s]
    result[:twenty_hours_s] = data[:twenty_hours_s]
    result[:other_cs_b] = data[:other_cs_b]

    result[:followup_frequency_s] = data[:followup_frequency_s]
    result[:followup_more_s] = stripped data[:followup_more_s]
    result[:topic_blocks_b] = data[:topic_blocks_b]
    result[:topic_text_b] = data[:topic_text_b]
    result[:topic_robots_b] = data[:topic_robots_b]
    result[:topic_internet_b] = data[:topic_internet_b]
    result[:topic_security_b] = data[:topic_security_b]
    result[:topic_data_b] = data[:topic_data_b]
    result[:topic_web_design_b] = data[:topic_web_design_b]
    result[:topic_game_design_b] = data[:topic_game_design_b]
    result[:topic_other_b] = data[:topic_other_b]
    result[:topic_other_desc_s] = data[:topic_other_desc_s]
    result[:topic_dont_know_b] = data[:topic_dont_know_b]

    result[:pledge_b] = data[:pledge_b]

    result[:version_s] = data[:version]

    result
  end

  def self.receipt
    'census_form_receipt'
  end
end
