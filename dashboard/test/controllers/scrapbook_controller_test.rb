require 'test_helper'

class ScrapbookControllerTest < ActionController::TestCase
  PNG = "\x89PNG\r\n\x1A\n".b.freeze
  FILENAME = 'a1b2c3d4-0000-1111-2222-333344445555.png'.freeze

  setup do
    @user = create(:student)
    @token = Scrapbook::ImageStore.signed_token(@user.id, FILENAME)
  end

  test 'image: route captures the urlsafe token' do
    assert_recognizes(
      {controller: 'scrapbook', action: 'image', token: @token},
      "/scrapbook/images/#{@token}"
    )
  end

  test 'image: streams the bytes for the user and filename named in the token' do
    # Authorization rides in the token, not the session: no sign-in here.
    Scrapbook::ImageStore.expects(:read).with(@user.id, FILENAME).returns([PNG, 'image/png'])

    get :image, params: {token: @token}

    assert_response :success
    assert_equal 'image/png', response.media_type
    assert_equal PNG, response.body
  end

  test 'image: returns 404 for a forged token without touching S3' do
    Scrapbook::ImageStore.expects(:read).never
    get :image, params: {token: 'not-a-real-token'}
    assert_response :not_found
  end

  test 'image: returns 404 when the image is missing in S3' do
    Scrapbook::ImageStore.expects(:read).raises(AWS::S3::NoSuchKey.new('gone'))
    get :image, params: {token: @token}
    assert_response :not_found
  end
end
