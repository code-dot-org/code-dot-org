require_relative './form'

class Census2017 < Form
  def self.normalize(data)
    result = {}

    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = stripped data[:name_s]
    result[:role_s] = data[:role_s]

    result[:cs_none_b] = data[:cs_none_b]
    result[:hoc_some_b] = data[:hoc_some_b]
    result[:hoc_all_b] = data[:hoc_all_b]
    result[:after_school_some_b] = data[:after_school_some_b]
    result[:after_school_all_b] = data[:after_school_all_b]
    result[:ten_hr_some_b] = data[:ten_hr_some_b]
    result[:ten_hr_all_b] = data[:ten_hr_all_b]
    result[:twenty_hr_some_b] = data[:twenty_hr_some_b]
    result[:twenty_hr_all_b] = data[:twenty_hr_all_b]
    result[:other_course_b] = data[:other_course_b]
    result[:cs_dont_know_b] = data[:cs_dont_know_b]

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
    result[:topic_dont_know_b] = data[:topic_dont_know_b]

    result[:pledge_b] = data[:pledge_b]

    result
  end
end
