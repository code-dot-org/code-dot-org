require 'test_helper'

class Api::V1::ScrapbookEntriesControllerTest < ActionController::TestCase
  PNG = "\x89PNG\r\n\x1A\n".b + ("\x00".b * 8)
  FILENAME = 'a1b2c3d4-0000-1111-2222-333344445555.png'.freeze

  setup do
    @user = create(:student)
    sign_in @user
  end

  def png_upload(bytes = PNG)
    file = Tempfile.new(['scrapbook', '.png'])
    file.binmode
    file.write(bytes)
    file.rewind
    Rack::Test::UploadedFile.new(file.path, 'image/png')
  end

  # Asserts a serialized proxy url is a tokenized path whose token verifies back
  # to this user and the given filename.
  def assert_proxy_url_for(url, filename)
    assert url.to_s.start_with?('/scrapbook/images/'), "expected a proxy url, got #{url.inspect}"
    payload = Scrapbook::ImageStore.verify_token(url.split('/').last)
    assert payload, "token did not verify: #{url.inspect}"
    assert_equal @user.id, payload[:user_id]
    assert_equal filename, payload[:filename]
  end

  test 'image: stores the upload and returns a tokenized proxy url' do
    Scrapbook::ImageStore.expects(:put).with(@user.id, PNG, 'image/png').returns(FILENAME)

    post :image, params: {image: png_upload}

    assert_response :success
    assert_proxy_url_for JSON.parse(response.body)['url'], FILENAME
  end

  test 'image: rejects a missing image' do
    Scrapbook::ImageStore.expects(:put).never
    post :image
    assert_response :unprocessable_entity
  end

  test 'image: rejects an oversized upload before touching S3' do
    Scrapbook::ImageStore.expects(:put).never
    oversized = png_upload('x' * (Scrapbook::ImageStore::MAX_BYTES + 1))
    post :image, params: {image: oversized}
    assert_response :unprocessable_entity
  end

  test 'image: rejects bytes that are not a supported image' do
    Scrapbook::ImageStore.expects(:put).never
    post :image, params: {image: png_upload('definitely not an image file')}
    assert_response :unprocessable_entity
  end

  test 'create: recovers the stored filename from the tokenized proxy url' do
    proxy = "/scrapbook/images/#{Scrapbook::ImageStore.signed_token(@user.id, FILENAME)}"
    post :create, params: {
      channel_id: 'fake-channel',
      scrapbook_entry: {entry_text: {}, before_asset_url: proxy},
    }

    assert_response :success
    entry = ScrapbookEntry.find_by(user_id: @user.id, channel_id: 'fake-channel')
    assert_equal FILENAME, entry.before_asset_url
    assert_proxy_url_for JSON.parse(response.body)['before_asset_url'], FILENAME
  end

  test 'create: drops an asset reference whose token does not verify' do
    post :create, params: {
      channel_id: 'fake-channel',
      scrapbook_entry: {entry_text: {}, before_asset_url: '/scrapbook/images/forged-token'},
    }

    assert_response :success
    entry = ScrapbookEntry.find_by(user_id: @user.id, channel_id: 'fake-channel')
    assert_nil entry.before_asset_url
  end

  test 'create: drops an asset reference whose token belongs to another user' do
    other = create(:student)
    proxy = "/scrapbook/images/#{Scrapbook::ImageStore.signed_token(other.id, FILENAME)}"
    post :create, params: {
      channel_id: 'fake-channel',
      scrapbook_entry: {entry_text: {}, before_asset_url: proxy},
    }

    assert_response :success
    entry = ScrapbookEntry.find_by(user_id: @user.id, channel_id: 'fake-channel')
    assert_nil entry.before_asset_url
  end

  test 'index: serializes stored filenames as tokenized proxy urls' do
    ScrapbookEntry.create!(
      user_id: @user.id,
      channel_id: 'fake-channel',
      entry_text: {},
      before_asset_url: FILENAME
    )

    get :index, params: {channel_id: 'fake-channel'}

    assert_response :success
    assert_proxy_url_for JSON.parse(response.body).first['before_asset_url'], FILENAME
  end
end
