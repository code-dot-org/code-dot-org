module ProfessionalLearningCourseHelper
  def options_for_user_enrollment_courses
    options = []

    ProfessionalLearningCourse.all.each do |course|
      options << [course.name, course.id]
    end

    options
  end
end
