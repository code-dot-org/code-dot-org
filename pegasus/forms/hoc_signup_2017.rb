require pegasus_dir 'forms/hoc_signup_2014'

class HocSignup2017 < HocSignup2014
  def self.normalize(data)
    result = super
    result[:nces_school_s] = data[:nces_school_s]
    result[:school_name_s] = data[:school_name_s]

    #If the user has an in-school US event, they will fill out 2017 census questions.
    result[:role_s] = data[:role_s]
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
    result[:topic_dont_know_b] = data[:topic_dont_know_b]
    result[:pledge_b] = data[:pledge_b]

    result
  end

  def self.receipt
    if %w(co la pe).include? @country
      'hoc_signup_2017_receipt_es'
    elsif @country == "br"
      'hoc_signup_2017_receipt_br'
    else
      'hoc_signup_2017_receipt_en'
    end
  end
end
