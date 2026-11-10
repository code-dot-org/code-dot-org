require 'test_helper'
require 'testing/projects_backends'

class StorageIdTest < ActiveSupport::TestCase
  include ProjectsBackends

  test 'create_storage_id_for_user records the anon_user_id of storage made without an account' do
    anon_user_id = SecureRandom.uuid
    storage = get_user_storage_id({id: create_storage_id_for_user(anon_user_id: anon_user_id)})
    assert_nil storage[:user_id]
    assert_equal anon_user_id, storage[:anon_user_id]
  end

  test 'storage_id_for_current_user finds, claims, or creates the user storage' do
    request = mock
    stubs(:request).returns(request)

    request.stubs(:user_id).returns(nil)
    assert_nil storage_id_for_current_user

    user_id = create(:student).id
    storage_id = create_storage_id_for_user(user_id)
    request.stubs(:user_id).returns(user_id)
    assert_equal storage_id, storage_id_for_current_user

    request.stubs(:user_id).returns(create(:student).id)
    stubs(:take_storage_id_ownership_from_cookie).returns(123)
    assert_equal 123, storage_id_for_current_user

    new_user_id = create(:student).id
    request.stubs(:user_id).returns(new_user_id)
    stubs(:take_storage_id_ownership_from_cookie).returns(nil)
    storage_id = storage_id_for_current_user
    assert_equal storage_id_for_user_id(new_user_id), storage_id
  end

  test 'storage_id_for_current_user returns the storage a concurrent request created' do
    user_id = create(:student).id
    existing_storage_id = create_storage_id_for_user(user_id)
    stubs(:request).returns(stub(user_id: user_id, cookies: {}))
    # A miss on the first lookup sends the second insert into the unique index on user_id.
    stubs(:storage_id_for_user_id).with(user_id).returns(nil).then.returns(existing_storage_id)

    assert_equal existing_storage_id, storage_id_for_current_user
  end

  test 'take_storage_id_ownership_from_cookie claims cookie storage only while it has no owner' do
    response = mock
    response.stubs(:delete_cookie)
    stubs(:response).returns(response)
    user_id = create(:student).id

    stubs(:storage_id_from_cookie).returns(nil)
    assert_nil take_storage_id_ownership_from_cookie(user_id)

    cookie_storage_id = create_storage_id_for_user
    stubs(:storage_id_from_cookie).returns(cookie_storage_id)
    response.expects(:delete_cookie)
    assert_equal cookie_storage_id, take_storage_id_ownership_from_cookie(user_id)
    assert_equal cookie_storage_id, storage_id_for_user_id(user_id)

    owned_storage_id = create_storage_id_for_user(create(:student).id)
    other_user_id = create(:student).id
    stubs(:storage_id_from_cookie).returns(owned_storage_id)
    response.expects(:delete_cookie)
    assert_nil take_storage_id_ownership_from_cookie(other_user_id)
    assert_nil storage_id_for_user_id(other_user_id)
  end

  test 'storage_id_from_cookie accepts only storage that exists and has no owner' do
    request = mock
    stubs(:request).returns(request)
    cookie_for = ->(storage_id) {{storage_id_cookie_name => CGI.escape(storage_encrypt_id(storage_id))}}

    # No storage row has the largest INT id.
    request.stubs(:cookies).returns(cookie_for.call((2**31) - 1))
    assert_nil storage_id_from_cookie

    storage_id = create_storage_id_for_user
    request.stubs(:cookies).returns(cookie_for.call(storage_id))
    assert_equal storage_id, storage_id_from_cookie

    update_annoymous_user_storage_id(storage_id, create(:student).id)
    assert_nil storage_id_from_cookie
  end

  test 'user_id_for_storage_id maps storage back to its user' do
    user_id = create(:student).id
    assert_equal user_id, user_id_for_storage_id(create_storage_id_for_user(user_id))
    assert_nil user_id_for_storage_id(create_storage_id_for_user)
  end

  test 'get_storage_ids_by_user_ids and get_user_ids_by_storage_ids map in both directions' do
    user_ids = create_list(:student, 2).map(&:id)
    storage_ids = user_ids.map {|user_id| create_storage_id_for_user(user_id)}

    assert_equal user_ids.zip(storage_ids).to_h, get_storage_ids_by_user_ids(user_ids)
    assert_equal storage_ids.zip(user_ids).to_h, get_user_ids_by_storage_ids(user_ids)
    assert_equal({}, get_storage_ids_by_user_ids([]))
  end

  test 'delete_storage_id_for_user removes the user storage' do
    user_id = create(:student).id
    create_storage_id_for_user(user_id)
    assert_equal 1, delete_storage_id_for_user(user_id)
    assert_nil storage_id_for_user_id(user_id)
  end

  test 'get_project_channel_id returns the uuid only when project-uuid-in-url is on' do
    channel_id = Projects.new(create_storage_id_for_user).create({}, ip: 123)
    storage_id, project_id = get_storage_id_and_project_id(channel_id)
    assert_equal channel_id, get_project_channel_id(storage_id, project_id)

    DCDO.stubs(:get).with('project-uuid-in-url', false).returns(true)
    uuid = get_project_channel_id(storage_id, project_id)
    assert_match Project::UUID_FORMAT, uuid
    assert_equal [storage_id, project_id], get_storage_id_and_project_id(uuid)
    assert_raises(ArgumentError) {get_project_channel_id(nil, project_id)}
  end

  test 'get_storage_id_and_project_id resolves encrypted and uuid channel ids' do
    storage_id = create_storage_id_for_user
    channel_id = Projects.new(storage_id).create({}, ip: 123)
    _, project_id = storage_decrypt_channel_id(channel_id)
    uuid = Projects.get_by_ids([project_id]).first[:uuid]

    assert_equal [storage_id, project_id], get_storage_id_and_project_id(channel_id)
    assert_equal [storage_id, project_id], get_storage_id_and_project_id(uuid)
    assert_raises(ArgumentError) {get_storage_id_and_project_id(SecureRandom.uuid)}
    assert_raises(ArgumentError) {get_storage_id_and_project_id(nil)}
  end

  test 'owns_channel? compares the channel owner with the current storage' do
    storage_id = create_storage_id_for_user
    channel_id = Projects.new(storage_id).create({}, ip: 123)

    stubs(:get_storage_id).returns(storage_id)
    assert owns_channel?(channel_id)
    refute owns_channel?('garbage')

    stubs(:get_storage_id).returns(create_storage_id_for_user)
    refute owns_channel?(channel_id)
  end
end

class StorageIdActiveRecordTest < StorageIdTest
  self.projects_backend = :active_record
end
