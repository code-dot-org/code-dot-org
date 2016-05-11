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
        trophies: false,
        wrapup_video: nil,
        login_required: false,
        admin_required: false,
        student_of_admin_required: false,
        professional_learning_course: nil,
        pd: false
    }

    i18n_expected = {'en'=>{'data'=>{'script'=>{'name'=>{'test'=>{
        'Stage1'=>'Stage1',
        'Stage2'=>'Stage2'
    }}}}}}
    assert_equal expected, output
    assert_equal i18n_expected, i18n
  end

  test 'test Script DSL admin_required as boolean' do
    input_dsl = <<-DSL.gsub(/^\s+/, '')
      admin_required true
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')

    expected = {
        id: nil,
        stages: [],
        hidden: true,
        trophies: false,
        wrapup_video: nil,
        login_required: false,
        admin_required: true,
        student_of_admin_required: false,
        professional_learning_course: nil,
        pd: false
    }

    assert_equal expected, output
  end

  test 'test Script DSL admin_required as string' do
    input_dsl = <<-DSL.gsub(/^\s+/, '')
      admin_required 'true'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')

    expected = {
        id: nil,
        stages: [],
        hidden: true,
        trophies: false,
        wrapup_video: nil,
        login_required: false,
        admin_required: true,
        student_of_admin_required: false,
        professional_learning_course: nil,
        pd: false
    }

    assert_equal expected, output
  end

  test 'test Script DSL student_of_admin_required as boolean' do
    input_dsl = <<-DSL.gsub(/^\s+/, '')
      student_of_admin_required true
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')

    expected = {
        id: nil,
        stages: [],
        hidden: true,
        trophies: false,
        wrapup_video: nil,
        login_required: false,
        admin_required: false,
        student_of_admin_required: true,
        professional_learning_course: nil,
        pd: false
    }

    assert_equal expected, output
  end

  test 'test Script DSL student_of_admin_required as string' do
    input_dsl = <<-DSL.gsub(/^\s+/, '')
      student_of_admin_required 'true'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')

    expected = {
        id: nil,
        stages: [],
        hidden: true,
        trophies: false,
        wrapup_video: nil,
        login_required: false,
        admin_required: false,
        student_of_admin_required: true,
        professional_learning_course: nil,
        pd: false
    }

    assert_equal expected, output
  end

  test 'test Script DSL with level variants' do
    input_dsl = "
stage 'Stage1'
level 'Level 1'
variants
level 'Level 2a'
active false
level 'Level 2b'
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
            {stage: "Stage1", levels: [{name: "Level 2a"}, {name: "Level 2b"}],
              properties: {"Level 2b"=>{active: false}}
            },
            {stage: "Stage1", levels: [{name: "Level 3"}]}
          ]
        }
      ],
      hidden: true,
      trophies: false,
      wrapup_video: nil,
      login_required: false,
      admin_required: false,
      pd: false,
      student_of_admin_required: false,
      professional_learning_course: nil
    }

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'test Script DSL with selectable level variants' do
    input_dsl = "
stage 'Stage1'
level 'Level 1'
variants
  prompt 'Which level would you like to try?'

  buttontext 'Challenge'
  imageurl 'https://studio.code.org/blah/maze-2-challenge.png'
  description 'This is a hard level'
  level 'Level 2a'

  buttontext 'Super Challenge'
  imageurl 'https://studio.code.org/blah/maze-2-super.png'
  description 'This is a very hard level'
  level 'Level 2b'
endvariants
level 'Level 3'
"
    expected = {
      id: nil,
      stages: [
        {
          stage: 'Stage1',
          scriptlevels: [
            {stage: 'Stage1', levels: [{name: 'Level 1'}]},
            {
              stage: 'Stage1',
              levels: [{name: 'Level 2a'}, {name: 'Level 2b'}],
              properties: {
                prompt: 'Which level would you like to try?',
                'Level 2a' => {
                  buttontext: 'Challenge',
                  imageurl: 'https://studio.code.org/blah/maze-2-challenge.png',
                  description: 'This is a hard level'
                },
                'Level 2b' => {
                  buttontext: 'Super Challenge',
                  imageurl: 'https://studio.code.org/blah/maze-2-super.png',
                  description: 'This is a very hard level'
                }
              }
            },
            {stage: 'Stage1', levels: [{name: 'Level 3'}]}
          ]
        }
      ],
      hidden: true,
      trophies: false,
      wrapup_video: nil,
      login_required: false,
      admin_required: false,
      pd: false,
      student_of_admin_required: false,
      professional_learning_course: nil
    }

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'test Script DSL with selectable level variants and some missing options' do
    input_dsl = "
stage 'Stage1'
level 'Level 1'
variants
  prompt 'Which level would you like to try?'

  buttontext 'Challenge'
  imageurl 'https://studio.code.org/blah/maze-2-challenge.png'
  level 'Level 2a'

  buttontext 'Super Challenge'
  description 'This is a very hard level'
  level 'Level 2b'
endvariants
level 'Level 3'
"
    expected = {
      id: nil,
      stages: [
        {
          stage: 'Stage1',
          scriptlevels: [
            {stage: 'Stage1', levels: [{name: 'Level 1'}]},
            {
              stage: 'Stage1',
              levels: [{name: 'Level 2a'}, {name: 'Level 2b'}],
              properties: {
                prompt: 'Which level would you like to try?',
                'Level 2a' => {
                  buttontext: 'Challenge',
                  imageurl: 'https://studio.code.org/blah/maze-2-challenge.png'
                },
                'Level 2b' => {
                  buttontext: 'Super Challenge',
                  description: 'This is a very hard level'
                }
              }
            },
            {stage: 'Stage1', levels: [{name: 'Level 3'}]}
          ]
        }
      ],
      hidden: true,
      trophies: false,
      wrapup_video: nil,
      login_required: false,
      admin_required: false,
      pd: false,
      student_of_admin_required: false,
      professional_learning_course: nil
    }

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'test Script DSL raises for dangling properties' do
    input_dsl = "
stage 'Stage1'
variants
  level 'Level 2b'
  buttontext 'hi'
endvariants
"
    assert_raises_matching /Unused property "hi"/ do
      ScriptDSL.parse(input_dsl, 'test.script', 'test')
    end
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
    expected =
      {name: 'name1', properties: {
        options: {},
        questions: [{text: 'q1'}],
        answers: [
          {text: 'w1', correct: false},
          {text: 'w2', correct: false},
          {text: 'r1', correct: true},
          {text: 'w3', correct: false}
        ],
        title: 'title1',
        content1: 'desc1'}}
    i18n_expected = {'en' => {'data' => {'multi' => {'name1' =>
      {'title1' => 'title1', 'desc1' => 'desc1', 'q1' => 'q1', 'w1' => 'w1', 'w2' => 'w2', 'r1' => 'r1', 'w3' => 'w3'}
    }}}}
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

end
