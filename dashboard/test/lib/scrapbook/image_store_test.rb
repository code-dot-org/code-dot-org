require 'test_helper'

class Scrapbook::ImageStoreTest < ActiveSupport::TestCase
  PNG = "\x89PNG\r\n\x1A\n".b + ("\x00".b * 8)
  JPEG = "\xFF\xD8\xFF".b + ("\x00".b * 9)
  GIF = 'GIF89a'.b + ("\x00".b * 6)
  WEBP = "RIFF\x00\x00\x00\x00WEBP".b

  test 'detect_content_type sniffs supported formats from magic bytes' do
    assert_equal 'image/png', Scrapbook::ImageStore.detect_content_type(PNG)
    assert_equal 'image/jpeg', Scrapbook::ImageStore.detect_content_type(JPEG)
    assert_equal 'image/gif', Scrapbook::ImageStore.detect_content_type(GIF)
    assert_equal 'image/webp', Scrapbook::ImageStore.detect_content_type(WEBP)
  end

  test 'detect_content_type rejects non-images and short input' do
    assert_nil Scrapbook::ImageStore.detect_content_type('this is plainly not an image')
    assert_nil Scrapbook::ImageStore.detect_content_type('short')
    assert_nil Scrapbook::ImageStore.detect_content_type(nil)
  end

  test 'detect_content_type does not trust an extension-only RIFF header' do
    # RIFF container that is not WEBP (e.g. a WAV) must not pass as an image.
    assert_nil Scrapbook::ImageStore.detect_content_type("RIFF\x00\x00\x00\x00WAVE".b)
  end

  test 'key namespaces images under the user inside the assets directory' do
    key = Scrapbook::ImageStore.key(42, 'abc.png')
    assert_equal "#{CDO.assets_s3_directory}/scrapbook/42/abc.png", key
  end

  test 'put stores bytes under a generated uuid filename and returns it' do
    SecureRandom.stubs(:uuid).returns('11111111-2222-3333-4444-555555555555')
    expected_key = Scrapbook::ImageStore.key(7, '11111111-2222-3333-4444-555555555555.png')
    AWS::S3.expects(:upload_to_bucket).with(
      Scrapbook::ImageStore.bucket,
      expected_key,
      PNG,
      has_entries(no_random: true, content_type: 'image/png')
    ).returns(expected_key)

    filename = Scrapbook::ImageStore.put(7, PNG, 'image/png')
    assert_equal '11111111-2222-3333-4444-555555555555.png', filename
  end

  test 'put rejects content types outside the allowlist' do
    assert_raises(ArgumentError) do
      Scrapbook::ImageStore.put(7, PNG, 'image/svg+xml')
    end
  end

  test 'read returns bytes and content type from S3' do
    object = stub(body: StringIO.new(PNG), content_type: 'image/png')
    client = stub
    client.expects(:get_object).with(
      bucket: Scrapbook::ImageStore.bucket,
      key: Scrapbook::ImageStore.key(7, 'abc.png')
    ).returns(object)
    AWS::S3.stubs(:create_client).returns(client)

    data, content_type = Scrapbook::ImageStore.read(7, 'abc.png')
    assert_equal PNG, data
    assert_equal 'image/png', content_type
  end

  test 'read raises AWS::S3::NoSuchKey when the object is missing' do
    client = stub
    client.stubs(:get_object).raises(Aws::S3::Errors::NoSuchKey.new(nil, 'gone'))
    AWS::S3.stubs(:create_client).returns(client)

    assert_raises(AWS::S3::NoSuchKey) do
      Scrapbook::ImageStore.read(7, 'abc.png')
    end
  end

  test 'delete removes the object from the bucket' do
    AWS::S3.expects(:delete_from_bucket).with(
      Scrapbook::ImageStore.bucket,
      Scrapbook::ImageStore.key(7, 'abc.png')
    )
    Scrapbook::ImageStore.delete(7, 'abc.png')
  end

  test 'signed_token round-trips the user id and filename' do
    token = Scrapbook::ImageStore.signed_token(7, 'abc.png')
    assert_equal({user_id: 7, filename: 'abc.png'}, Scrapbook::ImageStore.verify_token(token))
  end

  test 'signed_token is url-safe' do
    token = Scrapbook::ImageStore.signed_token(7, 'abc.png')
    assert_match(/\A[A-Za-z0-9_=-]+\z/, token)
  end

  test 'verify_token rejects a forged or corrupt token' do
    assert_nil Scrapbook::ImageStore.verify_token('not-a-real-token')
    assert_nil Scrapbook::ImageStore.verify_token(nil)
    token = Scrapbook::ImageStore.signed_token(7, 'abc.png')
    assert_nil Scrapbook::ImageStore.verify_token(token + 'tampered')
  end
end
