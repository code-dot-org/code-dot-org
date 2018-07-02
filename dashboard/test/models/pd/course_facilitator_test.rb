require 'test_helper'

class Pd::CourseFacilitatorTest < ActiveSupport::TestCase
  test 'facilitators_for_course' do
    create :pd_course_facilitator, course: Pd::Workshop::COURSE_CSF
    create :pd_course_facilitator, course: Pd::Workshop::COURSE_CSF
    create :pd_course_facilitator, course: Pd::Workshop::COURSE_ECS

    facilitators = Pd::CourseFacilitator.facilitators_for_course Pd::Workshop::COURSE_CSF
    assert_equal 2, facilitators.length
  end

  test 'duplicates are not allowed' do
    facilitator = create :facilitator
    create :pd_course_facilitator, facilitator: facilitator, course: Pd::Workshop::COURSE_CSF

    duplicate = build :pd_course_facilitator, facilitator: facilitator, course: Pd::Workshop::COURSE_CSF
    refute duplicate.valid?

    different_course = build :pd_course_facilitator, facilitator: facilitator, course: Pd::Workshop::COURSE_CSP
    assert different_course.valid?, different_course.errors.full_messages

    different_facilitator = build :pd_course_facilitator, course: Pd::Workshop::COURSE_CSF
    assert different_facilitator.valid?, different_course.errors.full_messages
  end
end
