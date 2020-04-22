# == Schema Information
#
# Table name: lesson_groups
#
#  id          :integer          not null, primary key
#  key         :string(255)      not null
#  script_id   :integer          not null
#  user_facing :boolean          default(TRUE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  position    :integer
#
# Indexes
#
#  index_lesson_groups_on_script_id_and_key  (script_id,key) UNIQUE
#

class LessonGroup < ApplicationRecord
  belongs_to :script
  has_many :lessons

  validates_uniqueness_of :key, scope: :script_id

  validates :key,
    presence: {
      message: 'Expect all levelbuilder created lesson groups to have key.'
    },
    if: proc {|a| a.user_facing}

  def localized_display_name
    I18n.t "data.script.name.#{script.name}.lesson_groups.#{key}.display_name"
  end
end
