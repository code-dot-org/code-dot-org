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
end
