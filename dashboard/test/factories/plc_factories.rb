FactoryBot.define do
  factory :plc_enrollment_unit_assignment, class: 'Plc::EnrollmentUnitAssignment' do
    plc_user_course_enrollment {nil}
    plc_course_unit {nil}
    status {Plc::EnrollmentUnitAssignment::START_BLOCKED}
    user {nil}
  end

  factory :plc_course_unit, class: 'Plc::CourseUnit' do
    plc_course {create(:plc_course)}
    script {create(:script)}
    unit_name {"MyString"}
    unit_description {"MyString"}
    unit_order {1}

    # Simulates production behavior by setting script.professional_learning_course to the name of
    # the associated plc_course's unit_group. This trait is optional because it has the side effect
    # of running the generate_plc_objects callback on the associated unit, which overwrites some
    # factory-provided fields on the plc objects that some tests rely on.
    trait :with_course_name do
      after(:build) do |course_unit|
        if course_unit.script.professional_learning_course.blank?
          course_unit.script.update!(professional_learning_course: course_unit.plc_course.unit_group.name)
        end
      end
    end
  end

  factory :plc_enrollment_module_assignment, class: 'Plc::EnrollmentModuleAssignment' do
    plc_enrollment_unit_assignment {nil}
    plc_learning_module {nil}
    user {nil}
  end

  factory :plc_user_course_enrollment, class: 'Plc::UserCourseEnrollment' do
    status {"MyString"}
    plc_course {nil}
    user {nil}
  end

  factory :plc_learning_module, class: 'Plc::LearningModule' do
    sequence(:name) {|n| "plc-learning-module-#{n}"}
    plc_course_unit {create(:plc_course_unit)}
    lesson {create(:lesson)}
    module_type {Plc::LearningModule::CONTENT_MODULE}
  end

  factory :plc_course, class: 'Plc::Course' do
    transient do
      sequence(:name) {|n| "plc-course-#{n}"}
    end
    after(:build) do |plc_course, evaluator|
      create(:unit_group, name: evaluator.name, plc_course: plc_course)
    end
  end
end
