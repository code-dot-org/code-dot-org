require 'test_helper'

class Pd::CourseFacilitatorTest < ActiveSupport::TestCase
  test 'facilitators_for_course' do
    create :pd_course_facilitator, course: Pd::Workshop::COURSE_CSF
    create :pd_course_facilitator, course: Pd::Workshop::COURSE_CSF
    create :pd_course_facilitator, course: Pd::Workshop::COURSE_ECS

    facilitators = Pd::CourseFacilitator.facilitators_for_course Pd::Workshop::COURSE_CSF
    assert_equal 2, facilitators.length
  end
end
