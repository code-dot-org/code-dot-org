require 'test_helper'

class RedirectsTest < ActionDispatch::IntegrationTest
  self.use_transactional_test_case = true

  setup_all do
    @multi_lesson_unit = create(:unit, :with_levels, lessons_count: 3, levels_count: 10)
    @multi_lesson_unit_group = create(:single_unit_course, :stable, unit: @multi_lesson_unit)
  end

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
    assert_redirected_to '/flappy/1?set_locale=ar-SA&lang=ar-SA'
    follow_redirect!
    assert_redirected_to '/flappy/1?lang=ar-SA'
    assert_equal 'ar-SA', cookies[:language_]

    get '/playlab/lang/ar'
    assert_redirected_to '/s/playlab/lessons/1/levels/1?set_locale=ar-SA&lang=ar-SA'
    follow_redirect!
    assert_redirected_to '/s/playlab/lessons/1/levels/1?lang=ar-SA'
    assert_equal 'ar-SA', cookies[:language_]

    get '/artist/lang/ar'
    assert_redirected_to '/s/artist/lessons/1/levels/1?set_locale=ar-SA&lang=ar-SA'
    follow_redirect!
    assert_redirected_to '/s/artist/lessons/1/levels/1?lang=ar-SA'
    assert_equal 'ar-SA', cookies[:language_]
  end

  test 'redirects lang parameter' do
    get '/lang/es'
    assert_redirected_to '/?set_locale=es&lang=es'
    follow_redirect!
    assert_redirected_to '/?lang=es'
    assert_equal 'es-ES', cookies[:language_]

    get '/s/frozen/lang/es'
    assert_redirected_to '/s/frozen?set_locale=es&lang=es'
    follow_redirect!
    assert_redirected_to '/s/frozen?lang=es'
    assert_equal 'es-ES', cookies[:language_]

    get "/s/#{@multi_lesson_unit.name}/lessons/1/levels/1/lang/es"
    assert_redirected_to "/s/#{@multi_lesson_unit.name}/lessons/1/levels/1?set_locale=es&lang=es"
    follow_redirect!
    assert_redirected_to "/s/#{@multi_lesson_unit.name}/lessons/1/levels/1?lang=es"
    assert_equal 'es-ES', cookies[:language_]
  end

  test 'redirects urls with stage and puzzle to lessons and levels' do
    get '/s/allthethings/stage/1/puzzle/1'
    assert_redirected_to '/s/allthethings/lessons/1/levels/1'
    follow_redirect!
    assert_redirected_to '/courses/original-allthethings-course/units/1/lessons/1/levels/1'

    get '/s/allthethings/stage/40/puzzle/1/sublevel/1'
    assert_redirected_to '/s/allthethings/lessons/40/levels/1/sublevel/1'
    follow_redirect!
    assert_redirected_to '/courses/original-allthethings-course/units/1/lessons/40/levels/1/sublevel/1'

    get '/s/allthethings/stage/33/puzzle/1/page/1'
    assert_redirected_to '/s/allthethings/lessons/33/levels/1/page/1'
    follow_redirect!
    assert_redirected_to '/courses/original-allthethings-course/units/1/lessons/33/levels/1/page/1'

    # ideally we would just return a 404, but it is easier to implement a
    # redirect to a url which 404s.
    get '/s/allthethings/stage/1/puzzle'
    assert_redirected_to '/s/allthethings/lessons/1/levels'
    e = assert_raises(ActionController::RoutingError) do
      follow_redirect!
    end
    assert_includes e.message, 'No route matches'
  end

  test 'redirects urls with stage for lesson extras' do
    script = create(:script, name: 'script-with-bonus', lesson_extras_available: true)
    create(:single_unit_course, name: 'course-with-bonus', unit: script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    create(:script_level, script: script, lesson: lesson)
    create(:script_level, script: script, lesson: lesson, bonus: true)

    @teacher = create(:teacher)
    create(:section, user: @teacher, script: script, lesson_extras: true, id: 999999)

    sign_in(@teacher)

    get '/courses/course-with-bonus/units/1'
    assert :success

    get '/s/script-with-bonus/stage/1/extras?section_id=999999'
    assert_redirected_to '/s/script-with-bonus/lessons/1/extras?section_id=999999'
    follow_redirect!
    assert_redirected_to '/courses/course-with-bonus/units/1/lessons/1/extras?section_id=999999'
  end

  test 'redirects urls with lockable and puzzle to lockable and levels' do
    @unit = create(:script, name: 'test-script')
    create(:single_unit_course, unit: @unit, name: 'test-course')
    @lesson_group = create(:lesson_group, script: @unit)
    @lockable_lesson = create(:lesson, script: @unit, lockable: true, lesson_group: @lesson_group, has_lesson_plan: false, absolute_position: 1, relative_position: 1)
    @level_group = create(:level_group, :with_sublevels, name: 'assessment 1')
    @lockable_level_group_sl = create(:script_level, script: @unit, lesson: @lockable_lesson, levels: [@level_group], assessment: true)

    get '/s/test-script/lockable/1/puzzle/1'
    assert_redirected_to '/s/test-script/lockable/1/levels/1'
    follow_redirect!
    assert_redirected_to '/courses/test-course/units/1/lockable/1/levels/1'

    get '/s/test-script/lockable/1/puzzle/1/page/1'
    assert_redirected_to '/s/test-script/lockable/1/levels/1/page/1'
    follow_redirect!
    assert_redirected_to '/courses/test-course/units/1/lockable/1/levels/1/page/1'

    # ideally we would just return a 404, but it is easier to implement a
    # redirect to a url which 404s.
    get '/s/test-script/lockable/1/puzzle'
    assert_redirected_to '/s/test-script/lockable/1/levels'
    e = assert_raises(ActionController::RoutingError) do
      follow_redirect!
    end
    assert_includes e.message, 'No route matches'
  end

  test 'redirects weblab code studio share link to codeprojects' do
    get "//projects/weblab/abcdef"
    assert_redirected_to "https://#{CDO.codeprojects_hostname}/abcdef/"
  end

  test 'redirects to /courses/ from /s/' do
    single_unit_course = create(:single_unit_course, name: 'single-unit-course')

    get "/s/#{single_unit_course.first_unit.name}"
    assert_redirected_to "/courses/#{single_unit_course.name}/units/1"

    multi_unit_course = create(:unit_group, :with_units, name: 'multi-unit-course')
    get "/s/#{multi_unit_course.default_units.last.name}"
    assert_redirected_to "/courses/#{multi_unit_course.name}/units/#{multi_unit_course.default_unit_group_units.last.position}"
  end
end
