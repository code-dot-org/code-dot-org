# == Schema Information
#
# Table name: pd_workshop_daily_surveys
#
#  id             :integer          not null, primary key
#  form_id        :integer          not null
#  submission_id  :integer          not null
#  user_id        :integer          not null
#  pd_session_id  :integer
#  pd_workshop_id :integer          not null
#  form_data      :text(65535)
#
# Indexes
#
#  index_pd_workshop_daily_surveys_on_form_id         (form_id)
#  index_pd_workshop_daily_surveys_on_pd_session_id   (pd_session_id)
#  index_pd_workshop_daily_surveys_on_pd_workshop_id  (pd_workshop_id)
#  index_pd_workshop_daily_surveys_on_submission_id   (submission_id) UNIQUE
#  index_pd_workshop_daily_surveys_on_user_form_day   (form_id,user_id,pd_session_id) UNIQUE
#  index_pd_workshop_daily_surveys_on_user_id         (user_id)
#

class Pd::WorkshopDailySurvey < ActiveRecord::Base
end
