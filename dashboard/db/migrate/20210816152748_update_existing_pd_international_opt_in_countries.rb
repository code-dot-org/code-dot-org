# Update existing country values to be english and/or capitalized in
# order to be consistent with country values in our other tables

class UpdateExistingPdInternationalOptInCountries < ActiveRecord::Migration[5.2]
  def change
    english_countries = Set.new(%w(canada chile colombia israel malaysia mexico thailand uzbekistan))

    reversible do |dir|
      dir.up do
        ActiveRecord::Base.transaction do
          # Do I need to batch?
          Pd::InternationalOptIn.all.each do |opt_in|
            form = JSON.parse(opt_in.form_data)
            current_country_string = form["schoolCountry"]

            if !english_countries.include? current_country_string
              # Not in English

              I18n.locale = opt_in.user.locale
              # If locale of user doesn't match string. The country string will be left unchanged
              english_countries.each do |country|
                current_english_country = I18n.t "pd.form_entries.school_country.#{country}"
                next if current_english_country != current_country_string
                # Reverse translate and store in English
                form["schoolCountry"] = country.titleize
                opt_in.update!(form_data: form.to_json)
                # break
              end
            else
              # Capitalize English country string
              form["schoolCountry"] = current_country_string.titleize
              opt_in.update!(form_data: form.to_json)
            end
          end
        end
      end
    end
  end
end
