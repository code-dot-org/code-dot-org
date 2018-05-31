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
#  course        :string(255)
#
# Indexes
#
#  index_pd_post_course_surveys_on_form_id                (form_id)
#  index_pd_post_course_surveys_on_submission_id          (submission_id) UNIQUE
#  index_pd_post_course_surveys_on_user_form_year_course  (user_id,form_id,year,course) UNIQUE
#  index_pd_post_course_surveys_on_user_id                (user_id)
#

module Pd
  class PostCourseSurvey < ActiveRecord::Base
  end
end
