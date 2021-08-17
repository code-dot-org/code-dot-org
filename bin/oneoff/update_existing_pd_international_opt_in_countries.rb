#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

# Update existing country values to be english and/or capitalized in
# order to be consistent with country values in our other tables

ENGLISH_COUNTRIES = Set.new(%w(canada chile colombia israel malaysia mexico thailand uzbekistan))

def main
  Pd::InternationalOptIn.all.each do |opt_in|
    form = JSON.parse(opt_in.form_data)
    current_country_string = form["schoolCountry"]

    if !ENGLISH_COUNTRIES.include? current_country_string
      # Not in English
      I18n.locale = opt_in.user.locale
      # Reverse translate and store in English
      translated_country = ENGLISH_COUNTRIES.find {|country| (I18n.t "pd.form_entries.school_country.#{country}") == current_country_string}

      if translated_country
        form["schoolCountry"] = translated_country.titleize
        opt_in.form_data = form.to_json
        opt_in.save
      else
        # If locale of user doesn't match string. The country string will be left unchanged. Logging this case
        puts "Opt in #{opt_in.id}:\nWas non-English and not updated"
      end
    else
      # Capitalize English country string
      form["schoolCountry"] = current_country_string.titleize
      opt_in.form_data = form.to_json
      opt_in.save
    end

  rescue => e
    puts "Failure on opt in #{opt_in.id}:\n#{e.message}\n#{opt_in&.errors&.messages}"
  end
end

main
