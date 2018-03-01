# coding: utf-8
# == Schema Information
#
# Table name: census_submissions
#
#  id                           :integer          not null, primary key
#  type                         :string(255)      not null
#  submitter_email_address      :string(255)
#  submitter_name               :string(255)
#  submitter_role               :string(255)
#  school_year                  :integer          not null
#  how_many_do_hoc              :string(255)
#  how_many_after_school        :string(255)
#  how_many_10_hours            :string(255)
#  how_many_20_hours            :string(255)
#  other_classes_under_20_hours :boolean
#  topic_blocks                 :boolean
#  topic_text                   :boolean
#  topic_robots                 :boolean
#  topic_internet               :boolean
#  topic_security               :boolean
#  topic_data                   :boolean
#  topic_web_design             :boolean
#  topic_game_design            :boolean
#  topic_other                  :boolean
#  topic_other_description      :string(255)
#  topic_do_not_know            :boolean
#  class_frequency              :string(255)
#  tell_us_more                 :text(65535)
#  pledged                      :boolean
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  share_with_regional_partners :boolean
#
# Indexes
#
#  index_census_submissions_on_school_year_and_id  (school_year,id)
#

# This is the base class for all census submissions. A base CensusSubmission
# can never be saved to the DB directly since it will not have the required
# type field set. Always use one of the derived types to save a submission.
#
class Census::CensusSubmission < ApplicationRecord
  has_and_belongs_to_many :school_infos
  validates :school_infos, presence: true
  validates_email_format_of :submitter_email_address

  HOW_MANY_OPTIONS = {
    none: "NONE",
    some: "SOME",
    all: "ALL",
    dont_know:  "I DON'T KNOW"
  }.freeze

  enum how_many_do_hoc: HOW_MANY_OPTIONS, _prefix: true
  enum how_many_after_school: HOW_MANY_OPTIONS, _prefix: true
  enum how_many_10_hours: HOW_MANY_OPTIONS, _prefix: true
  enum how_many_20_hours: HOW_MANY_OPTIONS, _prefix: true

  ROLES = {
    teacher: "TEACHER",
    administrator: "ADMINISTRATOR",
    parent: "PARENT",
    volunteer: "VOLUNTEER",
    other: "OTHER"
  }.freeze

  enum submitter_role: ROLES, _prefix: true

  CLASS_FREQUENCIES = {
    less_than_one_hour_per_week: 'LESS THAN ONE HOUR PER WEEK',
    one_to_three_hours_per_week: 'ONE TO THREE HOURS PER WEEK',
    three_plus_hours_per_week: 'THREE PLUS HOURS PER WEEK',
    dont_know: "I DON'T KNOW"
  }.freeze

  enum class_frequency: CLASS_FREQUENCIES, _prefix: true

  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2017, less_than_or_equal_to: 2030}
  validates :submitter_email_address, length: {maximum: 255}
  validates :submitter_name, length: {maximum: 255}
  validates :topic_other_description, length: {maximum: 255}
end
