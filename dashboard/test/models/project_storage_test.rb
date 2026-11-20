require 'test_helper'

class ProjectStorageTest < ActiveSupport::TestCase
  test 'create_for_user records the anon_user_id of storage made without an account' do
    anon_user_id = SecureRandom.uuid
    storage = ProjectStorage.find(ProjectStorage.create_for_user(anon_user_id: anon_user_id))
    assert_nil storage.user_id
    assert_equal anon_user_id, storage.anon_user_id
  end

  test 'create_for_user returns the existing storage when the user already has one' do
    user_id = create(:student).id
    storage_id = ProjectStorage.create_for_user(user_id)
    assert_equal storage_id, ProjectStorage.create_for_user(user_id)
    assert_equal 1, ProjectStorage.where(user_id: user_id).count
  end

  test 'storage_id_for_user_id and user_id_for_storage_id map between users and storage' do
    user_id = create(:student).id
    storage_id = ProjectStorage.create_for_user(user_id)
    assert_equal storage_id, ProjectStorage.storage_id_for_user_id(user_id)
    assert_equal user_id, ProjectStorage.user_id_for_storage_id(storage_id)

    assert_nil ProjectStorage.storage_id_for_user_id(-1)
    assert_nil ProjectStorage.user_id_for_storage_id(ProjectStorage.create_for_user)
  end

  test 'storage_ids_by_user_id and user_ids_by_storage_id map in both directions' do
    user_ids = create_list(:student, 2).map(&:id)
    storage_ids = user_ids.map {|user_id| ProjectStorage.create_for_user(user_id)}

    assert_equal user_ids.zip(storage_ids).to_h, ProjectStorage.storage_ids_by_user_id(user_ids)
    assert_equal storage_ids.zip(user_ids).to_h, ProjectStorage.user_ids_by_storage_id(user_ids)
    assert_equal({}, ProjectStorage.storage_ids_by_user_id([]))
  end

  test 'claim_anonymous gives storage without an owner to the first user who claims it' do
    storage_id = ProjectStorage.create_for_user
    user_id, other_user_id = create_list(:student, 2).map(&:id)
    # storage_id_from_cookie accepts the cookie's storage only while it has no owner.
    assert ProjectStorage.exists?(id: storage_id, user_id: nil)

    assert_equal 1, ProjectStorage.claim_anonymous(storage_id, user_id)
    assert_equal user_id, ProjectStorage.user_id_for_storage_id(storage_id)
    refute ProjectStorage.exists?(id: storage_id, user_id: nil)

    assert_equal 0, ProjectStorage.claim_anonymous(storage_id, other_user_id)
    assert_equal user_id, ProjectStorage.user_id_for_storage_id(storage_id)
  end
end
