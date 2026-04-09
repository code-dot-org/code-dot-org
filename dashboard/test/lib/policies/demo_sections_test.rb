require 'test_helper'
require 'policies/demo_sections'

class Policies::DemoSectionsTest < ActiveSupport::TestCase
  setup do
    Policies::DemoSections.reset_cache!
  end

  # demo_student_ids

  test 'demo_student_ids returns ids for known type' do
    CDO.stubs(:demo_student_ids).returns({'aif' => ['2', '3'], 'csd' => ['4', '5']})

    assert_equal [2, 3], Policies::DemoSections.demo_student_ids(:aif)
  end

  test 'demo_student_ids returns empty array for unknown demo type' do
    CDO.stubs(:demo_student_ids).returns({'aif' => ['2', '3']})

    assert_equal [], Policies::DemoSections.demo_student_ids(:unknown_type)
  end

  test 'demo_student_ids returns empty array when config is nil' do
    CDO.stubs(:demo_student_ids).returns(nil)

    assert_equal [], Policies::DemoSections.demo_student_ids(:aif)
  end

  test 'demo_student_ids converts string ids to integers' do
    CDO.stubs(:demo_student_ids).returns({'aif' => ['10', '11']})

    assert_equal [10, 11], Policies::DemoSections.demo_student_ids(:aif)
  end

  # all_demo_student_ids

  test 'all_demo_student_ids returns combined ids from all types' do
    CDO.stubs(:demo_student_ids).returns({'aif' => ['2', '3'], 'csd' => ['4', '5']})

    assert_equal [2, 3, 4, 5], Policies::DemoSections.all_demo_student_ids.sort
  end

  test 'all_demo_student_ids returns empty array when config is nil' do
    CDO.stubs(:demo_student_ids).returns(nil)

    assert_equal Set[], Policies::DemoSections.all_demo_student_ids
  end

  # demo_student?

  test 'demo_student? returns true for a demo student id' do
    CDO.stubs(:demo_student_ids).returns({'aif' => ['2', '3']})

    assert Policies::DemoSections.demo_student?(2)
  end

  test 'demo_student? returns false for a non-demo student id' do
    CDO.stubs(:demo_student_ids).returns({'aif' => ['2', '3']})

    refute Policies::DemoSections.demo_student?(999)
  end
end
