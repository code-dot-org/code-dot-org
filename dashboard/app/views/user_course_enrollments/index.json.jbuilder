json.array!(@user_course_enrollments) do |user_course_enrollment|
  json.extract! user_course_enrollment, :id
  json.url user_course_enrollment_url(user_course_enrollment, format: :json)
end
