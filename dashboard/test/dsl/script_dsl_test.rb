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
    hideable_lessons: false,
    student_detail_progress_view: false,
    peer_reviews_to_complete: nil,
    teacher_resources: [],
    lesson_extras_available: false,
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
    curriculum_umbrella: nil,
    tts: false,
    is_course: false
  }

  test 'test Script DSL' do
    input_dsl = <<-DSL.gsub(/^\s+/, '')
      lesson 'Lesson1'
      level 'Level 1'
      level 'Level 2'
      level 'Level 3'

      lesson 'Lesson2'
      level 'Level 4'
      level 'Level 5'
    DSL
    output, i18n = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: 'Lesson1',
              script_levels: [
                {levels: [{name: 'Level 1'}]},
                {levels: [{name: 'Level 2'}]},
                {levels: [{name: 'Level 3'}]}
              ]
            },
            {
              name: 'Lesson2',
              script_levels: [
                {levels: [{name: 'Level 4'}]},
                {levels: [{name: 'Level 5'}]}
              ]
            }
          ]
        ]
      }
    )

    i18n_expected = {
      'test' => {
        'lessons' => {
          'Lesson1' => {'name' => 'Lesson1'},
          'Lesson2' => {'name' => 'Lesson2'}
        },
        "lesson_groups" => {}
      }
    }
    assert_equal expected, output
    assert_equal i18n_expected, i18n
  end

  test 'test Script DSL with level variants' do
    input_dsl = "
lesson 'Lesson1'
level 'Level 1'
variants
level 'Level 2a'
level 'Level 2b', active: false
endvariants
level 'Level 3'
"
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "Lesson1",
              script_levels: [
                {levels: [{name: "Level 1"}]},
                {
                  levels: [{name: "Level 2a"}, {name: "Level 2b"}],
                  properties: {
                    variants: {"Level 2b" => {active: false}}
                  }
                },
                {levels: [{name: "Level 3"}]}
              ]
            }
          ]
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'test Script DSL with experiment-based swap' do
    input_dsl = "
