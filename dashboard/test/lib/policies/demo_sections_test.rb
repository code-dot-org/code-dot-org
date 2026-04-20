require 'test_helper'
require 'policies/demo_sections'

class Policies::DemoSectionsTest < ActiveSupport::TestCase
  setup do
    Policies::DemoSections.reset_cache!
  end

  # demo_student_ids

  test 'demo_student_ids returns ids for known type' do
    CDO.stubs(:demo_student_ids).returns({'high' => ['2', '3'], 'middle' => ['4', '5']})

    assert_equal [2, 3], Policies::DemoSections.demo_student_ids(:high)
  end

  test 'demo_student_ids returns empty array for unknown demo type' do
    CDO.stubs(:demo_student_ids).returns({'high' => ['2', '3']})

    assert_equal [], Policies::DemoSections.demo_student_ids(:unknown_type)
  end

  test 'demo_student_ids returns empty array when config is nil' do
    CDO.stubs(:demo_student_ids).returns(nil)

    assert_equal [], Policies::DemoSections.demo_student_ids(:high)
  end

  test 'demo_student_ids converts string ids to integers' do
    CDO.stubs(:demo_student_ids).returns({'high' => ['10', '11']})

    assert_equal [10, 11], Policies::DemoSections.demo_student_ids(:high)
  end

  # all_demo_student_ids

  test 'all_demo_student_ids returns combined ids from all types' do
    CDO.stubs(:demo_student_ids).returns(
      {'high' => ['2', '3'], 'middle' => ['4', '5'], 'elementary' => []}
    )

    assert_equal [2, 3, 4, 5], Policies::DemoSections.all_demo_student_ids.sort
  end

  test 'all_demo_student_ids returns empty array when config is nil' do
    CDO.stubs(:demo_student_ids).returns(nil)

    assert_equal Set[], Policies::DemoSections.all_demo_student_ids
  end

  # get_preset

  test 'get_preset returns preset for known type' do
    preset = Policies::DemoSections.get_preset(:high)

    assert_equal 'High School Practice Section', preset[:section_name]
    assert_equal 'email', preset[:login_type]
    assert_equal 'student', preset[:participant_type]
    assert_equal %w[9 10 11 12], preset[:grades]
    assert_equal 'aif-foundations-2026', preset[:unit_name]
    assert_equal 'ai-foundations-exploring-ai-and-cs-2026', preset[:unit_group_name]
  end

  test 'get_preset returns preset for each demo type' do
    Policies::DemoSections::DEMO_TYPES.each do |type|
      preset = Policies::DemoSections.get_preset(type)

      assert preset, "expected preset for #{type}"
      assert preset[:section_name], "expected section_name for #{type}"
      assert preset[:unit_name], "expected unit_name for #{type}"
    end
  end

  test 'get_preset accepts string argument' do
    assert_equal Policies::DemoSections.get_preset(:middle),
      Policies::DemoSections.get_preset('middle')
  end

  test 'get_preset returns nil for unknown type' do
    assert_nil Policies::DemoSections.get_preset(:unknown)
  end

  # demo_student?

  test 'demo_student? returns true for a demo student id' do
    CDO.stubs(:demo_student_ids).returns({'high' => ['2', '3']})

    assert Policies::DemoSections.demo_student?(2)
  end

  test 'demo_student? returns false for a non-demo student id' do
    CDO.stubs(:demo_student_ids).returns({'high' => ['2', '3']})

    refute Policies::DemoSections.demo_student?(999)
  end
end
