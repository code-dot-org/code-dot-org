require 'test_helper'
require 'policies/demo_sections'

class Policies::DemoSectionsTest < ActiveSupport::TestCase
  setup do
    Policies::DemoSections.reset_cache!
  end

  # demo_student_ids

  test 'demo_student_ids returns ids for known type' do
    high1 = create(:student, :in_email_section)
    high2 = create(:student, :in_email_section)
    create(:student) # middle, not returned
    DemoStudent.create!(user: high1, demo_type: 'high')
    DemoStudent.create!(user: high2, demo_type: 'high')

    assert_equal [high1.id, high2.id].sort, Policies::DemoSections.demo_student_ids(:high)
  end

  test 'demo_student_ids returns empty array for unknown demo type' do
    DemoStudent.create!(user: create(:student, :in_email_section), demo_type: 'high')

    assert_equal [], Policies::DemoSections.demo_student_ids(:unknown_type)
  end

  test 'demo_student_ids returns empty array when no rows exist' do
    assert_equal [], Policies::DemoSections.demo_student_ids(:high)
  end

  test 'demo_student_ids accepts string argument' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')

    assert_equal [student.id], Policies::DemoSections.demo_student_ids('high')
  end

  # all_demo_student_ids

  test 'all_demo_student_ids returns combined ids from all types' do
    high = create(:student, :in_email_section)
    middle = create(:student_in_word_section)
    DemoStudent.create!(user: high, demo_type: 'high')
    DemoStudent.create!(user: middle, demo_type: 'middle')
    Policies::DemoSections.reset_cache!

    assert_equal Set[high.id, middle.id], Policies::DemoSections.all_demo_student_ids
  end

  test 'all_demo_student_ids returns empty set when no rows exist' do
    assert_equal Set[], Policies::DemoSections.all_demo_student_ids
  end

  # get_preset

  test 'get_preset returns preset for known type' do
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:ci_webserver?).returns(false)

    preset = Policies::DemoSections.get_preset(:high)

    assert_equal 'High School Practice Section', preset[:section_name]
    assert_equal 'email', preset[:login_type]
    assert_equal 'student', preset[:participant_type]
    assert_equal %w[9 10 11 12], preset[:grades]
    assert_equal 'aif2-2025', preset[:unit_name]
    assert_equal 'artificial-intelligence-foundations-2025', preset[:unit_group_name]
  end

  test 'get_preset uses allthethings curriculum names in test' do
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:rack_env?).with(:test).returns(true)

    preset = Policies::DemoSections.get_preset(:high)

    assert_equal 'allthethings', preset[:unit_name]
    assert_equal 'original-allthethings-course', preset[:unit_group_name]
  end

  test 'get_preset uses allthethings curriculum names on ci webserver' do
    CDO.stubs(:ci_webserver?).returns(true)

    preset = Policies::DemoSections.get_preset(:high)

    assert_equal 'allthethings', preset[:unit_name]
    assert_equal 'original-allthethings-course', preset[:unit_group_name]
  end

  test 'get_preset uses adhoc curriculum names by demo type from config' do
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:rack_env?).with(:adhoc).returns(true)
    CDO.stubs(:demo_section_units).returns(
      {
        'high' => 'adhoc-high-unit',
      }
    )
    CDO.stubs(:demo_section_unit_groups).returns(
      {
        'high' => 'adhoc-high-course',
      }
    )

    high_preset = Policies::DemoSections.get_preset(:high)
    middle_preset = Policies::DemoSections.get_preset(:middle)

    assert_equal 'adhoc-high-unit', high_preset[:unit_name]
    assert_equal 'adhoc-high-course', high_preset[:unit_group_name]
    assert_equal 'csd3-2024', middle_preset[:unit_name]
    assert_equal 'csd-2024', middle_preset[:unit_group_name]
  end

  test 'get_preset ignores malformed adhoc curriculum config' do
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:rack_env?).with(:adhoc).returns(true)
    CDO.stubs(:demo_section_units).returns(['adhoc-high-unit'])
    CDO.stubs(:demo_section_unit_groups).returns('adhoc-high-course')
    Rails.logger.expects(:error).twice

    preset = Policies::DemoSections.get_preset(:high)

    assert_equal 'aif2-2025', preset[:unit_name]
    assert_equal 'artificial-intelligence-foundations-2025', preset[:unit_group_name]
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

  # preset_view

  test 'preset_view returns a display projection for a valid preset' do
    view = Policies::DemoSections.preset_view(:high)

    assert_equal 'high', view[:demo_type]
    assert_equal 'High School Practice Section', view[:section_name]
    assert_equal 8, view[:avatar_color]
    assert_equal 5, view[:avatar_emoji]
    assert_equal 'email', view[:login_type]
    assert_equal 'student', view[:participant_type]
    assert_equal({name: 'allthethings', display_name: 'All the Things!'}, view[:unit])
    assert_equal(
      {name: 'original-allthethings-course', display_name: 'original-allthethings-course'},
      view[:unit_group]
    )
  end

  test 'preset_view returns nil when the unit cannot be resolved' do
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:ci_webserver?).returns(false)

    assert_nil Policies::DemoSections.preset_view(:high)
  end

  test 'preset_view returns nil when the unit group cannot be resolved' do
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:ci_webserver?).returns(false)
    create(:unit, name: 'aif2-2025')

    assert_nil Policies::DemoSections.preset_view(:high)
  end

  test 'preset_views_for_all_types skips misconfigured presets' do
    valid_view = {demo_type: 'middle'}

    Policies::DemoSections.expects(:preset_view).with(:high).returns(nil)
    Policies::DemoSections.expects(:preset_view).with(:middle).returns(valid_view)
    Policies::DemoSections.expects(:preset_view).with(:elementary).returns(nil)

    assert_equal({middle: valid_view}, Policies::DemoSections.preset_views_for_all_types)
  end

  # demo_student?

  test 'demo_student? returns true for a demo student id' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')
    Policies::DemoSections.reset_cache!

    assert Policies::DemoSections.demo_student?(student.id)
  end

  test 'demo_student? returns false for a non-demo student id' do
    DemoStudent.create!(user: create(:student, :in_email_section), demo_type: 'high')
    Policies::DemoSections.reset_cache!

    refute Policies::DemoSections.demo_student?(-1)
  end

  test 'demo_student? matches across all demo types' do
    high = create(:student, :in_email_section)
    middle = create(:student_in_word_section)
    elementary = create(:student_in_picture_section)
    DemoStudent.create!(user: high, demo_type: 'high')
    DemoStudent.create!(user: middle, demo_type: 'middle')
    DemoStudent.create!(user: elementary, demo_type: 'elementary')
    Policies::DemoSections.reset_cache!

    assert Policies::DemoSections.demo_student?(high.id)
    assert Policies::DemoSections.demo_student?(middle.id)
    assert Policies::DemoSections.demo_student?(elementary.id)
    refute Policies::DemoSections.demo_student?(-1)
  end

  # demo_student_durable?

  test 'demo_student_durable? returns true for a demo student id without caching' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')

    # Force the in-process cache to a wrong answer; the durable check must
    # ignore it and ask the database directly.
    Policies::DemoSections.instance_variable_set(:@all_demo_student_ids, Set.new)

    refute Policies::DemoSections.demo_student?(student.id)
    assert Policies::DemoSections.demo_student_durable?(student.id)
  end

  test 'demo_student_durable? returns false for a non-demo student id' do
    refute Policies::DemoSections.demo_student_durable?(-1)
  end

  test 'demo_student_durable? accepts string argument' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')

    assert Policies::DemoSections.demo_student_durable?(student.id.to_s)
  end
end
