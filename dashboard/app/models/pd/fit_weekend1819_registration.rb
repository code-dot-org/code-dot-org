# == Schema Information
#
# Table name: pd_fit_weekend1819_registrations
#
#  id                :integer          not null, primary key
#  pd_application_id :integer
#  form_data         :text(65535)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_pd_fit_weekend1819_registrations_on_pd_application_id  (pd_application_id)
#

# NOTE: Unlike the other year-specific FiT Weekend Registration classes (Pd::FitWeekend1920Registration),
# this class is in its own table and does not inherit from Pd::FitWeekendRegistrationBase.

# This model is needed to purge accounts but is no longer maintained.

class Pd::FitWeekend1819Registration < ApplicationRecord
end
