# == Schema Information
#
# Table name: pilots
#
#  id                    :bigint           not null, primary key
#  name                  :string(255)      not null
#  display_name          :string(255)      not null
#  allow_joining_via_url :boolean          not null
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#
# Indexes
#
#  index_pilots_on_name  (name)
#
class Pilot < ApplicationRecord
  # The name can be used in urls, constrain it to all lowercase with no spaces
  validates :name, presence: true, format: {with: /\A[a-z0-9-]+\z/}
  validates :display_name, presence: true

  # If allow_joining_via_url is ture, the url to join the pilot is:
  # http://studio.code.org/experiments/set_single_user_experiment/<pilot.name>
end
