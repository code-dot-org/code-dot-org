require 'test_helper'

class ScriptDslTest < ActiveSupport::TestCase
  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  def setup
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
  end

  DEFAULT_PROPS = {
    id: nil,
    hidden: true,
    wrapup_video: nil,
    login_required: false,
    professional_learning_course: nil,
    hideable_stages: false,
    exclude_csf_column_in_legend: false,
    student_detail_progress_view: false,
    peer_reviews_to_complete: nil,
    teacher_resources: [],
    stage_extras_available: false,
    has_verified_resources: false,
    has_lesson_plan: false,
    curriculum_path: nil,
    project_widget_visible: false,
    project_widget_types: [],
    script_announcements: nil,
    new_name: nil,
    family_name: nil,
    version_year: nil,
    is_stable: nil,
    supported_locales: [],
    pilot_experiment: nil,
    editor_experiment: nil,
    project_sharing: nil,
    curriculum_umbrella: nil
  }

  test 'test Script DSL' do
    input_dsl = <<-DSL.gsub(/^\s+/, '')
      stage 'Stage1'
      level 'Level 1'
      level 'Level 2'
      level 'Level 3'

      stage 'Stage2'
      level 'Level 4'
      level 'Level 5'
    DSL
    output, i18n = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: 'Stage1',
            scriptlevels: [
              {stage: 'Stage1', levels: [{name: 'Level 1'}]},
              {stage: 'Stage1', levels: [{name: 'Level 2'}]},
              {stage: 'Stage1', levels: [{name: 'Level 3'}]}
            ]
          },
          {
            stage: 'Stage2',
            scriptlevels: [
              {stage: 'Stage2', levels: [{name: 'Level 4'}]},
              {stage: 'Stage2', levels: [{name: 'Level 5'}]}
            ]
          }
        ],
      }
    )

    i18n_expected = {'test' => {'stages' => {
      'Stage1' => {'name' => 'Stage1'},
      'Stage2' => {'name' => 'Stage2'}
    }}}
    assert_equal expected, output
    assert_equal i18n_expected, i18n
  end

  test 'test Script DSL with level variants' do
    input_dsl = "
stage 'Stage1'
level 'Level 1'
variants
level 'Level 2a'
level 'Level 2b', active: false
endvariants
level 'Level 3'
"
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "Stage1",
            scriptlevels: [
              {stage: "Stage1", levels: [{name: "Level 1"}]},
              {
                stage: "Stage1",
                levels: [{name: "Level 2a"}, {name: "Level 2b"}],
                properties: {
                  variants: {"Level 2b" => {active: false}}
                }
              },
              {stage: "Stage1", levels: [{name: "Level 3"}]}
            ]
          }
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'test Script DSL with experiment-based swap' do
    input_dsl = "
stage 'Stage1'
level 'Level 1'
variants
  level 'Level 2a'
  level 'Level 2b', experiments: ['experiment1']
endvariants
variants
  level 'Level 3a', active: false
  level 'Level 3b', experiments: ['experiment2'], active: true
endvariants
variants
  level 'Level 4a', active: true, experiments: []
  level 'Level 4b', experiments: ['experiment3', 'experiment4']
endvariants
"
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "Stage1",
            scriptlevels: [
              {stage: "Stage1", levels: [{name: "Level 1"}]},
              {
                stage: "Stage1",
                levels: [{name: "Level 2a"}, {name: "Level 2b"}],
                properties: {
                  variants: {"Level 2b" => {active: false, experiments: ["experiment1"]}}
                }
              },
              {
                stage: "Stage1",
                levels: [{name: "Level 3a"}, {name: "Level 3b"}],
                properties: {
                  variants: {
                    "Level 3a" => {active: false},
                    "Level 3b" => {experiments: ["experiment2"]}
                  }
                }
              },
              {
                stage: "Stage1",
                levels: [{name: "Level 4a"}, {name: "Level 4b"}],
                properties: {
                  variants: {"Level 4b" => {active: false, experiments: ["experiment3", "experiment4"]}}
                }
              },
            ]
          }
        ]
      }
    )
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize variants with experiment-based swap' do
    level = create :maze, name: 'maze 1', level_num: 'custom'
    level2 = create :maze, name: 'maze 2', level_num: 'custom'
    level3 = create :maze, name: 'maze 3', level_num: 'custom'
    script = create :script, hidden: true
    stage = create :stage, name: 'stage 1', script: script
    script_level = create(
      :script_level,
      levels: [level, level2, level3],
      properties: {
        'variants': {
          'maze 2': {'active': false, 'experiments': ['testExperiment']},
          'maze 3': {'active': false, 'experiments': ['testExperiment2', 'testExperiment3']},
        }
      },
      stage: stage,
      script: script
    )
    script_text = ScriptDSL.serialize_to_string(script_level.script)
    expected = <<-SCRIPT
