# == Schema Information
#
# Table name: rubrics
#
#  id         :bigint           not null, primary key
#  lesson_id  :integer          not null
#  level_id   :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_rubrics_on_lesson_id_and_level_id  (lesson_id,level_id) UNIQUE
#
class Rubric < ApplicationRecord
end
