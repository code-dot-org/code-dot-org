require 'test_helper'

class LevelsWithinLevelsTest < ActiveSupport::TestCase
  test 'parent levels and child levels' do
    parent = create :level
    child = create :level
    parent.child_levels << child
    assert_equal [parent], child.parent_levels

    # cannot add the same child a second time
    assert_raises ActiveRecord::RecordInvalid do
      parent.child_levels << child
    end

    # cannot add the same parent a second time
    assert_raises ActiveRecord::RecordInvalid do
      child.parent_levels << parent
    end
  end

  test 'scoped parent/child relationships' do
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

    assert_equal [contained, project_template, sublevel], parent.child_levels
    assert_equal [contained], parent.child_levels.contained
    assert_equal [project_template], parent.child_levels.project_template
    assert_equal [sublevel], parent.child_levels.sublevel
  end

  test 'child levels are in order of position' do
    parent = create :level
    child3 = create :level
    child2 = create :level
    child1 = create :level
    ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child3,
      position: 3
    )
    ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child1,
      position: 1
    )
    ParentLevelsChildLevel.find_or_create_by!(
      parent_level: parent,
      child_level: child2,
      position: 2
    )
    assert_equal [child1, child2, child3], parent.child_levels
  end

  test 'all_descendant_levels works on self-referential project template levels' do
    level_name = 'project-template-level'
    level = create :level, name: level_name, properties: {project_template_level_name: level_name}
    assert_equal level, level.project_template_level

    assert_equal [], level.all_descendant_levels, 'omit self from descendant levels'
  end
end