lesson 'Lesson1'
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
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "Lesson1",
              script_levels: [
                {levels: [{name: "Level 1"}]},
                {
                  levels: [{name: "Level 2a"}, {name: "Level 2b"}],
                  properties: {
                    variants: {"Level 2b" => {active: false, experiments: ["experiment1"]}}
                  }
                },
                {
                  levels: [{name: "Level 3a"}, {name: "Level 3b"}],
                  properties: {
                    variants: {
                      "Level 3a" => {active: false},
                      "Level 3b" => {experiments: ["experiment2"]}
                    }
                  }
                },
                {
                  levels: [{name: "Level 4a"}, {name: "Level 4b"}],
                  properties: {
                    variants: {"Level 4b" => {active: false, experiments: ["experiment3", "experiment4"]}}
                  }
                },
              ]
            }
          ]
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
    lesson_group = create :lesson_group, key: "", script: script, user_facing: false
    lesson = create :lesson, name: 'Lesson 1', script: script, lesson_group: lesson_group
    script_level = create(
      :script_level,
      levels: [level, level2, level3],
      properties: {
        'variants': {
          'maze 2': {'active': false, 'experiments': ['testExperiment']},
          'maze 3': {'active': false, 'experiments': ['testExperiment2', 'testExperiment3']},
        }
      },
      lesson: lesson,
      script: script
    )
    script_text = ScriptDSL.serialize_to_string(script_level.script)
    expected = <<~SCRIPT
      lesson 'Lesson 1'
      variants
        level 'maze 1'
        level 'maze 2', experiments: ["testExperiment"]
        level 'maze 3', experiments: ["testExperiment2","testExperiment3"]
      endvariants

    SCRIPT
    assert_equal expected, script_text
  end

  test 'test Script DSL property lockable as property hash' do
    input_dsl = <<~DSL
      lesson 'Lesson1',
        lockable: true
      level 'Level 1'
      lesson 'Lesson2'
      level 'Level 2'
    DSL
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "Lesson1",
              lockable: true,
              script_levels: [
                {levels: [{name: "Level 1"}]},
              ]
            },
            {
              name: "Lesson2",
              script_levels: [
                {levels: [{name: "Level 2"}]},
              ]
            }
          ]
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'can set hideable_lessons' do
    input_dsl = <<~DSL
      hideable_lessons 'true'

      lesson 'Lesson1'
      level 'Level 1'
      lesson 'Lesson2'
      level 'Level 2'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal true, output[:hideable_lessons]
  end

  test 'can set student_detail_progress_view' do
    input_dsl = <<~DSL
      student_detail_progress_view 'true'

      lesson 'Lesson1'
      level 'Level 1'
      lesson 'Lesson2'
      level 'Level 2'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal true, output[:student_detail_progress_view]
  end

  test 'can set has_verified_resources' do
    input_dsl = <<~DSL
      has_verified_resources 'true'

      lesson 'Lesson1'
      level 'Level 1'
      lesson 'Lesson2'
      level 'Level 2'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal true, output[:has_verified_resources]
  end

  test 'can set has_lesson_plan' do
    input_dsl = <<~DSL
      has_lesson_plan 'true'

      lesson 'Lesson1'
      level 'Level 1'
      lesson 'Lesson2'
      level 'Level 2'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal true, output[:has_lesson_plan]
  end

  test 'can set tts' do
    input_dsl = <<~DSL
      tts 'true'

      lesson 'Lesson1'
      level 'Level 1'
      lesson 'Lesson2'
      level 'Level 2'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal true, output[:tts]
  end

  test 'can set teacher_resources' do
    input_dsl = <<~DSL
      teacher_resources [['curriculum', '/link/to/curriculum'], ['vocabulary', '/link/to/vocab']]

      lesson 'Lesson1'
      level 'Level 1'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal [['curriculum', '/link/to/curriculum'], ['vocabulary', '/link/to/vocab']], output[:teacher_resources]
  end

  test 'can set script_announcements' do
    input_dsl = <<~DSL
      script_announcements [{"notice": "NoticeHere", "details": "DetailsHere", "link": "/foo/bar", "type": "information"}]

      lesson 'Lesson1'
      level 'Level 1'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal [{"notice": "NoticeHere", "details": "DetailsHere", "link": "/foo/bar", "type": "information"}], output[:script_announcements]
  end

  test 'can set pilot_experiment' do
    input_dsl = <<~DSL
      pilot_experiment 'science-experiment'

      lesson 'Lesson1'
      level 'Level 1'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal 'science-experiment', output[:pilot_experiment]
  end

  test 'can set editor_experiment' do
    input_dsl = <<~DSL
      editor_experiment 'script-editors'

      lesson 'Lesson1'
      level 'Level 1'
    DSL
    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal 'script-editors', output[:editor_experiment]
  end

  test 'serialize editor_experiment' do
    script = create :script, editor_experiment: 'editors'
    script_text = ScriptDSL.serialize_to_string(script)
    expected = <<~SCRIPT
      hidden false
      editor_experiment 'editors'

    SCRIPT
    assert_equal expected, script_text
  end

  test 'Script DSL with level progressions' do
    input_dsl = <<~DSL
      lesson 'Lesson1'
      level 'Level 1'
      level 'Level 2', progression: 'Foo'
      level 'Level 3', progression: 'Foo'
    DSL
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "Lesson1",
              script_levels: [
                {levels: [{name: "Level 1"}]},
                {levels: [{name: "Level 2"}], properties: {progression: 'Foo'}},
                {levels: [{name: "Level 3"}], properties: {progression: 'Foo'}},
              ]
            }
          ]
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'test Script DSL with level variants and progressions' do
    input_dsl = "
lesson 'Lesson1'
level 'Level 1'
variants
level 'Level 2a', progression: 'Foo'
level 'Level 2b', active: false, progression: 'Foo'
endvariants
level 'Level 3'
"
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "Lesson1",
              script_levels: [
                {levels: [{name: "Level 1"}]},
                {
                  levels: [{name: "Level 2a"}, {name: "Level 2b"}],
                  properties: {
                    variants: {"Level 2b" => {active: false}},
                    progression: 'Foo'
                  }
                },
                {levels: [{name: "Level 3"}]}
              ]
            }
          ]
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'raises exception if two variants have different progressions' do
    input_dsl = "
