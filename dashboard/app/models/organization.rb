# == Schema Information
#
# Table name: organizations
#
#  id             :integer          not null, primary key
#  name           :string(255)
#  domain         :string(255)
#  session_length :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_organizations_on_domain  (domain) UNIQUE
#  index_organizations_on_name    (name)
#

class Organization < ApplicationRecord
  has_many :users, dependent: :nullify

  validates :name, presence: true
  validates :domain, presence: true, uniqueness: true
end
