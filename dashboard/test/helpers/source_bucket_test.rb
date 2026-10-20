require 'test_helper'

class SourceBucketTest < ActiveSupport::TestCase
  test 'remix_source retargets asset URLs to the destination channel' do
    src_channel = 'encrypted-src-channel'
    dest_channel = 'encrypted-dest-channel'

    bucket = SourceBucket.new
    bucket.stubs(:get_storage_id_and_project_id).with(src_channel).returns([1, 11])
    bucket.stubs(:get_storage_id_and_project_id).with(dest_channel).returns([2, 22])

    src_body = {
      source: {
        files: {
          'file-1' => {
            name: 'cat.png',
            url: "/v3/assets/#{src_channel}/abc123.png",
          },
          'file-2' => {
            name: 'index.html',
            contents: "<img src=\"/v3/assets/#{src_channel}/abc123.png\">",
          },
        },
      },
    }.to_json

    expected_body = src_body.gsub(
      "/v3/assets/#{src_channel}/",
      "/v3/assets/#{dest_channel}/"
    )

    s3 = mock
    s3.expects(:get_object).returns(stub(body: StringIO.new(src_body)))
    s3.expects(:put_object).with do |params|
      params[:body] == expected_body
    end
    bucket.stubs(:s3).returns(s3)

    bucket.remix_source(src_channel, dest_channel, [])
  end

  test 'remix_source retargets uploaded animation URLs and versions to the destination channel' do
    src_channel = 'encrypted-src-channel'
    dest_channel = 'encrypted-dest-channel'
    library_url = '/api/v1/animation-library/abc/category_animals/cat.png'

    bucket = SourceBucket.new
    bucket.stubs(:get_storage_id_and_project_id).with(src_channel).returns([1, 11])
    bucket.stubs(:get_storage_id_and_project_id).with(dest_channel).returns([2, 22])

    src_body = {
      animations: {
        orderedKeys: %w(uploaded-key library-key),
        propsByKey: {
          'uploaded-key' => {
            name: 'dog',
            sourceUrl: "/v3/animations/#{src_channel}/uploaded-key.png",
            version: 'src-version',
          },
          'library-key' => {
            name: 'cat',
            sourceUrl: library_url,
            version: 'library-version',
          },
        },
      },
    }.to_json
    animation_list = [{filename: 'uploaded-key.png', versionId: 'dest-version'}]

    s3 = mock
    s3.expects(:get_object).returns(stub(body: StringIO.new(src_body)))
    s3.expects(:put_object).with do |params|
      props = JSON.parse(params[:body])['animations']['propsByKey']
      props['uploaded-key'] == {
        'name' => 'dog',
        'sourceUrl' => "/v3/animations/#{dest_channel}/uploaded-key.png",
        'version' => 'dest-version',
      } && props['library-key'] == {
        'name' => 'cat',
        'sourceUrl' => library_url,
        'version' => 'library-version',
      }
    end
    bucket.stubs(:s3).returns(s3)

    bucket.remix_source(src_channel, dest_channel, animation_list)
  end
end
