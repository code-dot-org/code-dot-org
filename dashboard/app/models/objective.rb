# == Schema Information
#
# Table name: objectives
#
#  id         :integer          not null, primary key
#  properties :text(65535)
#  lesson_id  :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  key        :string(255)
#
# Indexes
#
#  index_objectives_on_key        (key) UNIQUE
#  index_objectives_on_lesson_id  (lesson_id)
#

# An objective represents what students should learn in a lesson
#
# @attr [String] description - What the student should learn
class Objective < ApplicationRecord
  include SerializedProperties

  belongs_to :lesson

  serialized_attrs %w(
    description
  )

  def summarize_for_edit
    {id: id, description: description}
  end

  def summarize_for_lesson_show
    {id: id, description: display_description}
  end

  private

  def display_description
    # TODO: localize the descriptions
    description
  end
end
