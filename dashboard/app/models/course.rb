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

  # TODO: we'd like to disallow spaces, but need to figure out what that means for PLC
  validates :name,
    presence: true,
    uniqueness: {case_sensitive: false},
    format: {
      with: /\A[a-zA-Z0-9\_ ]+\z/,
      message: 'can only contain spaces, numbers, and underscores'
    }
  # As we read and write to files with the script name, to prevent directory
  # traversal (for security reasons), we do not allow the name to start with a
  # tilde or dot or contain a slash.
  validates :name,
    presence: true,
    format: {
      without: /\A~|\A\.|\//,
      message: 'cannot start with a tilde or dot or contain slashes'
    }

  def summarize
    {
      name: name,
      title: I18n.t("data.course.name.#{name}.title", default: name),
      description_student: I18n.t("data.course.name.#{name}.description_student", default: ''),
      description_teacher: I18n.t("data.course.name.#{name}.description_teacher", default: ''),
      scripts: course_scripts.map(&:script).map do |script|
        include_stages = false
        script.summarize(include_stages).merge!(script.summarize_i18n(include_stages))
      end
    }
  end
end
