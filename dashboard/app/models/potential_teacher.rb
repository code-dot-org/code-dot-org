# == Schema Information
#
# Table name: potential_teachers
#
#  id                 :bigint           not null, primary key
#  name               :string(255)      not null
#  email              :string(255)      not null
#  script_id          :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  receives_marketing :boolean          default(FALSE), not null
#
# Indexes
#
#  index_potential_teachers_on_script_id  (script_id)
#
class PotentialTeacher < ApplicationRecord
  belongs_to :script, class_name: 'Unit', optional: true

  validates_presence_of :name, :email
end
