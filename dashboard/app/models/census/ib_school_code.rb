# == Schema Information
#
# Table name: ib_school_codes
#
#  school_code :string(6)        not null, primary key
#  school_id   :string(12)       not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_ib_school_codes_on_school_code  (school_code) UNIQUE
#  index_ib_school_codes_on_school_id    (school_id) UNIQUE
#

class Census::IbSchoolCode < ApplicationRecord
  self.primary_key = :school_code

  belongs_to :school, required: true

  validates :school_code, presence: true, length: {is: 6}, format: {with: /\A[0-9]+\z/, message: "only allows numbers"}
end
