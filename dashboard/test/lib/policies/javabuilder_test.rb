require 'test_helper'
require 'policies/javabuilder'

class Policies::JavabuilderTest < ActiveSupport::TestCase
  test 'active co-teacher of verified teacher in CSA section inherits teacher id' do
    verified_teacher = create(:authorized_teacher)
    co_teacher = create(:teacher)
    section = create_csa_section(verified_teacher)
    create(:section_instructor, section: section, instructor: co_teacher, status: :active)

    assert_equal [verified_teacher.id], Policies::Javabuilder.verified_teacher_ids(co_teacher)
  end

  test 'invited co-teacher does not inherit teacher id' do
    verified_teacher = create(:authorized_teacher)
    co_teacher = create(:teacher)
    section = create_csa_section(verified_teacher)
    create(:section_instructor, section: section, instructor: co_teacher, status: :invited)

    assert_empty Policies::Javabuilder.verified_teacher_ids(co_teacher)
  end

  test 'co-teacher does not inherit id from non-CSA section' do
    verified_teacher = create(:authorized_teacher)
    co_teacher = create(:teacher)
    section = create(:section, user: verified_teacher)
    create(:section_instructor, section: section, instructor: co_teacher, status: :active)

    assert_empty Policies::Javabuilder.verified_teacher_ids(co_teacher)
  end

  test 'co-teacher does not inherit id from unverified teacher' do
    teacher = create(:teacher)
    co_teacher = create(:teacher)
    section = create_csa_section(teacher)
    create(:section_instructor, section: section, instructor: co_teacher, status: :active)

    assert_empty Policies::Javabuilder.verified_teacher_ids(co_teacher)
  end

  private def create_csa_section(teacher)
    csa_script = create(:csa_script, :in_single_unit_course)
    create(:section, user: teacher, script: csa_script)
  end
end
