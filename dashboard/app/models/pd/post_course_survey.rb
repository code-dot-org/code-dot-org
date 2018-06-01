# == Schema Information
#
# Table name: pd_post_course_surveys
#
#  id            :integer          not null, primary key
#  form_id       :integer          not null
#  submission_id :integer          not null
#  answers       :text(65535)
#  year          :string(255)
#  user_id       :integer          not null
#  course        :string(255)      not null
#
# Indexes
#
#  index_pd_post_course_surveys_on_form_id                (form_id)
#  index_pd_post_course_surveys_on_form_user_year_course  (form_id,user_id,year,course) UNIQUE
#  index_pd_post_course_surveys_on_submission_id          (submission_id) UNIQUE
#  index_pd_post_course_surveys_on_user_form_year_course  (user_id,form_id,year,course) UNIQUE
#  index_pd_post_course_surveys_on_user_id                (user_id)
#

module Pd
  class PostCourseSurvey < ActiveRecord::Base
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

    # @override
    def self.attribute_mapping
      {
        user_id: 'userId',
        course: 'csp_or_csd'
      }
    end

    validates_uniqueness_of :user_id, scope: [:form_id, :year, :course],
      message: 'already has a submission for this form, year, and course'

    validates_presence_of(
      :user_id,
      :course
    )
    validates_inclusion_of :year, in: VALID_YEARS
    validates_inclusion_of :course, in: VALID_COURSES

    # Skip other environments. Only keep this environment.
    # @override
    def skip_submission?(processed_answers)
      environment = processed_answers['environment']
      raise "Missing required environment field" unless environment

      environment != Rails.env
    end

    def self.form_id
      get_form_id 'post_course', CURRENT_YEAR
    end

    # Only sync the current year, though old years' data can still be valid.
    def self.all_form_ids
      [form_id]
    end

    def self.response_exists?(user_id:, course:)
      exists?(
        user_id: user_id,
        form_id: form_id,
        year: CURRENT_YEAR,
        course: course
      )
    end

    def self.create_placeholder!(user_id:, course:, submission_id:)
      find_or_create_by!(
        user_id: user_id,
        form_id: form_id,
        year: CURRENT_YEAR,
        course: course,
        submission_id: submission_id
      )
    end
  end
end
