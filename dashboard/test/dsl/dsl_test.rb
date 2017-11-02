require 'test_helper'

class DslTest < ActiveSupport::TestCase
  def setup
    Rails.application.config.stubs(:levelbuilder_mode).returns false
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
    project_widget_visible: false,
    project_widget_types: [],
    script_announcements: nil,
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

    i18n_expected = {'en' => {'data' => {'script' => {'name' => {'test' => {'stages' => {
      'Stage1' => {'name' => 'Stage1'},
      'Stage2' => {'name' => 'Stage2'}
    }}}}}}}
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

  test 'test Multi DSL' do
    input_dsl = "
name 'name1'
title 'title1'
description 'desc1'
question 'q1'
wrong 'w1'
wrong 'w2'
right 'r1'
wrong 'w3'
"
    output, i18n = MultiDSL.parse(input_dsl, 'test')
    expected = {
      name: 'name1', properties: {
        options: {},
        questions: [{text: 'q1'}],
        answers: [
          {text: 'w1', correct: false},
          {text: 'w2', correct: false},
          {text: 'r1', correct: true},
          {text: 'w3', correct: false}
        ],
        title: 'title1',
        content1: 'desc1'
      }
    }
    i18n_expected = {
      'en' => {
        'data' => {
          'multi' => {
            'name1' => {
              'title1' => 'title1',
              'desc1' => 'desc1',
              'q1' => 'q1',
              'w1' => 'w1',
              'w2' => 'w2',
              'r1' => 'r1',
              'w3' => 'w3'
            }
          }
        }
      }
    }
    assert_equal expected, output
    assert_equal i18n_expected.to_yaml, i18n.to_yaml
  end

  test 'test empty i18n' do
    # Ensure nil entries are filtered from i18n files
    input_dsl = <<DSL
name 'name1'
title nil
DSL
    _, i18n = MultiDSL.parse(input_dsl, 'test')
    i18n_expected = {'en' => {'data' => {'multi' => {'name1' => {}}}}}
    assert_equal i18n_expected, i18n
  end

  test 'test Evaluation Question' do
    script = create :script
    stage1 = create(:stage, name: 'Stage1', script: script)
    stage2 = create(:stage, name: 'Stage2', script: script)
    input_dsl = <<DSL
name 'Test question'
display_name 'Test override question'
question 'Question text'
answer 'answer 1'
answer 'answer 2', weight: 2, stage_name: '#{stage1.name}'
answer 'answer 3', stage_name: '#{stage2.name}'
DSL

    output, _ = EvaluationMulti.parse(input_dsl, 'test')
    expected = {
      name: 'Test question',
      properties: {
        display_name: 'Test override question',
        options: {},
        questions: [{text: 'Question text'}],
        answers: [
          {text: 'answer 1', weight: 1, stage: nil},
          {text: 'answer 2', weight: 2, stage: stage1.name},
          {text: 'answer 3', weight: 1, stage: stage2.name},
        ]
      }
    }
    assert_equal expected, output
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

  test 'Script DSL with level target and challenge' do
    input_dsl = <<DSL
stage 'Stage1'
level 'Level 1'
level 'Level 2'
level 'Level 3', challenge: true
level 'Level 4', target: true
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
              {stage: "Stage1", levels: [{name: "Level 4"}], properties: {target: true}},
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
end
