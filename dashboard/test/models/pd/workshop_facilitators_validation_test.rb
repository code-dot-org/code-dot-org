require 'test_helper'

class Pd::WorkshopFacilitatorsValidationTest < ActiveSupport::TestCase
  def setup
    @csf = Pd::Workshop::COURSE_CSF
    @csd = Pd::Workshop::COURSE_CSD
    @name = 'Jane Smith'
    @facilitator = create :facilitator, name: @name
  end

  def create_course_facilitator(facilitator, course)
    create :pd_course_facilitator, facilitator: facilitator, course: course
  end

  def create_offering(permissions)
    create :course_offering, facilitator_course_permissions: permissions
  end

  test 'valid_facilitators_for_course_offerings facilitator with permission is valid' do
    course_offering = create_offering([@csf])
    create_course_facilitator(@facilitator, @csf)
    workshop = build(:byo_workshop, course_offerings: [course_offering])
    workshop.facilitators << @facilitator
    assert workshop.valid?
    assert_empty workshop.errors[:base]
  end

  test 'valid_facilitators_for_course_offerings with permissive course_offering is valid' do
    course_offering = create_offering([])
    create_course_facilitator(@facilitator, @csf)
    workshop = build(:byo_workshop, course_offerings: [course_offering])
    workshop.facilitators << @facilitator
    assert workshop.valid?
    assert_empty workshop.errors[:base]
  end

  test 'valid_facilitators_for_course_offerings facilitator without permission is invalid' do
    course_offering = create_offering([@csf])
    create_course_facilitator(@facilitator, @csd)
    workshop = build(:byo_workshop, course_offerings: [course_offering])
    workshop.facilitators << @facilitator
    refute workshop.valid?
    assert_includes workshop.errors[:base].join, "Facilitator #{@name} does not have permission to facilitate the selected workshop topics"
  end
end
