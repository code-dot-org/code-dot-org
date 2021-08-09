require 'test_helper'

class RedirectsTest < ActionDispatch::IntegrationTest
  test 'redirect beta' do
    get '/beta'
    assert_redirected_to '/'
  end

  test 'redirects /sh to /c' do
    get '/sh/1'
    assert_redirected_to '/c/1'

    get '/sh/1/edit'
    assert_redirected_to '/c/1/edit'

    get '/sh/1/original_image'
    assert_redirected_to '/c/1/original_image'

    get '/sh/1/generate_image'
    assert_redirected_to '/c/1/generate_image'
  end

  test 'redirects /u to /c' do
    get '/u/1'
    assert_redirected_to '/c/1'

    get '/u/1/edit'
    assert_redirected_to '/c/1/edit'

    get '/u/1/original_image'
    assert_redirected_to '/c/1/original_image'

    get '/u/1/generate_image'
    assert_redirected_to '/c/1/generate_image'
  end

  test 'redirects cartoon network quick links' do
    get '/flappy/lang/ar'
    assert_redirected_to '/flappy/1'

    get '/playlab/lang/ar'
    assert_redirected_to '/s/playlab/lessons/1/levels/1'

    get '/artist/lang/ar'
    assert_redirected_to '/s/artist/lessons/1/levels/1'
  end

  test 'redirects lang parameter' do
    get '/lang/es'
    assert_redirected_to '/'

    get '/s/frozen/lang/es'
    assert_redirected_to '/s/frozen'

    get '/s/course1/lessons/1/levels/1/lang/es'
    assert_redirected_to '/s/course1/lessons/1/levels/1'
  end

  test 'redirects urls with stage and puzzle to lessons and levels' do
    get '/s/allthethings/stage/1/puzzle/1'
    assert_redirected_to '/s/allthethings/lessons/1/levels/1'

    get '/s/allthethings/stage/40/puzzle/1/sublevel/1'
    assert_redirected_to '/s/allthethings/lessons/40/levels/1/sublevel/1'

    get '/s/allthethings/stage/33/puzzle/1/page/1'
    assert_redirected_to '/s/allthethings/lessons/33/levels/1/page/1'
  end

  test 'redirects urls with stage for lesson extras' do
    script = create :script, name: 'script-with-bonus', lesson_extras_available: true
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    create :script_level, script: script, lesson: lesson
    create :script_level, script: script, lesson: lesson, bonus: true

    @teacher = create(:teacher)
    create(:section, user: @teacher, script: script, lesson_extras: true, id: 999999)

    sign_in(@teacher)

    get '/s/script-with-bonus'
    assert :success

    get '/s/script-with-bonus/stage/1/extras?section_id=999999'
    assert_redirected_to '/s/script-with-bonus/lessons/1/extras?section_id=999999'
  end

  test 'redirects urls with lockable and puzzle to lockable and levels' do
    @unit = create :script, name: 'test-script'
    @lesson_group = create :lesson_group, script: @unit
    @lockable_lesson = create(:lesson, script: @unit, lockable: true, lesson_group: @lesson_group, has_lesson_plan: false, absolute_position: 1, relative_position: 1)
    @level_group = create(:level_group, :with_sublevels, name: 'assessment 1')
    @lockable_level_group_sl = create(:script_level, script: @unit, lesson: @lockable_lesson, levels: [@level_group], assessment: true)

    get '/s/test-script/lockable/1/puzzle/1'
    assert_redirected_to '/s/test-script/lockable/1/levels/1'

    get '/s/test-script/lockable/1/puzzle/1/page/1'
    assert_redirected_to '/s/test-script/lockable/1/levels/1/page/1'
  end

  test 'old script id paths redirect to named paths' do
    %w(2:Hour%20of%20Code 4:events 7:jigsaw).map {|s| s.split ':'}.each do |before, after|
      get "/s/#{before}"
      assert_redirected_to "/s/#{after}"
    end
  end
end
