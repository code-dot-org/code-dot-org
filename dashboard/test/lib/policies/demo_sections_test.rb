require 'test_helper'
require 'policies/demo_sections'

class Policies::DemoSectionsTest < ActiveSupport::TestCase
  # demo_student_ids

  test 'demo_student_ids returns ids for known type in adhoc environment' do
    CDO.expects(:rack_env).returns('adhoc')

    assert_equal [2, 3], Policies::DemoSections.demo_student_ids(:aif)
  end

  test 'demo_student_ids returns empty array in production environment' do
    CDO.expects(:rack_env).returns('production')

    assert_equal [], Policies::DemoSections.demo_student_ids(:aif)
  end

  test 'demo_student_ids returns empty array for unknown demo type' do
    CDO.expects(:rack_env).returns('adhoc')

    assert_equal [], Policies::DemoSections.demo_student_ids(:unknown_type)
  end

  test 'demo_student_ids uses CDO.demo_student_ids in development environment' do
    CDO.expects(:rack_env).returns('development')
    CDO.expects(:demo_student_ids).returns({'aif' => ['10', '11']})

    assert_equal [10, 11], Policies::DemoSections.demo_student_ids(:aif)
  end

  # all_demo_student_ids

  test 'all_demo_student_ids returns combined ids from all types in adhoc' do
    CDO.expects(:rack_env).returns('adhoc').times(2)

    result = Policies::DemoSections.all_demo_student_ids
    assert_equal [2, 3, 4, 5], result.sort
  end

  test 'all_demo_student_ids returns empty array in production' do
    CDO.expects(:rack_env).returns('production').times(2)

    assert_equal [], Policies::DemoSections.all_demo_student_ids
  end

  # demo_student?

  test 'demo_student? returns true for a demo student id' do
    CDO.expects(:rack_env).returns('adhoc').times(2)

    assert Policies::DemoSections.demo_student?(2)
  end

  test 'demo_student? returns false for a non-demo student id' do
    CDO.expects(:rack_env).returns('adhoc').times(2)

    refute Policies::DemoSections.demo_student?(999)
  end
end
