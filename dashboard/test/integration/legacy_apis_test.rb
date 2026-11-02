require 'test_helper'

class LegacyAPIsTest < ActionDispatch::IntegrationTest
  describe 'FilesApi' do
    describe 'GET /v3/libraries?channels=<channel-id>' do
      let(:channel_id) {'expected_channel_id'}

      before do
        files = %w[file1.png file2.png]
        bucket = mock('library_bucket')

        LibraryBucket.stubs(:new).returns(bucket)
        bucket.stubs(:list).with(channel_id).returns(files)
      end

      it 'returns HTTP 200' do
        get "/v3/libraries?channels=#{channel_id}"
        must_respond_with :success
      end
    end
  end

  describe 'ChannelsApi' do
    describe 'GET /v3/channels' do
      it 'returns HTTP 200' do
        get '/v3/channels'
        must_respond_with :success
      end

      it 'preserves storage ID and anon_user_id between requests' do
        get '/v3/channels'

        init_storage_id = get_storage_id
        init_anon_user_id = request.anon_user_id

        _(init_storage_id).wont_be_nil
        _(init_anon_user_id).wont_be_nil

        get '/v3/channels'

        _(get_storage_id).must_equal init_storage_id
        _(request.anon_user_id).must_equal init_anon_user_id
      end

      it 'records anon_user_id cookie without creating session' do
        anon_user_id = Cdo::AnonUserId.generate
        cookies[Cdo::AnonUserId::KEY] = anon_user_id

        get '/v3/channels'

        must_respond_with :success
        _(user_storage_ids_table.where(anon_user_id:).count).must_equal 1
        _(response.headers['Set-Cookie'].to_s).wont_include '_learn_session_test='
      end

      it 'sets anon_user_id cookie without creating session' do
        get '/v3/channels'

        must_respond_with :success
        _(user_storage_ids_table.where(anon_user_id: cookies[Cdo::AnonUserId::KEY]).count).must_equal 1
        _(response.headers['Set-Cookie'].to_s).must_include "#{Cdo::AnonUserId::KEY}="
        _(response.headers['Set-Cookie'].to_s).wont_include '_learn_session_test='
      end

      it 'records Statsig stable ID as anon_user_id without anon_user_id cookie' do
        stable_id = SecureRandom.uuid
        cookies[SharedConstants::STATSIG_STABLE_ID_KEY] = stable_id

        get '/v3/channels'

        must_respond_with :success
        _(user_storage_ids_table.where(anon_user_id: stable_id).count).must_equal 1
        _(cookies[Cdo::AnonUserId::KEY]).must_equal stable_id
      end

      it 'records anon_user_id cookie over Statsig stable ID' do
        anon_user_id = Cdo::AnonUserId.generate
        stable_id = SecureRandom.uuid
        cookies[Cdo::AnonUserId::KEY] = anon_user_id
        cookies[SharedConstants::STATSIG_STABLE_ID_KEY] = stable_id

        get '/v3/channels'

        must_respond_with :success
        _(user_storage_ids_table.where(anon_user_id:).count).must_equal 1
        _(user_storage_ids_table.where(anon_user_id: stable_id).count).must_equal 0
      end
    end

    describe 'POST /v3/channels' do
      it 'stores new anon_user_id in cookie jar of project owner' do
        post '/v3/channels', params: {hello: 'world'}.to_json, headers: {'CONTENT_TYPE' => 'application/json;charset=utf-8'}

        anon_user_id = cookies[Cdo::AnonUserId::KEY]
        _(anon_user_id).must_match Cdo::AnonUserId::FORMAT
        _(response.headers['Set-Cookie'].to_s).must_match(/#{Cdo::AnonUserId::KEY}=#{anon_user_id}; .*HttpOnly; SameSite=Lax/)
        _(user_storage_ids_table.where(id: get_storage_id).get(:anon_user_id)).must_equal anon_user_id
      end
    end
  end

  describe 'SharedResources' do
    describe 'GET /shared/css/standards-report-print.css' do
      it 'returns HTTP 200' do
        get '/shared/css/standards-report-print.css'
        must_respond_with :success
      end
    end
  end

  describe 'NetSimApi' do
    describe 'GET /v3/netsim/shard/doesnotexist' do
      it 'returns HTTP 200' do
        get '/v3/netsim/shard/doesnotexist'
        must_respond_with :success
      end
    end
  end

  describe 'AnimationLibraryApi' do
    describe 'GET /api/v1/animation-library/level_animations/:version_id/:animation_name' do
      let(:version_id) {'expected_version_id'}
      let(:animation_name) {'expected_animation_name'}

      before do
        s3_client = stub('s3_client')
        bucket = stub('bucket')
        object = stub('object')
        result = stub(content_type: 'application/json', body: '{}')

        AWS::S3.stubs(:create_client).returns(s3_client)
        Aws::S3::Bucket.stubs(:new).with(ANIMATION_LIBRARY_BUCKET, client: s3_client).returns(bucket)
        bucket.stubs(:object).with("level_animations/#{animation_name}").returns(object)
        object.stubs(:get).with(version_id: version_id).returns(result)
      end

      it 'returns HTTP 200' do
        get "/api/v1/animation-library/level_animations/#{version_id}/#{animation_name}"
        must_respond_with :success
      end
    end
  end

  describe 'SoundLibraryApi' do
    describe 'GET /api/v1/sound-library/:sound_name' do
      let(:sound_name) {'expected_sound_name'}

      before do
        s3_client = stub('s3_client')
        bucket = stub('bucket')
        versions = stub('versions')
        version = stub('version')
        head = stub(delete_marker: false)
        result = stub(content_type: 'audio/mpeg', body: 'sound content')

        AWS::S3.stubs(:create_client).returns(s3_client)
        Aws::S3::Bucket.stubs(:new).with(SOUND_LIBRARY_BUCKET, client: s3_client).returns(bucket)
        bucket.stubs(:object_versions).with(prefix: sound_name).returns(versions)
        version.stubs(:head).returns(head)
        versions.stubs(:find).returns(version)
        version.stubs(:get).returns(result)
      end

      it 'returns HTTP 200' do
        get "/api/v1/sound-library/#{sound_name}"
        must_respond_with :success
      end
    end
  end
end
