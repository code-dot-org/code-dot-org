# == Schema Information
#
# Table name: pd_fit_weekend_registrations
#
#  id                :integer          not null, primary key
#  pd_application_id :integer
#  registration_year :string(255)      not null
#  form_data         :text(65535)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_pd_fit_weekend_registrations_on_pd_application_id  (pd_application_id)
#  index_pd_fit_weekend_registrations_on_registration_year  (registration_year)
#

class Pd::FitWeekend1920Registration < Pd::FitWeekendRegistrationBase
  include Pd::Application::ApplicationConstants

  # override
  def set_registration_year
    self.registration_year = YEAR_19_20
  end

  def validate_required_fields
    hash = sanitize_form_data_hash

    if hash.try(:[], :able_to_attend) == NO
      # then we don't care about the rest of the fields
      return
    end

    super
  end
end
