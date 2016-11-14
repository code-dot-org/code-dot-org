# == Schema Information
#
# Table name: teacher_profiles
#
#  id               :integer          not null, primary key
#  studio_person_id :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  course           :string(255)      not null
#  facilitator      :boolean
#  teaching         :boolean
#  pd_year          :string(255)
#  pd               :string(255)
#  other_pd         :string(255)
#  properties       :text(65535)
#
# Indexes
#
#  index_teacher_profiles_on_studio_person_id  (studio_person_id)
#

class TeacherProfile < ActiveRecord::Base
end
