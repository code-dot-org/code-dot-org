require_relative '../../test_helper'
require_relative '../../../middleware/helpers/storage_id'

class StorageIdTest < Minitest::Test
  include SetupTest

  def setup
    @user_storage_ids_table = PEGASUS_DB[:user_storage_ids]
  end

  def test_storage_id_for_current_user
    request = mock
    stubs(:request).returns(request)

    # Returns nil if no user
    request.stubs(:user_id).returns(nil)
    assert_nil storage_id_for_current_user

    # # Gets value from table if it exists
    request.stubs(:user_id).returns(2)
    table_storage_id = @user_storage_ids_table.insert(user_id: 2)
    assert_equal table_storage_id, storage_id_for_current_user

    # Returns value from cookie if we have one
    request.stubs(:user_id).returns(3)
    stubs(:take_storage_id_ownership_from_cookie).returns(123)
    assert_equal 123, storage_id_for_current_user

    # adds entry to table if no cookie
    request.stubs(:user_id).returns(4)
    stubs(:take_storage_id_ownership_from_cookie).returns(nil)
    storage_id = storage_id_for_current_user

    row = @user_storage_ids_table.where(user_id: 4).first
    assert_equal row[:id], storage_id
  end

  def test_storage_id_for_current_user_race_condition
    request = mock
    stubs(:request).returns(request)

    table_user_id = 2
    table_storage_id = 3
    request.stubs(:user_id).returns(table_user_id)
    request.stubs(:cookies).returns({})

    # To simulate a race condition, say the storage id for this user is absent
    # the first time we ask, then present the second time.
    mock_rows = stub('mock rows')
    mock_rows.stubs(:first).
      returns(nil).then.
      returns({id: table_storage_id})

    # Mock the DB and table, raising an exception on insert.
    mock_table = stub('user storage ids table')
    mock_table.stubs(:where).with({user_id: table_user_id}).returns(mock_rows).twice
    mock_table.stubs(:insert).with({user_id: table_user_id}).raises(Sequel::UniqueConstraintViolation).once

    PEGASUS_DB.stubs(:[]).with(:user_storage_ids).returns(mock_table)

    assert_equal table_storage_id, storage_id_for_current_user
  end

  def test_take_storage_id_ownership_from_cookie
    response = mock
    response.stubs(:delete_cookie).returns(nil)
    stubs(:response).returns response

    # does nothing if no cookie
    user_id = 6
    stubs(:storage_id_from_cookie).returns(nil)
    assert_nil take_storage_id_ownership_from_cookie(user_id)

    # takes ownership if id is unused
    user_id = 7
    # this row would get created as part of create_storage_id_cookie
    table_storage_id = @user_storage_ids_table.insert(user_id: nil, id: 123)
    stubs(:storage_id_from_cookie).returns(table_storage_id)
    response.expects(:delete_cookie)
    storage_id = take_storage_id_ownership_from_cookie(user_id)
    assert_equal table_storage_id, storage_id
    row = @user_storage_ids_table.where(user_id: user_id).first
    assert_equal row[:id], table_storage_id

    # returns nil if owned by a different user
    other_user_id = 8
    user_id = 9
    table_storage_id = @user_storage_ids_table.insert(user_id: other_user_id)
    stubs(:storage_id_from_cookie).returns(table_storage_id)
    response.expects(:delete_cookie)
    storage_id = take_storage_id_ownership_from_cookie(user_id)
    assert_nil storage_id
    assert_nil @user_storage_ids_table.where(user_id: user_id).first
  end

  def test_storage_id_from_cookie
    request = mock
    stubs(:request).returns(request)

    cookie_storage_id = 3
    cookie_value = CGI.escape(storage_encrypt_id(cookie_storage_id))
    request.stubs(:cookies).returns({storage_id_cookie_name => cookie_value})

    # returns nil if storage id is invalid
    assert_nil storage_id_from_cookie

    # returns storage id from cookie if unowned
    @user_storage_ids_table.insert(user_id: nil, id: cookie_storage_id)
    assert_equal cookie_storage_id, storage_id_from_cookie

    # returns nil if storage id from cookie is owned by a user
    @user_storage_ids_table.where(id: cookie_storage_id).update(user_id: 2)
    assert_nil storage_id_from_cookie
  end

  # Ensures decrypt/encrypt performance exceeds a minimum iterations per second threshold.
  def test_encrypt_performance
    require 'benchmark/ips'
    result = Benchmark.ips(time: 1, warmup: 0.5, quiet: true) do |x|
      id_range = 1..10000
      x.report do
        id = rand(id_range)
        assert_equal id, storage_decrypt_id(storage_encrypt_id(id))
      end
    end
    assert_operator result.entries.first.ips, :>, 3000
  end
end
