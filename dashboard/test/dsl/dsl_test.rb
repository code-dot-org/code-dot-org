require 'test_helper'

class DslTest < ActiveSupport::TestCase
  def setup
    Rails.application.config.stubs(:levelbuilder_mode).returns false
  end

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
    expected = {
      id: nil,
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
      hidden: true,
      wrapup_video: nil,
      login_required: false,
      professional_learning_course: nil,
      hideable_stages: false,
      student_detail_progress_view: false,
      peer_reviews_to_complete: nil
    }

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
    expected = {
      id: nil,
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
      ],
      hidden: true,
      wrapup_video: nil,
      login_required: false,
      hideable_stages: false,
      student_detail_progress_view: false,
      professional_learning_course: nil,
      peer_reviews_to_complete: nil
    }

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
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
    expected = {
      id: nil,
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
      ],
      hidden: true,
      wrapup_video: nil,
      login_required: false,
      hideable_stages: false,
      student_detail_progress_view: false,
      professional_learning_course: nil,
      peer_reviews_to_complete: nil
    }

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
    expected = {
      id: nil,
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
      ],
      hidden: true,
      wrapup_video: nil,
      login_required: false,
      hideable_stages: false,
      student_detail_progress_view: false,
      professional_learning_course: nil,
      peer_reviews_to_complete: nil
    }

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

  test 'Script DSL with level progressions' do
    input_dsl = <<DSL
stage 'Stage1'
level 'Level 1'
level 'Level 2', progression: 'Foo'
level 'Level 3', progression: 'Foo'
DSL
    expected = {
      id: nil,
      stages: [
        {
          stage: "Stage1",
          scriptlevels: [
            {stage: "Stage1", levels: [{name: "Level 1"}]},
            {stage: "Stage1", levels: [{name: "Level 2"}], properties: {progression: 'Foo'}},
            {stage: "Stage1", levels: [{name: "Level 3"}], properties: {progression: 'Foo'}},
          ]
        }
      ],
      hidden: true,
      wrapup_video: nil,
      login_required: false,
      hideable_stages: false,
      student_detail_progress_view: false,
      professional_learning_course: nil,
      peer_reviews_to_complete: nil
    }

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
    expected = {
      id: nil,
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
      ],
      hidden: true,
      wrapup_video: nil,
      login_required: false,
      hideable_stages: false,
      student_detail_progress_view: false,
      professional_learning_course: nil,
      peer_reviews_to_complete: nil
    }

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
level 'Level 5'
DSL
    expected = {
      id: nil,
      stages: [
        {
          stage: "Stage1",
          scriptlevels: [
            {stage: "Stage1", levels: [{name: "Level 1"}]},
            {stage: "Stage1", levels: [{name: "Level 2"}]},
            {stage: "Stage1", levels: [{name: "Level 3"}], properties: {challenge: true}},
            {stage: "Stage1", levels: [{name: "Level 4"}], properties: {target: true}},
            {stage: "Stage1", levels: [{name: "Level 5"}]},
          ]
        }
      ],
      hidden: true,
      wrapup_video: nil,
      login_required: false,
      hideable_stages: false,
      student_detail_progress_view: false,
      professional_learning_course: nil,
      peer_reviews_to_complete: nil
    }

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end
end
