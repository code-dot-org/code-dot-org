require 'test_helper'

class LevelDslTest < ActiveSupport::TestCase
  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  def setup
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
  end

  test 'test Multi DSL' do
    input_dsl = <<~DSL
      name 'name1'
      title 'title1'
      description 'desc1'
      editor_experiment 'my-editors'
      question 'q1'
      wrong 'w1'
      wrong 'w2'
      right 'r1'
      wrong 'w3'
    DSL

    output, i18n = MultiDSL.parse(input_dsl, 'test')
    expected = {
      name: 'name1', properties: {
        editor_experiment: 'my-editors',
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
      'answers' => [
        {'text' => 'w1', 'correct' => false},
        {'text' => 'w2', 'correct' => false},
        {'text' => 'r1', 'correct' => true},
        {'text' => 'w3', 'correct' => false}
      ],
      'content1' => 'desc1',
      'questions' => [{'text' => 'q1'}],
      'title' => 'title1',
    }
    assert_equal expected, output
    assert_equal i18n_expected.to_yaml, i18n.to_yaml
  end

  test 'test empty i18n' do
    # Ensure nil entries are filtered from i18n files
    input_dsl = <<~DSL
      name 'name1'
      title nil
    DSL
    _, i18n = MultiDSL.parse(input_dsl, 'test')
    i18n_expected = {}
    assert_equal i18n_expected, i18n
  end

  test 'test Evaluation Question' do
    script = create :script
    lesson1 = create(:lesson, name: 'Lesson1', script: script)
    lesson2 = create(:lesson, name: 'Lesson2', script: script)
    input_dsl = <<~DSL
      name 'Test question'
      display_name 'Test override question'
      question 'Question text'
      answer 'answer 1'
      answer 'answer 2', weight: 2, stage_name: '#{lesson1.name}'
      answer 'answer 3', stage_name: '#{lesson2.name}'
    DSL

    output, _ = EvaluationMulti.parse(input_dsl, 'test')
    expected = {
      name: 'Test question',
      properties: {
        editor_experiment: nil,
        display_name: 'Test override question',
        options: {},
        questions: [{text: 'Question text'}],
        answers: [
          {text: 'answer 1', weight: 1, stage: nil},
          {text: 'answer 2', weight: 2, stage: lesson1.name},
          {text: 'answer 3', weight: 1, stage: lesson2.name},
        ]
      }
    }
    assert_equal expected, output
  end

  test 'remove property' do
    # mock file so we don't actually write a file, 2x for each "create_from_level_builder"
    input_dsl = <<~DSL
      name 'my_multi'
      title 'g(y) = y + 2'
      question 'What is the name of this function?'
      content1 'content1'
      right 'g'
      wrong 'y'
      wrong '2'
    DSL
    input_dsl_without_content = <<~DSL
      name 'my_multi'
      title 'g(y) = y + 2'
      question 'What is the name of this function?'
      right 'g'
      wrong 'y'
      wrong '2'
    DSL
    level = Multi.create_from_level_builder({}, {name: 'my_multi', dsl_text: input_dsl})

    level_modified = Multi.create_from_level_builder({}, {name: 'my_multi', dsl_text: input_dsl_without_content})

    assert_equal 'content1', level.properties['content1']
    assert_nil level_modified.properties['content1']
  end

  test 'name should not be modifiable' do
    level = External.create_from_level_builder({}, {dsl_text: "name 'test external'\ntitle 'test'"})
    assert_raises RuntimeError do
      level.update(dsl_text: "name 'new test name'\ntitle 'abc'")
    end
    assert_equal 'test external', level.name
    assert_equal 'test', level.properties['title']
    assert_nil Level.find_by_name('new test name')
  end

  test 'should set serialized_attributes' do
    level = External.create_from_level_builder({}, {dsl_text: "name 'test external 2'"})
    level.update(dsl_text: "name 'test external 2'\ntitle 'abc'", video_key: 'zzz')
    level.reload
    assert_equal 'zzz', level.video_key
    assert_equal 'abc', level.properties['title']
    assert_nil level.properties['name']
  end

  test 'should encrypt when saving in levelbuilder and decrypt when parsing from file' do
    # don't actually write a file, but check that we are writing the encrypted version
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).once.with do |pathname, contents|
      if pathname.basename.to_s == 'test_external_3.external'
        # make sure we're encrypting the .external file
        contents =~ /^encrypted/
      else
        # second write is the i18n strings .yml file, don't bother checking it
        true
      end
    end

    # first, create it in levelbuilder
    dsl_text = <<~DSL
      name 'test external 3'
      markdown 'regular old markdown'
      teacher_markdown 'visible to teachers only'
    DSL
    level = External.create_from_level_builder({}, {encrypted: '1', dsl_text: dsl_text})
    assert level.properties['encrypted']
    assert level.encrypted
    assert_equal 'visible to teachers only', level.properties['teacher_markdown']

    encrypted_dsl_text = level.encrypted_dsl_text(dsl_text)

    # remove the existing level so we can try to create it from the encrypted text (instead of updating)
    level.destroy

    # check parsed data
    new_level_data, _ = External.parse(encrypted_dsl_text, 'text_external_3.external', 'test external 3')
    assert new_level_data[:properties]['encrypted']
    assert_equal 'visible to teachers only', new_level_data[:properties][:teacher_markdown]

    # check created level
    new_level = External.setup(new_level_data)
    assert new_level.properties['encrypted']
    assert_equal 'visible to teachers only', new_level.properties['teacher_markdown']
    assert new_level.encrypted
  end

  test 'editor_experiment set on new markdown level' do
    old_dsl_text = <<~DSL
      name 'new_partner_markdown'
      title 'title'
      description 'description here'
    DSL

    expected_new_dsl_text = <<~DSL
      name 'new_partner_markdown'
      editor_experiment 'platformization-partners'
      title 'title'
      description 'description here'
    DSL

    Rails.application.config.stubs(:levelbuilder_mode).returns(true)
    File.expects(:write).once.with do |_pathname, new_dsl_text|
      new_dsl_text == expected_new_dsl_text
    end

    level_params = {
      dsl_text: old_dsl_text,
      editor_experiment: 'platformization-partners'
    }
    level = External.create_from_level_builder({}, level_params)
    assert_equal level.editor_experiment, 'platformization-partners'
  end

  test 'cloned dsl level drops old version suffix' do
    old_dsl_text = <<~DSL
      name 'markdown level_2017_2018_2019'
      title 'title here'
      description 'description here'
    DSL
    old_level = External.create_from_level_builder({}, {dsl_text: old_dsl_text})
    old_level.stubs(:dsl_text).returns(old_dsl_text)
    assert_equal 'markdown level_2017_2018_2019', old_level.name

    new_level = old_level.clone_with_suffix('_2020')
    assert_equal 'markdown level_2020', new_level.name
  end
end
