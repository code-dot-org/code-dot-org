# == Schema Information
#
# Table name: plc_enrollment_evaluations
#
#  id                                              :integer          not null, primary key
#  user_professional_learning_course_enrollment_id :integer
#  plc_evaluation_answers                          :text(65535)
#  created_at                                      :datetime         not null
#  updated_at                                      :datetime         not null
#
# Indexes
#
#  enrollment_evaluation_index  (user_professional_learning_course_enrollment_id)
#

class PlcEnrollmentEvaluation < ActiveRecord::Base
  belongs_to :user_professional_learning_course_enrollment
end
