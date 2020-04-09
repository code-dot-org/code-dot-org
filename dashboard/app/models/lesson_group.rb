# == Schema Information
#
# Table name: lesson_groups
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  script_id   :integer          not null
#  user_facing :boolean          default(TRUE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_lesson_groups_on_script_id  (script_id)
#

class LessonGroup < ApplicationRecord
  belongs_to :script, foreign_key: 'unit_id'
  has_many :stages
end
