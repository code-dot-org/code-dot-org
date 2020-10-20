# == Schema Information
#
# Table name: objectives
#
#  id         :integer          not null, primary key
#  properties :text(65535)
#  lesson_id  :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_objectives_on_lesson_id  (lesson_id)
#

# An objective represents what students should learn in a lesson
#
# @attr [String] description - What the student should learn
class Objective < ActiveRecord::Base
  include SerializedProperties

  belongs_to :lesson

  serialized_attrs %w(
    description
  )
end
