# == Schema Information
#
# Table name: rubrics
#
#  id         :bigint           not null, primary key
#  lesson_id  :integer
#  level_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_rubrics_on_lesson_id  (lesson_id) UNIQUE
#
class Rubric < ApplicationRecord
end
