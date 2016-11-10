# == Schema Information
#
# Table name: teacher_profiles
#
#  id          :integer          not null, primary key
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  user_id     :integer          not null
#  course      :string(255)      not null
#  facilitator :boolean
#  teaching    :boolean
#  pd_year     :string(255)
#  pd          :string(255)
#  other_pd    :string(255)
#  properties  :text(65535)
#
# Indexes
#
#  index_teacher_profiles_on_user_id  (user_id)
#

class TeacherProfile < ActiveRecord::Base
  belongs_to :user
  validates_presence_of :user

  include SerializedProperties
  # teals: True if the user was PDed through TEALS (www.tealsk12.org).
  serialized_attrs %w(teals)

  validates_presence_of :course
  COURSES = [
    CSD = 'csd'.freeze,
    CSF = 'csf'.freeze,
    CSP = 'csp'.freeze,
    ECS = 'ecs'.freeze
  ].freeze
  validates_inclusion_of :course, in: COURSES

  YEARS = [
    YEAR_2013 = '2013'.freeze,
    YEAR_2014 = '2014'.freeze,
    YEAR_2015 = '2015'.freeze,
    YEAR_2016 = '2016'.freeze,
    YEAR_2017 = '2017'.freeze
  ].freeze
  NO_PD = 'no_pd'.freeze
  validates_inclusion_of :pd_year, in: YEARS + [NO_PD], allow_nil: true
end
