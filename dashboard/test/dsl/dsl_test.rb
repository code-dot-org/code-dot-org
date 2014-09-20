require 'test_helper'

class DslTest < ActiveSupport::TestCase

  test 'test Script DSL' do
    input_dsl = "
stage 'Stage1'
level 'Level 1'
level 'Level 2'
level 'Level 3'

stage 'Stage2'
level 'Level 4'
level 'Level 5'
"
    output, i18n = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    expected = [
      {:stage => 'Stage1', :levels =>
        [{:name => 'Level 1', :stage => 'Stage1'}, {:name => 'Level 2', :stage => 'Stage1'}, {:name => 'Level 3', :stage => 'Stage1'}]},
      {:stage => 'Stage2', :levels =>
        [{:name => 'Level 4', :stage => 'Stage2'}, {:name => 'Level 5', :stage => 'Stage2'}]}]

    i18n_expected = {'en'=>{'data'=>{'script'=>{'name'=>{'test'=>{
        'Stage1'=>'Stage1',
        'Stage2'=>'Stage2'
    }}}}}}
    assert_equal expected, output
    assert_equal i18n_expected, i18n
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
        questions: [{text: 'q1'}],
        answers: [
          {text: 'w1', correct: false},
          {text: 'w2', correct: false},
          {text: 'r1', correct: true},
          {text: 'w3', correct: false}
        ], title: 'title1', description: 'desc1'}}
    i18n_expected = {'en' => {'data' => {'multi' => {'name1' =>
      {'title1' => 'title1', 'desc1' => 'desc1', 'q1' => 'q1', 'w1' => 'w1', 'w2' => 'w2', 'r1' => 'r1', 'w3' => 'w3'}
    }}}}
    assert_equal expected, output
    assert_equal i18n_expected.to_yaml, i18n.to_yaml
  end

end
