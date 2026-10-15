require 'test_helper'

class ParentLevelsChildLevelTest < ActiveSupport::TestCase
  test 'validate child level kind' do
    parent = create(:level)
    child = create(:free_response)
    ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child,
      kind: ParentLevelsChildLevel::CONTAINED
    )
    child = create(:level)
    ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child,
      kind: ParentLevelsChildLevel::PROJECT_TEMPLATE
    )
    child = create(:level)
    ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child,
      kind: ParentLevelsChildLevel::SUBLEVEL
    )

    child = create(:level)
    pc = ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child
    )
    assert_equal ParentLevelsChildLevel::SUBLEVEL, pc.kind

    child = create(:level)
    assert_raises ActiveRecord::RecordInvalid do
      ParentLevelsChildLevel.find_or_create_by!(
        parent_level: parent,
        child_level: child,
        kind: 'bogus'
      )
    end
  end

  test 'scopes filter by kind' do
    parent = create(:level)

    contained = create(:free_response)
    ParentLevelsChildLevel.create!(
      parent_level: parent,
      child_level: contained,
      kind: ParentLevelsChildLevel::CONTAINED
    )

    project_template = create(:level)
    ParentLevelsChildLevel.create!(
      parent_level: parent,
      child_level: project_template,
      kind: ParentLevelsChildLevel::PROJECT_TEMPLATE
    )

    sublevel = create(:level)
    ParentLevelsChildLevel.create!(
      parent_level: parent,
      child_level: sublevel,
      kind: ParentLevelsChildLevel::SUBLEVEL
    )

    assert_equal [contained, project_template, sublevel],
      ParentLevelsChildLevel.where(parent_level: parent).map(&:child_level)
    assert_equal [contained],
      ParentLevelsChildLevel.where(parent_level: parent).contained.map(&:child_level)
    assert_equal [project_template],
      ParentLevelsChildLevel.where(parent_level: parent).project_template.map(&:child_level)
    assert_equal [sublevel],
      ParentLevelsChildLevel.where(parent_level: parent).sublevel.map(&:child_level)
  end

  test 'parent and child must be on the same side of the UI Test partition' do
    prod_level = create(:level, name: 'PLCL prod level')
    ui_test_level = create(:level, name: 'UI Test PLCL level')

    e = assert_raises ActiveRecord::RecordInvalid do
      ParentLevelsChildLevel.create!(parent_level: prod_level, child_level: ui_test_level)
    end
    assert_includes e.message, ui_test_level.name

    e = assert_raises ActiveRecord::RecordInvalid do
      ParentLevelsChildLevel.create!(parent_level: ui_test_level, child_level: prod_level)
    end
    assert_includes e.message, prod_level.name

    # same-side rows are fine in both partitions
    ParentLevelsChildLevel.create!(parent_level: prod_level, child_level: create(:level, name: 'PLCL prod child'))
    ParentLevelsChildLevel.create!(parent_level: ui_test_level, child_level: create(:level, name: 'UI Test PLCL child'))
  end
end
