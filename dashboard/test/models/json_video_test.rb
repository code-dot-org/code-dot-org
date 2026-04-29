require 'test_helper'

class JSONVideoTest < ActiveSupport::TestCase
  setup do
    @objective1 = create(:objective, key: 'obj-1')
    @objective2 = create(:objective, key: 'obj-2')
  end

  def video_data(overrides = {})
    {
      key: 'test-video',
      description: 'A test video',
      s3_uri: 's3://bucket/test.json',
      json_schema_version: 1,
      audience: 'student',
    }.merge(overrides)
  end

  test 'summarize returns expected hash' do
    video = create(:json_video, key: 'test-key', description: 'Test desc', audience: 'student')
    summary = video.summarize

    assert_equal video.id, summary[:id]
    assert_equal 'test-key', summary[:key]
    assert_equal 'Test desc', summary[:description]
    assert_equal 'student', summary[:audience]
  end

  test 'seed_record creates a new video' do
    File.stubs(:read).returns(video_data.to_json)

    key = JSONVideo.seed_record('config/json_videos/test-video.json')
    video = JSONVideo.find_by!(key: 'test-video')

    assert_equal 'test-video', key
    assert_equal 'A test video', video.description
    assert_equal 's3://bucket/test.json', video.s3_uri
    assert_equal 1, video.json_schema_version
    assert_equal 'student', video.audience
  end

  test 'seed_record updates an existing video' do
    create(:json_video, key: 'test-video', description: 'Old description')

    File.stubs(:read).returns(video_data(description: 'New description').to_json)
    JSONVideo.seed_record('config/json_videos/test-video.json')

    assert_equal 'New description', JSONVideo.find_by!(key: 'test-video').description
  end

  test 'seed_record associates objectives via objective_keys' do
    data = video_data.merge(objective_keys: [@objective1.key, @objective2.key])
    File.stubs(:read).returns(data.to_json)

    JSONVideo.seed_record('config/json_videos/test-video.json')
    video = JSONVideo.find_by!(key: 'test-video')

    assert_equal 2, video.objectives.count
    assert_includes video.objectives, @objective1
    assert_includes video.objectives, @objective2
  end

  test 'seed_record clears objectives when objective_keys is empty' do
    video = create(:json_video, key: 'test-video')
    video.objectives << @objective1

    File.stubs(:read).returns(video_data.merge(objective_keys: []).to_json)
    JSONVideo.seed_record('config/json_videos/test-video.json')

    assert_equal 0, video.reload.objectives.count
  end

  test 'seed_record clears objectives when objective_keys is absent from file' do
    video = create(:json_video, key: 'test-video')
    video.objectives << @objective1

    File.stubs(:read).returns(video_data.to_json)
    JSONVideo.seed_record('config/json_videos/test-video.json')

    assert_equal 0, video.reload.objectives.count
  end

  test 'seed_all skips bad files and continues seeding remaining files' do
    Dir.mktmpdir do |tmpdir|
      root = Pathname.new(tmpdir)
      File.write(root.join('bad.json'), 'not valid json {{')
      File.write(root.join('good.json'), video_data.to_json)

      assert_nothing_raised do
        JSONVideo.seed_all(root_dir: root, glob: '*.json')
      end

      assert JSONVideo.exists?(key: 'test-video'), 'valid file should still be seeded after bad file'
    end
  end
end
