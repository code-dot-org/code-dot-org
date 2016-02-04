json.array!(@professional_learning_courses) do |professional_learning_course|
  json.extract! professional_learning_course, :id
  json.url professional_learning_course_url(professional_learning_course, format: :json)
end
