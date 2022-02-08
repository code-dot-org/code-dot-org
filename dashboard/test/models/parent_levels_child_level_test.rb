require 'test_helper'

class ParentLevelsChildLevelTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  test 'validate child level kind' do
    parent = create :level
    child = create :level
    ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child,
      kind: ParentLevelsChildLevel::CONTAINED
    )
    child = create :level
    ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child,
      kind: ParentLevelsChildLevel::PROJECT_TEMPLATE
    )
    child = create :level
    ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child,
      kind: ParentLevelsChildLevel::SUBLEVEL
    )

    child = create :level
    pc = ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child
    )
    assert_equal ParentLevelsChildLevel::SUBLEVEL, pc.kind

    child = create :level
    assert_raises ActiveRecord::RecordInvalid do
      ParentLevelsChildLevel.find_or_create_by!(
        parent_level: parent,
        child_level: child,
        kind: 'bogus'
      )
    end
  end

  test 'scopes filter by kind' do
    parent = create :level

    contained = create :level
    ParentLevelsChildLevel.create(
      parent_level: parent,
      child_level: contained,
      kind: ParentLevelsChildLevel::CONTAINED
    )

    project_template = create :level
    ParentLevelsChildLevel.create(
      parent_level: parent,
      child_level: project_template,
      kind: ParentLevelsChildLevel::PROJECT_TEMPLATE
    )

    sublevel = create :level
    ParentLevelsChildLevel.create(
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
end