lesson 'Lesson1'
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
    input_dsl = <<~DSL
      lesson 'Lesson1'
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
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "Lesson1",
              script_levels: [
                {levels: [{name: "Level 1"}]},
                {levels: [{name: "Level 2"}]},
                {levels: [{name: "Level 3"}], properties: {challenge: true}},
                {levels: [{name: "Level 4"}]},
                {
                  levels: [
                    {name: "Level 5"},
                    {name: "Level 5.1"},
                  ],
                  properties: {
                    variants: {"Level 5.1" => {active: false}},
                    challenge: true,
                  },
                }
              ]
            }
          ]
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'Script DSL with blank stage visible after date will set visible after to next wednesday at 8 am PST' do
    Timecop.freeze(Time.new(2020, 3, 27))

    input_dsl = <<~DSL
      lesson 'Lesson1', visible_after: ''
      level 'Level 1'
      level 'Level 2'
    DSL
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "Lesson1",
              visible_after: '2020-04-01 08:00:00 -0700',
              script_levels: [
                {levels: [{name: "Level 1"}]},
                {levels: [{name: "Level 2"}]},
              ]
            }
          ]
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
    Timecop.return
  end

  test 'Script DSL with stage visible after date' do
    input_dsl = <<~DSL
      lesson 'Lesson1', visible_after: '2020-04-01 10:00:00 -0700'
      level 'Level 1'
      level 'Level 2'
    DSL
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "Lesson1",
              visible_after: '2020-04-01 10:00:00 -0700',
              script_levels: [
                {levels: [{name: "Level 1"}]},
                {levels: [{name: "Level 2"}]},
              ]
            }
          ],
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize visible after for lesson' do
    level = create :maze, name: 'maze 1', level_num: 'custom'
    script = create :script, hidden: true
    lesson_group = create :lesson_group, key: "", script: script, user_facing: false
    lesson = create :lesson, name: 'Lesson 1', script: script, lesson_group: lesson_group, visible_after: '2020-04-01 08:00:00 -0800'
    script_level = create :script_level, levels: [level], lesson: lesson, script: script
    script_text = ScriptDSL.serialize_to_string(script_level.script)
    expected = <<~SCRIPT
      lesson 'Lesson 1', visible_after: '2020-04-01 08:00:00 -0800'
      level 'maze 1'

    SCRIPT
    assert_equal expected, script_text
  end

  test 'Script DSL for lesson with lesson group' do
    input_dsl = <<~DSL
      lesson_group 'required', display_name: 'Overview'
      lesson_group_description 'This is a description'
      lesson_group_question 'Question 1'
      lesson_group_question 'Question 2'
      lesson 'Lesson1'
      level 'Level 1'
      level 'Level 2'
    DSL
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: "required",
          display_name: "Overview",
          description: 'This is a description',
          big_questions: ['Question 1', 'Question 2'],
          lessons: [
            {
              name: "Lesson1",
              script_levels: [
                {levels: [{name: "Level 1"}]},
                {levels: [{name: "Level 2"}]},
              ]
            }
          ]
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize lesson_group for lesson' do
    level = create :maze, name: 'maze 1', level_num: 'custom'
    script = create :script, hidden: true
    lesson_group = create :lesson_group, key: 'content', script: script, properties: {display_name: "Content"}
    lesson = create :lesson, name: 'lesson 1', script: script, lesson_group: lesson_group
    script_level = create :script_level, levels: [level], lesson: lesson, script: script
    script_text = ScriptDSL.serialize_to_string(script_level.script)
    expected = <<~SCRIPT
      lesson_group 'content', display_name: 'Content'
      lesson 'lesson 1'
      level 'maze 1'

    SCRIPT
    assert_equal expected, script_text
  end

  test 'serialize script with lesson groups that have no lessons in them' do
    level = create :maze, name: 'maze 1', level_num: 'custom'
    script = create :script, hidden: true
    lesson_group = create :lesson_group, key: '', script: script, user_facing: false
    create :lesson_group, key: 'required', script: script
    create :lesson_group, key: 'practice', script: script
    lesson = create :lesson, name: 'lesson 1', script: script, lesson_group: lesson_group
    script_level = create :script_level, levels: [level], lesson: lesson, script: script
    script_text = ScriptDSL.serialize_to_string(script_level.script)
    expected = <<~SCRIPT
      lesson 'lesson 1'
      level 'maze 1'

    SCRIPT
    assert_equal expected, script_text
  end

  test 'serialize lesson groups in the correct order' do
    script = create :script, hidden: true

    level1 = create :maze, name: 'maze 1', level_num: 'custom'
    level2 = create :maze, name: 'maze 2', level_num: 'custom'

    # intentionally made in the opposite order of how we want them to show to test
    lesson_group2 = create :lesson_group, key: 'content2', script: script, position: 2, properties: {display_name: "Content2"}
    lesson_group1 = create :lesson_group, key: 'content1', script: script, position: 1, properties: {display_name: "Content1"}

    lesson1 = create :lesson, name: 'lesson 1', script: script, lesson_group: lesson_group1
    lesson2 = create :lesson, name: 'lesson 2', script: script, lesson_group: lesson_group2

    create :script_level, levels: [level1], lesson: lesson1, script: script
    script_level2 = create :script_level, levels: [level2], lesson: lesson2, script: script
    script_text = ScriptDSL.serialize_to_string(script_level2.script)
    expected = <<~SCRIPT
      lesson_group 'content1', display_name: 'Content1'
      lesson 'lesson 1'
      level 'maze 1'

      lesson_group 'content2', display_name: 'Content2'
      lesson 'lesson 2'
      level 'maze 2'

    SCRIPT
    assert_equal expected, script_text
  end

  test 'Script DSL with project_sharing' do
    input_dsl = 'project_sharing true'
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [],
        project_sharing: true
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize project_sharing' do
    script = create :script, project_sharing: true
    script_text = ScriptDSL.serialize_to_string(script)
    expected = <<~SCRIPT
      hidden false
      project_sharing true

    SCRIPT

    assert_equal expected, script_text
  end

  test 'Script DSL with curriculum_umbrella' do
    input_dsl = "curriculum_umbrella 'CSF'"
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [],
        curriculum_umbrella: 'CSF'
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize curriculum_umbrella' do
    script = create :script, curriculum_umbrella: 'CSP'
    script_text = ScriptDSL.serialize_to_string(script)
    expected = <<~SCRIPT
      hidden false
      curriculum_umbrella 'CSP'

    SCRIPT

    assert_equal expected, script_text
  end

  test 'Script DSL with new_name, family_name, version_year and is_stable' do
    input_dsl = <<~DSL
      new_name 'new name'
      family_name 'family name'
      version_year '3035'
      is_stable true
      lesson 'Lesson1'
      level 'Level 1'
      level 'Level 2'
    DSL
    expected = DEFAULT_PROPS.merge(
      {
        new_name: "new name",
        family_name: "family name",
        version_year: "3035",
        is_stable: true,
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "Lesson1",
              script_levels: [
                {levels: [{name: "Level 1"}]},
                {levels: [{name: "Level 2"}]},
              ]
            }
          ]
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize new_name, family_name, version_year, is_stable, tts, and is_course' do
    script = create :script,
      {
        new_name: 'new name',
        family_name: 'family name',
        version_year: '2001',
        is_stable: true,
        tts: true,
        is_course: true
      }
    script_text = ScriptDSL.serialize_to_string(script)
    expected = <<~SCRIPT
      hidden false
      new_name 'new name'
      family_name 'family name'
      version_year '2001'
      is_stable true
      tts true
      is_course true

    SCRIPT
    assert_equal expected, script_text
  end

  test 'serialize named_level' do
    level = create :maze, name: 'maze 1', level_num: 'custom'
    script = create :script, hidden: true
    lesson_group = create :lesson_group, key: "", script: script, user_facing: false
    lesson = create :lesson, name: 'Lesson 1', script: script, lesson_group: lesson_group
    script_level = create(
      :script_level,
      levels: [level],
      named_level: true,
      lesson: lesson,
      script: script
    )

    script_text = ScriptDSL.serialize_to_string(script_level.script)
    expected = <<~SCRIPT
      lesson 'Lesson 1'
      level 'maze 1', named: true

    SCRIPT
    assert_equal expected, script_text
  end

  test 'Script DSL with named: true' do
    input_dsl = <<~DSL
      lesson 'stage 1'
      level 'maze 1', named: true
    DSL
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "stage 1",
              script_levels: [{levels: [{name: "maze 1"}], named_level: true},]
            }
          ]
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'serialize assessment' do
    level = create :maze, name: 'maze 1', level_num: 'custom'
    script = create :script, hidden: true
    lesson_group = create :lesson_group, key: "", script: script, user_facing: false
    lesson = create :lesson, name: 'Lesson 1', script: script, lesson_group: lesson_group
    script_level = create(
      :script_level,
      levels: [level],
      assessment: true,
      lesson: lesson,
      script: script
    )

    script_text = ScriptDSL.serialize_to_string(script_level.script)
    expected = <<~SCRIPT
      lesson 'Lesson 1'
      level 'maze 1', assessment: true

    SCRIPT
    assert_equal expected, script_text
  end

  test 'Script DSL with assessment: true' do
    input_dsl = <<~DSL
      lesson 'stage 1'
      level 'maze 1', assessment: true
    DSL
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: nil,
          display_name: nil,
          lessons: [
            {
              name: "stage 1",
              script_levels: [
                {
                  levels: [{name: "maze 1"}],
                  assessment: true
                }
              ]
            }
          ]
        ]
      }
    )

    output, _ = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    assert_equal expected, output
  end

  test 'script DSL with single quotes' do
    input_dsl = <<~DSL
      lesson_group 'my_group', display_name: 'Display Name'
      lesson 'Bob\\'s stage'
      level 'Level 1', progression: 'Bob\\'s progression'
      level 'Level 2'
    DSL
    assert_includes(input_dsl, "Bob\\'s stage")
    assert_includes(input_dsl, "Bob\\'s progression")
    output, i18n = ScriptDSL.parse(input_dsl, 'test.script', 'test')
    expected = DEFAULT_PROPS.merge(
      {
        lesson_groups: [
          key: "my_group",
          display_name: "Display Name",
          big_questions: [],
          lessons: [
            {
              name: "Bob's stage",
              script_levels: [
                {levels: [{name: 'Level 1'}], properties: {progression: "Bob's progression"}},
                {levels: [{name: 'Level 2'}]},
              ]
            }
          ]
        ]
      }
    )

    i18n_expected = {
      'test' => {
        'lessons' => {
          "Bob's stage" => {'name' => "Bob's stage"}
        },
        "lesson_groups" => {
          "my_group" => {"display_name" => "Display Name"}
        }
      }
    }
    assert_equal expected, output
    assert_equal i18n_expected, i18n
  end

  test 'serialize lesson group and properties' do
    script = create :script, hidden: true
    lesson_group = create :lesson_group, key: 'content1', script: script, position: 1, properties: {display_name: "Content", description: 'This is a description', big_questions: ['Q1', 'Q2']}
    lesson1 = create :lesson, name: 'lesson 1', script: script, lesson_group: lesson_group, absolute_position: 1
    level1 = create :maze, name: 'maze 1', level_num: 'custom'
    create :script_level, levels: [level1], lesson: lesson1, script: script

    script_text = ScriptDSL.serialize_to_string(script)
    expected = <<~SCRIPT
      lesson_group 'content1', display_name: 'Content'
      lesson_group_description 'This is a description'
      lesson_group_question 'Q1'
      lesson_group_question 'Q2'
      lesson 'lesson 1'
      level 'maze 1'

    SCRIPT
    assert_equal expected, script_text
  end

  test 'serialize lessons in lesson groups in the correct order' do
    script = create :script, hidden: true

    level1 = create :maze, name: 'maze 1', level_num: 'custom'
    level2 = create :maze, name: 'maze 2', level_num: 'custom'

    lesson_group = create :lesson_group, key: 'content1', script: script, position: 1, properties: {display_name: "Content"}

    # intentionally made in the opposite order of how we want them to show to test
    lesson2 = create :lesson, name: 'lesson 2', script: script, lesson_group: lesson_group, absolute_position: 2
    lesson1 = create :lesson, name: 'lesson 1', script: script, lesson_group: lesson_group, absolute_position: 1

    create :script_level, levels: [level1], lesson: lesson1, script: script
    script_level2 = create :script_level, levels: [level2], lesson: lesson2, script: script
    script_text = ScriptDSL.serialize_to_string(script_level2.script)
    expected = <<~SCRIPT
      lesson_group 'content1', display_name: 'Content'
      lesson 'lesson 1'
      level 'maze 1'

      lesson 'lesson 2'
      level 'maze 2'

    SCRIPT
    assert_equal expected, script_text
  end
end
