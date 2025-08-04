require 'test_helper'

class UserPreferencesControllerTest < ActionController::TestCase
  setup do
    @user = create :user
    sign_in @user
  end

  test 'updates section_order for the current user' do
    section_order = ['1', '2', '3']

    patch :update, params: {section_order: section_order}

    assert_response :success

    preference = UserPreference.find_by(user_id: @user.id)
    assert_equal section_order, preference.section_order
  end

  test 'updates console_font_size for the current user' do
    console_font_size = {'pythonlab' => 'medium'}

    patch :update, params: {console_font_size: console_font_size}

    assert_response :success

    preference = UserPreference.find_by(user_id: @user.id)
    assert_equal console_font_size, preference.console_font_size
  end

  test 'updates editor_font_size for the current user' do
    editor_font_size = {'weblab2' => 'large'}

    patch :update, params: {editor_font_size: editor_font_size}

    assert_response :success

    preference = UserPreference.find_by(user_id: @user.id)
    assert_equal editor_font_size, preference.editor_font_size
  end

  test 'updates theme for the current user' do
    theme = {'global' => 'Dark'}

    patch :update, params: {theme: theme}

    assert_response :success

    preference = UserPreference.find_by(user_id: @user.id)
    assert_equal theme, preference.theme
  end

  test 'updates existing preference for section_order without creating a new record' do
    initial_order = ['3', '2', '1']
    preference = UserPreference.create!(user_id: @user.id, section_order: initial_order)

    new_order = ['1', '2', '3']

    assert_no_difference 'UserPreference.count' do
      patch :update, params: {section_order: new_order}
    end

    assert_response :success

    preference.reload
    assert_equal new_order, preference.section_order
  end

  test 'updates existing preference for editor_font_size without creating a new record and merges successfully' do
    initial_editor_font_size = {
      'pythonlab'=> 'small'
    }
    preference = UserPreference.create!(user_id: @user.id, editor_font_size: initial_editor_font_size)

    new_editor_font_size = {
      'weblab2'=> 'medium'
    }
    merged_editor_font_size = {
      'pythonlab'=> 'small',
      'weblab2'=> 'medium'
    }

    assert_no_difference 'UserPreference.count' do
      patch :update, params: {editor_font_size: new_editor_font_size}
    end

    assert_response :success

    preference.reload
    assert_equal merged_editor_font_size, preference.editor_font_size
  end

  test 'updates existing preference for theme without creating a new record and merges successfully' do
    initial_theme = {
      'global'=> 'Dark'
    }
    preference = UserPreference.create!(user_id: @user.id, theme: initial_theme)

    new_theme = {
      'blockly' => 'cdohighcontrast'
    }
    merged_theme = {
      'global'=> 'Dark',
      'blockly' => 'cdohighcontrast'
    }

    assert_no_difference 'UserPreference.count' do
      patch :update, params: {theme: new_theme}
    end

    assert_response :success

    preference.reload
    assert_equal merged_theme, preference.theme
  end

  test 'ignores non-permitted parameters' do
    section_order = ['1', '2', '3']

    patch :update, params: {
      section_order: section_order,
      unpermitted_param: 'should be ignored'
    }

    assert_response :success

    preference = UserPreference.find_by(user_id: @user.id)
    assert_equal section_order, preference.section_order
    assert_nil preference.attributes['unpermitted_param']
  end

  test 'gets console_font_size for the current user' do
    font_size = {'pythonlab' => 'large'}
    UserPreference.create!(user_id: @user.id, console_font_size: font_size)

    get :console_font_size

    assert_response :success
    assert_equal font_size, JSON.parse(response.body)['console_font_size']
  end

  test 'returns 404 if no console_font_size exists for the current user' do
    UserPreference.create!(user_id: @user.id, console_font_size: nil)

    get :console_font_size

    assert_response :not_found
  end

  test 'gets editor_font_size for the current user' do
    font_size = {'weblab2' => 'small'}
    UserPreference.create!(user_id: @user.id, editor_font_size: font_size)

    get :editor_font_size

    assert_response :success
    assert_equal font_size, JSON.parse(response.body)['editor_font_size']
  end

  test 'returns 404 if no editor_font_size exists for the current user' do
    UserPreference.create!(user_id: @user.id, editor_font_size: nil)

    get :editor_font_size

    assert_response :not_found
  end

  test 'gets theme for the current user' do
    theme = {'global' => 'Light'}
    UserPreference.create!(user_id: @user.id, theme: theme)

    get :theme

    assert_response :success
    assert_equal theme, JSON.parse(response.body)['theme']
  end

  test 'returns 404 if no theme exists for the current user' do
    UserPreference.create!(user_id: @user.id)

    get :theme

    assert_response :not_found
  end
end