stage 'stage 1'
variants
  level 'maze 1'
  level 'maze 2', experiments: ["testExperiment"]
  level 'maze 3', experiments: ["testExperiment2","testExperiment3"]
endvariants
SCRIPT
    assert_equal expected, script_text
  end

  test 'test Script DSL flex category as property hash' do
    input_dsl = <<DSL
stage 'Stage1',
  flex_category: 'Content'
level 'Level 1'
stage 'Stage2',
  flex_category: 'Practice'
level 'Level 2'
stage 'Stage3'
level 'Level 3'
DSL
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "Stage1",
            scriptlevels: [
              {stage: "Stage1", levels: [{name: "Level 1", stage_flex_category: "Content"}]},
            ]
          },
          {
            stage: "Stage2",
            scriptlevels: [
              {stage: "Stage2", levels: [{name: "Level 2", stage_flex_category: "Practice"}]},
            ]
          },
          {
            stage: "Stage3",
            scriptlevels: [
              {stage: "Stage3", levels: [{name: "Level 3"}]},
            ]
          }
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'test Script DSL property lockable as property hash' do
    input_dsl = <<DSL
stage 'Stage1',
  flex_category: 'Content',
  lockable: true
level 'Level 1'
stage 'Stage2'
level 'Level 2'
DSL
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "Stage1",
            scriptlevels: [
              {stage: "Stage1", levels: [{name: "Level 1", stage_flex_category: "Content", stage_lockable: true}]},
            ]
          },
          {
            stage: "Stage2",
            scriptlevels: [
              {stage: "Stage2", levels: [{name: "Level 2"}]},
            ]
          }
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'can set hideable_stages' do
    input_dsl = <<DSL
hideable_stages 'true'

stage 'Stage1'
level 'Level 1'
stage 'Stage2'
level 'Level 2'
DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal true, output[:hideable_stages]
  end

  test 'can set exclude_csf_column_in_legend' do
    input_dsl = <<DSL
exclude_csf_column_in_legend 'true'

stage 'Stage1'
level 'Level 1'
stage 'Stage2'
level 'Level 2'
DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal true, output[:exclude_csf_column_in_legend]
  end

  test 'can set student_detail_progress_view' do
    input_dsl = <<DSL
student_detail_progress_view 'true'

stage 'Stage1'
level 'Level 1'
stage 'Stage2'
level 'Level 2'
DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal true, output[:student_detail_progress_view]
  end

  test 'can set has_verified_resources' do
    input_dsl = <<DSL
has_verified_resources 'true'

stage 'Stage1'
level 'Level 1'
stage 'Stage2'
level 'Level 2'
DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal true, output[:has_verified_resources]
  end

  test 'can set has_lesson_plan' do
    input_dsl = <<DSL
has_lesson_plan 'true'

stage 'Stage1'
level 'Level 1'
stage 'Stage2'
level 'Level 2'
DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal true, output[:has_lesson_plan]
  end

  test 'can set teacher_resources' do
    input_dsl = <<DSL
teacher_resources [['curriculum', '/link/to/curriculum'], ['vocabulary', '/link/to/vocab']]

stage 'Stage1'
level 'Level 1'
DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal [['curriculum', '/link/to/curriculum'], ['vocabulary', '/link/to/vocab']], output[:teacher_resources]
  end

  test 'can set script_announcements' do
    input_dsl = <<DSL
script_announcements [{"notice": "NoticeHere", "details": "DetailsHere", "link": "/foo/bar", "type": "information"}]

