require 'test_helper'

class UserPreferencesControllerTest < ActionController::TestCase
  setup do
    @user = create(:user)
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
      'pythonlab' => 'small'
    }
    preference = UserPreference.create!(user_id: @user.id, editor_font_size: initial_editor_font_size)

    new_editor_font_size = {
      'weblab2' => 'medium'
    }
    merged_editor_font_size = {
      'pythonlab' => 'small',
      'weblab2' => 'medium'
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
      'global' => 'Dark'
    }
    preference = UserPreference.create!(user_id: @user.id, theme: initial_theme)

    new_theme = {
      'blockly' => 'cdohighcontrast'
    }
    merged_theme = {
      'global' => 'Dark',
      'blockly' => 'cdohighcontrast'
    }

    assert_no_difference 'UserPreference.count' do
      patch :update, params: {theme: new_theme}
    end

    assert_response :success

    preference.reload
    assert_equal merged_theme, preference.theme
  end

  test 'updates existing preference for editor_settings and merges successfully' do
    preference = UserPreference.create!(user_id: @user.id, editor_settings: {'lineNumbers' => false})

    # as: :json so the boolean survives the round trip, as it does from the real client.
    patch :update, params: {editor_settings: {'autocomplete' => false}}, as: :json

    assert_response :success

    preference.reload
    assert_equal({'lineNumbers' => false, 'autocomplete' => false}, preference.editor_settings)
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

  test 'locks the row without waiting when section_order changes' do
    UserPreference.create!(user_id: @user.id, section_order: [3, 2, 1])
    UserPreference.any_instance.expects(:lock!).with('FOR UPDATE NOWAIT')

    patch :update, params: {section_order: [1, 2, 3]}, as: :json

    assert_response :success
    assert_equal [1, 2, 3], UserPreference.find_by(user_id: @user.id).section_order
  end

  test 'returns conflict and keeps the stored section_order when another request holds the row lock' do
    preference = UserPreference.create!(user_id: @user.id, section_order: [3, 2, 1])
    UserPreference.any_instance.stubs(:lock!).raises(lock_nowait_error)

    patch :update, params: {section_order: [1, 2, 3]}, as: :json

    assert_response :conflict
    assert_equal [3, 2, 1], preference.reload.section_order
  end

  test 'does not lock the row when section_order is unchanged' do
    UserPreference.create!(user_id: @user.id, section_order: [3, 2, 1])
    UserPreference.any_instance.expects(:lock!).never

    patch :update, params: {section_order: [3, 2, 1]}, as: :json

    assert_response :success
  end

  test 'does not lock the row for preferences other than section_order' do
    UserPreference.create!(user_id: @user.id, section_order: [3, 2, 1])
    UserPreference.any_instance.expects(:lock!).never

    patch :update, params: {theme: {'global' => 'Dark'}}, as: :json

    assert_response :success
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

  test 'gets editor_settings for the current user' do
    editor_settings = {'autocomplete' => false}
    UserPreference.create!(user_id: @user.id, editor_settings: editor_settings)

    get :editor_settings

    assert_response :success
    assert_equal editor_settings, JSON.parse(response.body)['editor_settings']
  end

  test 'returns 404 if no editor_settings exist for the current user' do
    UserPreference.create!(user_id: @user.id)

    get :editor_settings

    assert_response :not_found
  end

  # Ruby sets an exception's cause only when raising it.
  private def lock_nowait_error
    mysql_error = Mysql2::Error.new('lock held', nil, UserPreferencesController::ER_LOCK_NOWAIT)
    raise ActiveRecord::StatementInvalid, 'NOWAIT', cause: mysql_error
  rescue ActiveRecord::StatementInvalid => exception
    exception
  end
end
