json.array!(@plc_enrollment_evaluations) do |plc_enrollment_evaluation|
  json.extract! plc_enrollment_evaluation, :id, :user_professional_learning_course_enrollment_id, :plc_evaluation_answers
  json.url plc_enrollment_evaluation_url(plc_enrollment_evaluation, format: :json)
end
