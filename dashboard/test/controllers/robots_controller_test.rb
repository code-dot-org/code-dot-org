require 'test_helper'

class RobotsControllerTest < ActionController::TestCase
  test 'renders plaintext' do
    set_env :production
    get :index
    assert_response :success
    assert_equal response.content_type.split(';').first, 'text/plain'
  end

  test 'targets all crawlers' do
    set_env :production
    get :index
    assert_response :success
    lines = response.body.lines(chomp: true)
    assert_includes(lines, 'User-agent: *')
  end

  # Turning off disallow - see robots controller file
  # test 'denies all for non production environment' do
  #   set_env :levelbuilder
  #   get :index
  #   assert_response :success
  #   lines = response.body.lines(chomp: true)
  #   assert_includes(lines, 'Disallow: /')
  #   refute_includes(lines, 'Allow:')
  # end

  test 'allows all for production with a couple exceptions' do
    set_env :production
    get :index
    assert_response :success
    lines = response.body.lines(chomp: true)
    assert_includes(lines, 'Allow: /')
    # Turning off disallow - see robots controller file
    #assert_includes(lines, 'Disallow: /projects/')
  end
end