stage 'Stage1'
level 'Level 1'
DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal [{"notice": "NoticeHere", "details": "DetailsHere", "link": "/foo/bar", "type": "information"}], output[:script_announcements]
  end

  test 'can set pilot_experiment' do
    input_dsl = <<DSL
pilot_experiment 'science-experiment'

stage 'Stage1'
level 'Level 1'
DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal 'science-experiment', output[:pilot_experiment]
  end

  test 'can set editor_experiment' do
    input_dsl = <<DSL
editor_experiment 'script-editors'

stage 'Stage1'
level 'Level 1'
DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal 'script-editors', output[:editor_experiment]
  end

  test 'serialize editor_experiment' do
    script = create :script, editor_experiment: 'editors'
    script_text = ScriptDSL.serialize_to_string(script)
    expected = <<-SCRIPT
hidden false
editor_experiment 'editors'

    SCRIPT
    assert_equal expected, script_text
  end

  test 'Script DSL with level progressions' do
    input_dsl = <<DSL
stage 'Stage1'
level 'Level 1'
level 'Level 2', progression: 'Foo'
level 'Level 3', progression: 'Foo'
DSL
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "Stage1",
            scriptlevels: [
              {stage: "Stage1", levels: [{name: "Level 1"}]},
              {stage: "Stage1", levels: [{name: "Level 2"}], properties: {progression: 'Foo'}},
              {stage: "Stage1", levels: [{name: "Level 3"}], properties: {progression: 'Foo'}},
            ]
          }
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'test Script DSL with level variants and progressions' do
    input_dsl = "
stage 'Stage1'
level 'Level 1'
variants
level 'Level 2a', progression: 'Foo'
level 'Level 2b', active: false, progression: 'Foo'
endvariants
level 'Level 3'
"
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "Stage1",
            scriptlevels: [
              {stage: "Stage1", levels: [{name: "Level 1"}]},
              {
                stage: "Stage1",
                levels: [{name: "Level 2a"}, {name: "Level 2b"}],
                properties: {
                  variants: {"Level 2b" => {active: false}},
                  progression: 'Foo'
                }
              },
              {stage: "Stage1", levels: [{name: "Level 3"}]}
            ]
          }
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'raises exception if two variants have different progressions' do
    input_dsl = "
stage 'Stage1'
level 'Level 1'
variants
level 'Level 2a', progression: 'Foo1'
level 'Level 2b', active: false, progression: 'Foo2'
endvariants
level 'Level 3'
"
    assert_raises do
      ScriptDSL.parse(input_dsl, 'test.script', 'test')
    end
  end

  test 'Script DSL with level challenge' do
    input_dsl = <<DSL
stage 'Stage1'
level 'Level 1'
level 'Level 2'
level 'Level 3', challenge: true
level 'Level 4'
variants
  level 'Level 5', challenge: true
  level 'Level 5.1', active: false
endvariants
DSL
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "Stage1",
            scriptlevels: [
              {stage: "Stage1", levels: [{name: "Level 1"}]},
              {stage: "Stage1", levels: [{name: "Level 2"}]},
              {stage: "Stage1", levels: [{name: "Level 3"}], properties: {challenge: true}},
              {stage: "Stage1", levels: [{name: "Level 4"}]},
              {
                stage: "Stage1",
                levels: [
                  {name: "Level 5"},
                  {name: "Level 5.1"},
                ],
                properties: {
                  variants: {"Level 5.1" => {active: false}},
                  challenge: true,
                },
              },
            ]
          }
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'Script DSL with skipped extras' do
    input_dsl = <<DSL
