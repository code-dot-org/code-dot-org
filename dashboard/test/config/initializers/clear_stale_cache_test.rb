require 'test_helper'

class ClearStaleCacheTest < ActiveSupport::TestCase
  setup do
    GitUtils.stubs(:git_revision).returns("first commit")
  end

  test 'will not clear the cache on a fresh start or when restarting from the same commit' do
    Rails.cache.with_local_cache do
      Rails.cache.expects(:clear).never
      Cdo::ClearStaleCache.call # fresh start
      Cdo::ClearStaleCache.call # restart with same commit
    end
  end

  test 'will clear the cache when starting on a new commit' do
    Rails.cache.with_local_cache do
      Rails.cache.expects(:clear).never
      Cdo::ClearStaleCache.call # fresh start

      GitUtils.stubs(:git_revision).returns("new commit")
      Rails.cache.expects(:clear).once
      Cdo::ClearStaleCache.call # restart with new commit
    end
  end
end
