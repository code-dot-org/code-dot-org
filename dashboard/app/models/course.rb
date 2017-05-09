# == Schema Information
#
# Table name: courses
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_courses_on_name  (name)
#

class Course < ApplicationRecord
  # Some Courses will have an associated Plc::Course, most will not
  has_one :plc_course, class_name: 'Plc::Course'
  has_many :course_scripts, -> {order('position ASC')}

  def summarize
    {
      name: name,
      title: I18n.t("data.course.name.#{name}.title"),
      description_student: I18n.t("data.course.name.#{name}.description_student"),
      description_teacher: I18n.t("data.course.name.#{name}.description_teacher"),
      scripts: course_scripts.map(&:script).map do |script|
        include_stages = false
        script.summarize(include_stages).merge!(script.summarize_i18n(include_stages))
      end
    }
  end
end
