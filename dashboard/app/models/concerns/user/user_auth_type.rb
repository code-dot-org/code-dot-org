module User::UserAuthType
  extend ActiveSupport::Concern
  # True if user is a student in a section that has Google Classroom login type
  def google_classroom_student?
    sections_as_student.find_by_login_type(Section::LOGIN_TYPE_GOOGLE_CLASSROOM).present?
  end

  # True if user is a student in a section that has Clever login type
  def clever_student?
    sections_as_student.find_by_login_type(Section::LOGIN_TYPE_CLEVER).present?
  end

  # True if user is a student in a section that uses any oauth login type
  def oauth_student?
    sections_as_student.find_by_login_type(Section::LOGIN_TYPES_OAUTH).present?
  end
end
