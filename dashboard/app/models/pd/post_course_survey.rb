# == Schema Information
#
# Table name: pd_post_course_surveys
#
#  id            :integer          not null, primary key
#  form_id       :bigint           not null
#  submission_id :bigint           not null
#  answers       :text(65535)
#  year          :string(255)
#  user_id       :integer          not null
#  course        :string(255)      not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_pd_post_course_surveys_on_form_id                (form_id)
#  index_pd_post_course_surveys_on_submission_id          (submission_id) UNIQUE
#  index_pd_post_course_surveys_on_user_form_year_course  (user_id,form_id,year,course) UNIQUE
#  index_pd_post_course_surveys_on_user_id                (user_id)
#

# NOTE: This is a legacy model and no new surveys should be added here. All new surveys should use Foorm.
# This class is no longer actively synced via our JotForm cron jobs (fill_jotform_placeholders,
# sync_jotforms, process_jotform_data).

module Pd
  class PostCourseSurvey < ApplicationRecord
    include JotFormBackedForm

    VALID_YEARS = [
      YEAR_18_19 = '2018-2019'.freeze
    ].freeze

    VALID_COURSES = [
      COURSE_CSD = 'CS Discoveries'.freeze,
      COURSE_CSP = 'CS Principles'.freeze
    ].freeze

    CURRENT_YEAR = YEAR_18_19

    belongs_to :user

    validates_uniqueness_of :user_id, scope: [:form_id, :year, :course],
                            message: 'already has a submission for this form, year, and course'

    validates_presence_of(
      :user_id,
      :course
    )
    validates_inclusion_of :year, in: VALID_YEARS
    validates_inclusion_of :course, in: VALID_COURSES

    # @override
    def self.attribute_mapping
      {
        user_id: 'userId',
        course: 'csp_or_csd'
      }
    end

    def self.form_id
      get_form_id 'post_course', CURRENT_YEAR
    end

    # Only sync the current year, though old years' data can still be valid.
    def self.all_form_ids
      [form_id]
    end

    def self.unique_attributes
      [:user_id, :course]
    end

    def self.static_attribute_values
      {
        year: CURRENT_YEAR,
        form_id: form_id
      }
    end
  end
end
