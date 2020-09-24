# == Schema Information
#
# Table name: stages
#
#  id                :integer          not null, primary key
#  name              :string(255)      not null
#  absolute_position :integer
#  script_id         :integer          not null
#  created_at        :datetime
#  updated_at        :datetime
#  lockable          :boolean          default(FALSE), not null
#  relative_position :integer          not null
#  properties        :text(65535)
#  lesson_group_id   :integer
#  key               :string(255)
#
# Indexes
#
#  index_stages_on_script_id  (script_id)
#

# Serializer for the Lesson model. For now, only include fields which can
# be edited on the lesson edit page, excluding any fields which are still
# controlled by the script edit page (e.g. name and key).
class LessonSerializer < ActiveModel::Serializer
  attributes :overview, :student_overview, :assessment, :unplugged, :creative_commons_license,
    :lockable, :purpose, :preparation, :announcements
end
