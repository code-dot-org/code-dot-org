require 'honeybadger'
require_relative './form'
require_relative '../../deployment'
require_relative '../helpers/hourofcode_helpers'

class HocSignup2014 < Form
  def self.normalize(data)
    Honeybadger.context({data: data})
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = required stripped data[:name_s]
    result[:organization_name_s] = stripped data[:organization_name_s]
    result[:event_type_s] = required enum(data[:event_type_s].to_s.strip.downcase, ['in_school', 'out_of_school'])
    result[:entire_school_flag_b] = stripped data[:entire_school_flag_b]
    result[:send_posters_flag_b] = stripped data[:send_posters_flag_b]
    result[:send_posters_address_s] = stripped data[:send_posters_address_s]
    result[:special_event_flag_b] = stripped data[:special_event_flag_b]
    result[:special_event_details_s] = stripped data[:special_event_details_s]
    result[:match_volunteer_flag_b] = stripped data[:match_volunteer_flag_b]
    result[:hoc_country_s] = required enum(data[:hoc_country_s].to_s.strip.downcase, HOC_COUNTRIES.keys)
    result[:hoc_company_s] = nil_if_empty data[:hoc_company_s]

    # If the user's school is not found via the school dropdown
    # we still need to require location for US in school events to match
    # to NCES id for census data.
    if result[:event_type_s] == 'in_school' && result[:hoc_country_s] == 'US'
      result[:event_location_s] = required stripped data[:event_location_s]
    else
      result[:event_location_s] = stripped data[:event_location_s]
    end

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
    'hoc_signup_2014_receipt'
  end

  def self.process(data)
    {}.tap do |results|
      location = search_for_address(data['event_location_s'])
      results.merge! location.to_solr if location
    end
  end

  # @param [Hash] new_data The new data to be saved to the DB.
  # @return [String, nil] The secret of the form to be updated with the upsert, or nil if the
  #   upsert should be an insert.
  def self.update_on_upsert(new_data)
    return nil unless new_data[:kind] && new_data[:email] && new_data[:name]
    existing_form = DB[:forms].
      where(kind: new_data[:kind], email: new_data[:email], name: new_data[:name]).
      first
    existing_form ? existing_form[:secret] : nil
  end
end
