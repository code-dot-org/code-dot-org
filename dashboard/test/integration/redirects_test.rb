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
    assert_redirected_to '/s/playlab/stage/1/puzzle/1'

    get '/artist/lang/ar'
    assert_redirected_to '/s/artist/stage/1/puzzle/1'
  end

  test 'redirects lang parameter' do
    get '/lang/es'
    assert_redirected_to '/'

    get '/s/frozen/lang/es'
    assert_redirected_to '/s/frozen'

    get '/s/course1/stage/1/puzzle/1/lang/es'
    assert_redirected_to '/s/course1/stage/1/puzzle/1'
  end

  test 'old script id paths redirect to named paths' do
    %w(2:Hour%20of%20Code 4:events 7:jigsaw).map{ |s| s.split ':' }.each do |before, after|
      get "/s/#{before}"
      assert_redirected_to "/s/#{after}"
    end
  end
end