stage 'Stage1'
level 'Level 1'
level 'Level 2'
no_extras
DSL
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "Stage1",
            stage_extras_disabled: true,
            scriptlevels: [
              {stage: "Stage1", levels: [{name: "Level 1"}]},
              {stage: "Stage1", levels: [{name: "Level 2"}]},
            ]
          }
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'Script DSL with project_sharing' do
    input_dsl = 'project_sharing true'
    expected = DEFAULT_PROPS.merge(
      {
        stages: [],
        project_sharing: true
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize project_sharing' do
    script = create :script, project_sharing: true
    script_text = ScriptDSL.serialize_to_string(script)
    expected = <<-SCRIPT
hidden false
project_sharing true

SCRIPT

    assert_equal expected, script_text
  end

  test 'Script DSL with curriculum_umbrella' do
    input_dsl = "curriculum_umbrella 'CSF'"
    expected = DEFAULT_PROPS.merge(
      {
        stages: [],
        curriculum_umbrella: 'CSF'
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize curriculum_umbrella' do
    script = create :script, curriculum_umbrella: 'CSP'
    script_text = ScriptDSL.serialize_to_string(script)
    expected = <<-SCRIPT
hidden false
curriculum_umbrella 'CSP'

SCRIPT

    assert_equal expected, script_text
  end

  test 'Script DSL with new_name, family_name, version_year and is_stable' do
    input_dsl = <<DSL
new_name 'new name'
family_name 'family name'
version_year '3035'
is_stable true
stage 'Stage1'
level 'Level 1'
level 'Level 2'
DSL
    expected = DEFAULT_PROPS.merge(
      {
        new_name: "new name",
        family_name: "family name",
        version_year: "3035",
        is_stable: true,
        stages: [
          {
            stage: "Stage1",
            scriptlevels: [
              {stage: "Stage1", levels: [{name: "Level 1"}]},
              {stage: "Stage1", levels: [{name: "Level 2"}]},
            ]
          }
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize new_name, family_name, version_year and is_stable' do
    script = create :script,
      {
        new_name: 'new name',
        family_name: 'family name',
        version_year: '2001',
        is_stable: true
      }
    script_text = ScriptDSL.serialize_to_string(script)
    expected = <<-SCRIPT
hidden false
new_name 'new name'
family_name 'family name'
version_year '2001'
is_stable true

SCRIPT
    assert_equal expected, script_text
  end

  test 'serialize named_level' do
    level = create :maze, name: 'maze 1', level_num: 'custom'
    script = create :script, hidden: true
    stage = create :stage, name: 'stage 1', script: script
    script_level = create(
      :script_level,
      levels: [level],
      named_level: true,
      stage: stage,
      script: script
    )
    script_text = ScriptDSL.serialize_to_string(script_level.script)
    expected = <<-SCRIPT
stage 'stage 1'
level 'maze 1', named: true
    SCRIPT
    assert_equal expected, script_text
  end

  test 'Script DSL with named: true' do
    input_dsl = <<DSL
stage 'stage 1'
level 'maze 1', named: true
DSL
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "stage 1",
            scriptlevels: [{stage: "stage 1", levels: [{name: "maze 1", named_level: true}]},]
          }
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize assessment' do
    level = create :maze, name: 'maze 1', level_num: 'custom'
    script = create :script, hidden: true
    stage = create :stage, name: 'stage 1', script: script
    script_level = create(
      :script_level,
      levels: [level],
      assessment: true,
      stage: stage,
      script: script
    )
    script_text = ScriptDSL.serialize_to_string(script_level.script)
    expected = <<-SCRIPT
stage 'stage 1'
level 'maze 1', assessment: true
    SCRIPT
    assert_equal expected, script_text
  end

  test 'Script DSL with assessment: true' do
    input_dsl = <<DSL
stage 'stage 1'
level 'maze 1', assessment: true
DSL
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "stage 1",
            scriptlevels: [{stage: "stage 1", levels: [{name: "maze 1", assessment: true}]},]
          }
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'script DSL with single quotes' do
    input_dsl = <<-DSL.gsub(/^\s+/, '')
      stage 'Bob\\'s stage'
      level 'Level 1', progression: 'Bob\\'s progression'
      level 'Level 2'
    DSL
    assert_includes(input_dsl, "Bob\\'s stage")
    assert_includes(input_dsl, "Bob\\'s progression")
    output, i18n = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    expected = DEFAULT_PROPS.merge(
      {
        stages: [
          {
            stage: "Bob's stage",
            scriptlevels: [
              {stage: "Bob's stage", levels: [{name: 'Level 1'}], properties: {progression: "Bob's progression"}},
              {stage: "Bob's stage", levels: [{name: 'Level 2'}]},
            ]
          }
        ],
      }
    )

    i18n_expected = {'test' => {'stages' => {
      "Bob's stage" => {'name' => "Bob's stage"},
    }}}
    assert_equal expected, output
    assert_equal i18n_expected, i18n
  end
end
