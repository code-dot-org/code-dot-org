# == Schema Information
#
# Table name: teacher_profiles
#
#  id               :integer          not null, primary key
#  studio_person_id :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  course           :string(255)      not null
#  facilitator      :boolean
#  teaching         :boolean
#  pd_year          :string(255)
#  pd               :string(255)
#  other_pd         :string(255)
#  properties       :text(65535)
#
# Indexes
#
#  index_teacher_profiles_on_studio_person_id  (studio_person_id)
#

class TeacherProfile < ApplicationRecord
  include SerializedProperties
  # teals: True if the teacher was a TEALS teacher.
  serialized_attrs %w(teals)

  COURSES = [
    CSD = 'csd'.freeze,
    CSF = 'csf'.freeze,
    CSP = 'csp'.freeze,
    ECS = 'ecs'.freeze
  ].freeze
  # TODO(asher): Change the DB to add a unique index on
  # (studio_person_id, course).
  validates_inclusion_of :course, in: COURSES

  YEARS = [
    YEAR_2013_2014 = '2013-2014'.freeze,
    YEAR_2014_2015 = '2014-2015'.freeze,
    YEAR_2015_2016 = '2015-2016'.freeze,
    YEAR_2016_2017 = '2016-2017'.freeze,
  ].freeze
  NO_PD = 'no_pd'.freeze
  validates_inclusion_of :pd_year, in: YEARS + [NO_PD], allow_nil: true

  # List of Code.org professional developments.
  PD = [
    CODE_VA = 'codeva'.freeze,  # Code Virginia (www.codevirginia.org).
    PILOT = 'pilot'.freeze,  # Pilot teacher.
    TC_ATL = 'teachercon-atl'.freeze,  # TeacherCon Atlanta.
    TC_CHI = 'teachercon-chi'.freeze,  # TeacherCon Chicago.
    TC_SLC = 'teachercon-slc'.freeze,  # TeacherCon Salt Lake City.
    QUARTERLY = 'quarterly'.freeze  # Attended at least three of the quarterly PDs.
  ].freeze
  validates_inclusion_of :pd, in: PD, allow_nil: true

  # List of non-Code.org professional developments.
  OTHER_PD = [
    NMSI = 'nmsi'.freeze  # National Math + Science Initiative (www.nms.org/AboutNMSI.aspx).
  ].freeze
  validates_inclusion_of :other_pd, in: OTHER_PD, allow_nil: true
end
