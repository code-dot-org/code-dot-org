# == Schema Information
#
# Table name: email_preferences
#
#  id         :integer          not null, primary key
#  email      :string(255)      not null
#  opt_in     :boolean          not null
#  ip_address :string(255)      not null
#  source     :string(255)      not null
#  form_kind  :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_email_preferences_on_email  (email)
#

class EmailPreference < ApplicationRecord
end
