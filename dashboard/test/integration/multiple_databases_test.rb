require 'test_helper'

class RoleCounter < ActiveSupport::LogSubscriber
  attr_reader :counts

  def initialize
    super
    reset_counts
  end

  def sql(event)
    @counts[ActiveRecord::Base.current_role] += 1
  end

  def reset_counts
    @counts = Hash.new(0)
  end
end

class MultipleDatabasesTest < ActionDispatch::IntegrationTest
  setup do
    @role_counter = RoleCounter.new
    RoleCounter.attach_to(:active_record, @role_counter)
  end

  test "the role counter we use for the other tests here works" do
    ActiveRecord::Base.connected_to(role: :reading) do
      User.last
    end

    assert_equal({reading: 1}, @role_counter.counts)

    @role_counter.reset_counts

    ActiveRecord::Base.connected_to(role: :writing) do
      User.last
      User.first
    end

    assert_equal({writing: 2}, @role_counter.counts)
  end

  test "GET requests read from the primary database" do
    get '/hoc/1'
    assert_equal({writing: 2}, @role_counter.counts)
  end

  test "POST requests write to the primary database" do
    post '/users/begin_sign_up', params: {user: {email: "foo@bar.com"}}
    assert_equal({writing: 2}, @role_counter.counts)
  end

  test "routes with manual database selection will distribute queries to the replica when possible" do
    # Milestone Post
    script_level = create(:script_level)
    params = {program: 'fake program', testResult: 100, result: 'true'}
    post "/milestone/0/#{script_level.id}", params: params
    assert_equal({writing: 22, reading: 10}, @role_counter.counts)
  end
end
