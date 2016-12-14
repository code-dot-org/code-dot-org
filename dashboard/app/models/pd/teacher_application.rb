# == Schema Information
#
# Table name: pd_teacher_applications
#
#  id              :integer          not null, primary key
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  user_id         :integer          not null
#  primary_email   :string(255)      not null
#  secondary_email :string(255)      not null
#  application     :text(65535)      not null
#
# Indexes
#
#  index_pd_teacher_applications_on_primary_email    (primary_email)
#  index_pd_teacher_applications_on_secondary_email  (secondary_email)
#  index_pd_teacher_applications_on_user_id          (user_id) UNIQUE
#

class Pd::TeacherApplication < ActiveRecord::Base
  belongs_to :user

  validates_presence_of :user
  validates_presence_of :primary_email
  validates_presence_of :secondary_email
  validates_email_format_of :primary_email, allow_blank: true
  validates_email_format_of :secondary_email, allow_blank: true
  validates_presence_of :application

  def application_json
    JSON.parse(application)
  end

  def teacher_first_name
    application_json['preferredFirstName'].presence || application_json['firstName']
  end

  def teacher_last_name
    application_json['lastName']
  end

  def teacher_name
    "#{teacher_first_name} #{teacher_last_name}"
  end

  def teacher_email
    application_json['primaryEmail']
  end

  def principal_prefix
    application_json['principalPrefix']
  end

  def principal_first_name
    application_json['principalFirstName']
  end

  def principal_last_name
    application_json['principalLastName']
  end

  def principal_name
    return "#{principal_first_name} #{principal_last_name}"
  end

  def principal_email
    application_json['principalEmail']
  end

  def program_name
    if application_json['courseSelection'] == 'csd'
      return 'CS Discoveries'
    elsif application_json['courseSelection'] == 'csp'
      return 'CS Principals'
    end
  end

  def program_url
    if application_json['courseSelection'] == 'csd'
      return 'https://code.org/educate/professional-learning/cs-discoveries'
    elsif application_json['courseSelection'] == 'csp'
      return 'https://code.org/educate/professinoal-learning/cs-principles'
    end
  end

  def approval_form_url
    if application_json['courseSelection'] == 'csd'
      return 'https://docs.google.com/forms/d/e/1FAIpQLSdcR6oK-JZCtJ7LR92MmNsRheZjODu_Qb-MVc97jEgxyPk24A/viewform?entry.1124819666=TEACHER+NAME&entry.1772278630=SCHOOL+NAME&entry.1885703098&entry.1693544&entry.164045958&entry.2063346846=APPLICATION+ID'
    elsif application_json['courseSelection'] == 'csp'
      return 'https://docs.google.com/forms/d/e/1FAIpQLScVReYg18EYXvOFN2mQkDpDFgoVqKVv0bWOSE1LFSY34kyEHQ/viewform?entry.1124819666=TEACHER+NAME&entry.1772278630=SCHOOL+NAME&entry.1885703098&entry.1693544&entry.164045958&entry.2063346846=APPLICATION+ID'
    end
  end
end
