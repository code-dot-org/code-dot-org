require 'test_helper'

# Define this here to ensure that we don't incorrectly use the :pegasus version.
def slog(h)
  CDO.slog ({ application: :dashboard }).merge(h)
end

class ApiControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @teacher = create(:teacher)
    sign_in @teacher

    @section = create(:section, user: @teacher, login_type: 'word')
    @student_1 = create(:follower, section: @section).student_user
    @student_2 = create(:follower, section: @section).student_user
    @student_3 = create(:follower, section: @section).student_user
    @student_4 = create(:follower, section: @section).student_user
    @student_5 = create(:follower, section: @section).student_user

    @flappy_section = create(:section, user: @teacher, script_id: Script.get_from_cache(Script::FLAPPY_NAME).id)
    @student_flappy_1 = create(:follower, section: @flappy_section).student_user
    @student_flappy_1.backfill_user_scripts
    @student_flappy_1.reload
  end

  def make_progress_in_section(script)
    text_response_script_levels = script.script_levels.includes(:level).where('levels.type' => TextMatch)

    level = text_response_script_levels.first.level
    UserLevel.create(level_id: level.id, user_id: @student_1.id, script_id: script.id)
  end

  test "should get text_responses for section with default script" do
    get :section_text_responses, section_id: @section.id
    assert_response :success

    assert_equal Script.twenty_hour_script, assigns(:script)
  end

  test "should get text_responses for section with section script" do
    get :section_text_responses, section_id: @flappy_section.id
    assert_response :success

    assert_equal Script.get_from_cache(Script::FLAPPY_NAME), assigns(:script)
  end

  test "should get text_responses for section with specific script" do
    script = Script.find_by_name('algebra')

    get :section_text_responses, section_id: @section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)
  end

  test "should get assessments for section with default script" do
    get :section_assessments, section_id: @section.id
    assert_response :success

    assert_equal Script.twenty_hour_script, assigns(:script)
  end

  test "should get assessments for section with section script" do
    get :section_assessments, section_id: @flappy_section.id
    assert_response :success

    assert_equal Script.get_from_cache(Script::FLAPPY_NAME), assigns(:script)
  end

  test "should get assessments for section with specific script" do
    script = Script.find_by_name('algebra')

    get :section_assessments, section_id: @section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)
  end

  test "should get text_responses for section with script with text response" do
    script = create :script

    # create 2 text_match levels
    level1 = create :text_match
    level1.properties['title'] = 'Text Match 1'
    level1.save!
    create :script_level, script: script, levels: [level1]

    level2 = create :text_match
    level2.properties['title'] = 'Text Match 2'
    level2.save!
    create :script_level, script: script, levels: [level2]
    # create some other random levels
    5.times do
      create :script_level, script: script
    end

    # student_1 has two answers
    create(:activity, user: @student_1, level: level1,
      level_source: create(:level_source, level: level1, data: 'Here is the answer'))
    create(:activity, user: @student_1, level: level2,
      level_source: create(:level_source, level: level2, data: 'another answer'))

    # student_2 has one answer
    create(:activity, user: @student_2, level: level1,
      level_source: create(:level_source, level: level1, data: 'answer for student 2'))

    get :section_text_responses, section_id: @section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)

    # all these are translation missing because we don't actually generate i18n files in tests

    expected_response =
      [
       {'student' => {'id' => @student_1.id, 'name' => @student_1.name},
        'stage' => "Stage 1: translation missing: en-us.data.script.name.#{script.name}.#{script.stages[0].name}",
        'puzzle' => 1,
        'question' => 'Text Match 1',
        'response' => 'Here is the answer',
        'url' => "http://test.host/s/#{script.name}/stage/1/puzzle/1?section_id=#{@section.id}&user_id=#{@student_1.id}"},
       {'student' => {'id' => @student_1.id, 'name' => @student_1.name},
        'stage' => "Stage 2: translation missing: en-us.data.script.name.#{script.name}.#{script.stages[1].name}",
        'puzzle' => 1,
        'question' => 'Text Match 2',
        'response' => 'another answer',
        'url' => "http://test.host/s/#{script.name}/stage/2/puzzle/1?section_id=#{@section.id}&user_id=#{@student_1.id}"},
       {'student' => {'id' => @student_2.id, 'name' => @student_2.name},
        'stage' => "Stage 1: translation missing: en-us.data.script.name.#{script.name}.#{script.stages[0].name}",
        'puzzle' => 1,
        'question' => 'Text Match 1',
        'response' => 'answer for student 2',
        'url' => "http://test.host/s/#{script.name}/stage/1/puzzle/1?section_id=#{@section.id}&user_id=#{@student_2.id}"},
      ]
    assert_equal expected_response, JSON.parse(@response.body)
  end

  test "should get assessments for section with script with level_group assessment" do
    script = create :script

    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    # create 2 level_group levels
    level1 = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level1.properties['title'] =  'Long assessment 1'
    level1.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}, {levels: ['level_multi_unattempted']}]
    level1.save!
    create :script_level, script: script, levels: [level1], assessment: true

    # student_1 has an assessment
    create(
      :activity,
      user: @student_1,
      level: level1,
      level_source: create(
        :level_source,
        level: level1,
        data: %Q({"#{sub_level1.id}":{"result":"This is a free response"},"#{sub_level2.id}":{"result":"0"},"#{sub_level3.id}":{"result":"1"},"#{sub_level4.id}":{"result":"-1"}})
      )
    )

    updated_at = Time.now

    create :user_level, user: @student_1, best_result: 100, script: script, level: level1, submitted: true, updated_at: updated_at

    get :section_assessments, section_id: @section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)

    # all these are translation missing because we don't actually generate i18n files in tests

    expected_response =
      [
       {"student" => {"id" => @student_1.id, "name" => @student_1.name},
        "stage" => "translation missing: en-us.data.script.name.#{script.name}.title",
        "puzzle" => 1,
        "question" => "Long assessment 1",
        "url" => "http://test.host/s/#{script.name}/stage/1/puzzle/1?section_id=#{@section.id}&user_id=#{@student_1.id}",
        "multi_correct" => 1,
        "multi_count" => 4,
        "submitted" => true,
        "timestamp" => updated_at.utc.to_s,
        "level_results" => [
          {"student_result" => "This is a free response", "correct" => "free_response"},
          {"student_result" => "A", "correct" => "correct"},
          {"student_result" => "B", "correct" => "incorrect"},
          {"student_result" => "", "correct" => "unsubmitted"},
          {"correct" => "unsubmitted"}]
        }
      ]
    assert_equal expected_response, JSON.parse(@response.body)
  end

  test "should get surveys for section with script with anonymous level_group assessment" do
    script = create :script

    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level1 = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level1.properties['title'] =  'Long assessment 1'
    level1.properties['anonymous'] = 'true'
    level1.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}, {levels: ['level_multi_unattempted']}]
    level1.save!
    create :script_level, script: script, levels: [level1], assessment: true

    # student_1 did the survey
    create(
      :activity,
      user: @student_1,
      level: level1,
      level_source: create(
        :level_source,
        level: level1,
        data: %Q({"#{sub_level1.id}":{"result":"This is a free response"},"#{sub_level2.id}":{"result":"0"},"#{sub_level3.id}":{"result":"1"},"#{sub_level4.id}":{"result":"-1"}})
      )
    )

    # student_2 also did the survey
    create(
      :activity,
      user: @student_2,
      level: level1,
      level_source: create(
        :level_source,
        level: level1,
        data: %Q({"#{sub_level1.id}":{"result":"This is a different free response"},"#{sub_level2.id}":{"result":"-1"},"#{sub_level3.id}":{"result":"2"},"#{sub_level4.id}":{"result":"3"}})
      )
    )

    # student_3 through student_5 also did the survey, just submitting a free response.
    [@student_3, @student_4, @student_5].each_with_index do |student, student_index|
      create(
        :activity,
        user: student,
        level: level1,
        level_source: create(
          :level_source,
          level: level1,
          data: %Q({"#{sub_level1.id}":{"result":"Free response from student #{student_index+3}"},"#{sub_level2.id}":{"result":"-1"},"#{sub_level3.id}":{"result":"-1"},"#{sub_level4.id}":{"result":"-1"}})
        )
      )
    end

    updated_at = Time.now

    [@student_1, @student_2, @student_3, @student_4, @student_5].each do |student|
      create :user_level, user: student, best_result: 100, script: script, level: level1, submitted: true, updated_at: updated_at
    end

    # Seed the RNG with the same thing so we get the same "random" shuffling of results.
    srand 1

    get :section_surveys, section_id: @section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)

    # all these are translation missing because we don't actually generate i18n files in tests
    expected_response = [
      {"stage"=>"translation missing: en-us.data.script.name.#{script.name}.title",
        "puzzle"=>1,
        "url"=>"http://test.host/s/#{script.name}/stage/1/puzzle/1?section_id=#{@section.id}",
        "levelgroup_results"=>{
          "0"=>{"question"=>"test", "results"=>[
            {"result"=>"Free response from student 3", "type"=>"free_response"},
            {"result"=>"This is a different free response", "type"=>"free_response"},
            {"result"=>"Free response from student 5", "type"=>"free_response"},
            {"result"=>"This is a free response", "type"=>"free_response"},
            {"result"=>"Free response from student 4", "type"=>"free_response"}]},
          "1"=>{"question"=>"text2", "results"=>[
            {"result_text"=>"text1", "result"=>"A", "type"=>"multi"},
            {}, {}, {}, {}]},
          "2"=>{"question"=>"text2", "results"=>[
            {},
            {},
            {"result_text"=>nil, "result"=>"C", "type"=>"multi"},
            {},
            {"result_text"=>nil, "result"=>"B", "type"=>"multi"}]},
          "3"=>{"question"=>"text2", "results"=>[
            {}, {},
            {"result_text"=>nil, "result"=>"D", "type"=>"multi"},
            {}, {}]},
          "4"=>{"question"=>"text2", "results"=>[
            {},
            {}, {}, {}, {}]},
        }
      }
    ]
    assert_equal expected_response, JSON.parse(@response.body)
  end

  test "no anonymous survey data via assessment call" do
    script = create :script

    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level1 = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level1.properties['title'] =  'Long assessment 1'
    level1.properties['anonymous'] = 'true'
    level1.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}, {levels: ['level_multi_unattempted']}]
    level1.save!
    create :script_level, script: script, levels: [level1], assessment: true

    # student_1 through student_5 also did the survey, just submitting a free response.
    [@student_1, @student_2, @student_3, @student_4, @student_5].each_with_index do |student, student_index|
      create(
        :activity,
        user: student,
        level: level1,
        level_source: create(
          :level_source,
          level: level1,
          data: %Q({"#{sub_level1.id}":{"result":"Free response from student #{student_index+3}"},"#{sub_level2.id}":{"result":"-1"},"#{sub_level3.id}":{"result":"-1"},"#{sub_level4.id}":{"result":"-1"}})
        )
      )
    end

    updated_at = Time.now

    [@student_1, @student_2, @student_3, @student_4, @student_5].each do |student|
      create :user_level, user: student, best_result: 100, script: script, level: level1, submitted: true, updated_at: updated_at
    end

    # We can retrieve this with the survey API.
    get :section_surveys, section_id: @section.id, script_id: script.id
    assert_response :success
    assert_equal 1, JSON.parse(@response.body).length

    # But importantly, we get an empty result with the assessment API.
    get :section_assessments, section_id: @section.id, script_id: script.id
    assert_response :success
    assert_equal [], JSON.parse(@response.body)
  end

  test "no anonymous survey data when less than five students" do
    script = create :script

    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level1 = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level1.properties['title'] =  'Long assessment 1'
    level1.properties['anonymous'] = 'true'
    level1.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}, {levels: ['level_multi_unattempted']}]
    level1.save!
    create :script_level, script: script, levels: [level1], assessment: true

    # student_1 through student_5 also did the survey, just submitting a free response.
    [@student_1, @student_2, @student_3, @student_4].each_with_index do |student, student_index|
      create(
        :activity,
        user: student,
        level: level1,
        level_source: create(
          :level_source,
          level: level1,
          data: %Q({"#{sub_level1.id}":{"result":"Free response from student #{student_index+3}"},"#{sub_level2.id}":{"result":"-1"},"#{sub_level3.id}":{"result":"-1"},"#{sub_level4.id}":{"result":"-1"}})
        )
      )
    end

    updated_at = Time.now

    [@student_1, @student_2, @student_3, @student_4].each do |student|
      create :user_level, user: student, best_result: 100, script: script, level: level1, submitted: true, updated_at: updated_at
    end

    # We can retrieve this with the survey API, but it will be empty.
    get :section_surveys, section_id: @section.id, script_id: script.id
    assert_response :success
    assert_equal 0, JSON.parse(@response.body).length
  end

  test "should get text_responses for section with script without text response" do
    script = Script.find_by_name('course1')

    get :section_text_responses, section_id: @section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)
  end

  test "should get assessments for section with script without assessment" do
    script = Script.find_by_name('course1')

    get :section_assessments, section_id: @section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)
  end

  test "should get user progress" do
    script = Script.twenty_hour_script

    user = create :user, total_lines: 2
    create :user_level, user: user, best_result: 100, script: script, level: script.script_levels[1].level
    sign_in user

    # Test user progress.
    get :user_progress, script_name: script.name
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal 2, body['linesOfCode']
    script_level = script.script_levels[1]
    level_id = script_level.level.id
    assert_equal 'perfect', body['levels'][level_id.to_s]['status']
    assert_equal 100, body['levels'][level_id.to_s]['result']

    # Test user_progress_for_all_scripts.
    get :user_progress_for_all_scripts
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 2, body['linesOfCode']
    assert_equal 1, body['scripts'].size
    assert_equal 'perfect', body['scripts'][script.name]['levels'][level_id.to_s]['status']
  end

  test "should get user progress for stage" do
    slogger = FakeSlogger.new
    CDO.set_slogger_for_test(slogger)
    script = Script.hoc_2014_script

    user = create :user, total_lines: 2
    sign_in user

    script_level = script.script_levels[0]
    level = script_level.level
    create :user_level, user: user, best_result: 100, script: script, level: level

    create(:activity, user: user, level: level,
           level_source: create(:level_source, level: level, data: 'level source'))

    get :user_progress_for_stage, script_name: script.name, stage_position: 1, level_position: 1
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal false, body['disableSocialShare']
    assert_equal false, body['disablePostMilestone']
    assert_equal 100, body['progress'][level.id.to_s]
    assert_equal 'level source', body['lastAttempt']['source']

    assert_equal(
      [{
        application: :dashboard,
        tag: 'activity_start',
        script_level_id: script_level.id,
        level_id: level.id,
        user_agent: 'Rails Testing',
        locale: :'en-us'
      }],
      slogger.records
    )
  end

  test "should get user progress for stage for signed-out user" do
    slogger = FakeSlogger.new
    CDO.set_slogger_for_test(slogger)
    script = Script.hoc_2014_script
    script_level = script.script_levels[0]
    level = script_level.level

    user = create :user
    sign_out user

    get :user_progress_for_stage, script_name: script.name, stage_position: 1, level_position: 1
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal({}, body)
    assert_equal(
      [{
        application: :dashboard,
        tag: 'activity_start',
        script_level_id: script_level.id,
        level_id: level.id,
        user_agent: 'Rails Testing',
        locale: :'en-us'
      }],
      slogger.records
    )
  end

  test "should get user progress for stage with young student" do
    script = Script.twenty_hour_script
    young_student = create :young_student
    sign_in young_student

    get :user_progress_for_stage, script_name: script.name, stage_position: 1, level_position: 1
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal true, body['disableSocialShare']
    assert_equal false, body['disablePostMilestone']
    assert_equal({}, body['progress'])
  end

  test "should get user progress for disabled milestone posts" do
    Gatekeeper.set('postMilestone', value: false)
    script = Script.course1_script
    user = create :user, total_lines: 2
    sign_in user

    get :user_progress_for_stage, script_name: script.name, stage_position: 1, level_position: 1
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal true, body['disablePostMilestone']
  end

  test "should get user progress for stage with swapped level" do
    sign_in @student_1
    script = create :script
    stage = create :stage, script: script
    level1a = create :maze, name: 'maze 1'
    level1b = create :maze, name: 'maze 1 new'
    create :script_level, script: script, stage: stage, levels: [level1a, level1b], properties: "{'maze 1': {active: false}}"
    create(
      :activity,
      user: @student_1,
      level: level1a,
      level_source: create(
        :level_source,
        level: level1a,
        data: 'level source'
      )
    )

    get :user_progress_for_stage, script_name: script.name, stage_position: 1, level_position: 1, level: level1a.id
    body = JSON.parse(response.body)
    assert_equal('level source', body['lastAttempt']['source'])
  end

  test "should get progress for section with section script" do
    get :section_progress, section_id: @flappy_section.id
    assert_response :success

    assert_equal Script.get_from_cache(Script::FLAPPY_NAME), assigns(:script)
  end

  test "should get progress for section with specific script" do
    script = Script.find_by_name('algebra')

    get :section_progress, section_id: @section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)
  end

  test "should get progress for section with section script when blank script is specified" do
    get :section_progress, section_id: @flappy_section.id, script_id: ''
    assert_response :success

    assert_equal Script.get_from_cache(Script::FLAPPY_NAME), assigns(:script)
  end

  test "should get progress for student" do
    get :student_progress, student_id: @student_1.id, section_id: @section.id
    assert_response :success

    assert_equal Script.twenty_hour_script, assigns(:script)
  end

  test "should get progress for student in section" do
    get :student_progress, student_id: @student_1.id, section_id: @section.id
    assert_response :success

    assert_equal Script.twenty_hour_script, assigns(:script)
  end

  test "should get progress for student in section with section script" do
    get :student_progress, student_id: @student_flappy_1.id, section_id: @flappy_section.id
    assert_response :success

    assert_equal Script.get_from_cache(Script::FLAPPY_NAME), assigns(:script)
  end

  test "should get progress for student in section with specified script" do
    script = Script.find_by_name('algebra')
    get :student_progress, student_id: @student_flappy_1.id, section_id: @flappy_section.id, script_id: script.id
    assert_response :success

    assert_equal script, assigns(:script)
  end

  test "should get user_hero for teacher" do
    sign_in @teacher
    get :user_hero

    assert_select '#welcome.teacher'
    assert_select '.teacherdashboard'
  end

  test "should get user_hero for student with script" do
    user_script = create(:user_script, script: Script.get_from_cache(Script::FLAPPY_NAME))
    sign_in user_script.user

    get :user_hero

    assert_select '#welcome.student'
    assert_select '#currentprogress', true, "Response was: #{@response.body}"
  end

  test "should get user_hero for student with no script" do
    sign_in @student_1
    get :user_hero

    assert_select '#welcome.student'
    assert_select '#suggestcourse', I18n.t('home.no_primary_course')
  end

  test "should get user_hero for student who completed all scripts" do
    student = create :student
    sign_in student
    advertised_scripts = [
      Script.hoc_2014_script, Script.frozen_script, Script.infinity_script,
      Script.flappy_script, Script.playlab_script, Script.artist_script,
      Script.course1_script, Script.course2_script, Script.course3_script,
      Script.course4_script, Script.twenty_hour_script, Script.starwars_script,
      Script.starwars_blocks_script, Script.minecraft_script
    ]
    advertised_scripts.each do |script|
      UserScript.create!(user_id: student.id, script_id: script.id, completed_at: Time.now)
    end
    get :user_hero

    assert_select '#welcome.student'
    assert_select '#suggestcourse', I18n.t('home.student_finished',
      online_link: I18n.t('home.online'),
      local_school_link: I18n.t('home.local_school'))
  end

  test 'should show teacher-dashboard link when a teacher' do
    teacher = create :teacher
    sign_in teacher

    get :user_menu

    assert_response :success
    assert_select 'a[href="//test.code.org/teacher-dashboard"]', 'Teacher Home Page'
  end

  test "do not show prize link if you don't have a prize" do
    sign_in create(:teacher)

    get :user_menu
    assert_select 'a[href="http://test.host/redeemprizes"]', 0
  end

  test "user menu should open pairing dialog if asked to in the session" do
    sign_in create(:student)

    session[:show_pairing_dialog] = true

    get :user_menu

    assert assigns(:show_pairing_dialog)
    assert !session[:show_pairing_dialog] # should only show once
  end

  test "user menu should not open pairing dialog if not asked to in the session" do
    sign_in create(:student)

    session[:show_pairing_dialog] = nil

    get :user_menu

    assert !assigns(:show_pairing_dialog)
    assert !session[:show_pairing_dialog] # should only show once
  end

  test "do show prize link when you already have a prize" do
    teacher = create(:teacher)
    sign_in teacher
    teacher.teacher_prize = TeacherPrize.create!(prize_provider_id: 8, code: 'fake')

    get :user_menu
    assert_select 'a[href="http://test.host/redeemprizes"]'
  end

  test 'student does not see links to ops dashboard or teacher dashboard' do
    student = create :student
    sign_in student

    get :user_menu

    assert_response :success
    assert_select 'a[href="//test.code.org/ops-dashboard"]', 0
    assert_select 'a[href="//test.code.org/teacher-dashboard"]', 0
  end

  test 'should show sign in link for signed out user' do
    sign_out :user
    get :user_menu

    assert_response :success
    assert_select 'a[href="http://test.host/users/sign_in"]', 'Sign in'
  end

  test 'should show sign out link for signed in user' do
    student = create :student
    sign_in student

    get :user_menu

    assert_response :success
    assert_select 'a[href="http://test.host/users/sign_out"]', 'Sign out'
  end

  test 'show link to pair programming when in a section' do
    student = create(:follower).student_user
    sign_in student

    assert student.can_pair?

    get :user_menu

    assert_response :success
    assert_select '#pairing_link'
  end

  test "don't show link to pair programming when not in a section" do
    student = create(:student)
    sign_in student

    get :user_menu

    assert_response :success
    assert_select 'a[href="http://test.host/pairing"]', false
  end

  test 'api routing' do
    # /dashboardapi urls
    assert_routing(
      {method: "get", path: "/dashboardapi/user_menu"},
      {controller: "api", action: "user_menu"}
    )

    assert_routing(
      {method: "get", path: "/dashboardapi/section_progress/2"},
      {controller: "api", action: "section_progress", section_id: '2'}
    )

    assert_routing(
      {method: "get", path: "/dashboardapi/student_progress/2/15"},
      {controller: "api", action: "student_progress", section_id: '2', student_id: '15'}
    )

    assert_routing(
      {method: "get", path: "/dashboardapi/whatevvv"},
      {controller: "api", action: "whatevvv"}
    )

    # /api urls
    assert_recognizes(
      {controller: "api", action: "user_menu"},
      {method: "get", path: "/api/user_menu"}
    )

    assert_recognizes(
      {controller: "api", action: "section_progress", section_id: '2'},
      {method: "get", path: "/api/section_progress/2"}
    )

    assert_recognizes(
      {controller: "api", action: "student_progress", section_id: '2', student_id: '15'},
      {method: "get", path: "/api/student_progress/2/15"}
    )

    assert_recognizes(
      {controller: "api", action: "whatevvv"},
      {method: "get", path: "/api/whatevvv"}
    )
  end
end
