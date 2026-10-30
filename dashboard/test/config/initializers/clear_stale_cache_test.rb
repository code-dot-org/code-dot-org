require 'test_helper'

class ClearStaleCacheTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  before do
    GitUtils.stubs(:git_revision).returns("first commit")
  end

  it 'will not clear the cache on a fresh start or when restarting from the same commit' do
    Rails.cache.with_local_cache do
      expect(Rails.cache).not_to receive(:clear)
      Cdo::ClearStaleCache.call # fresh start
      Cdo::ClearStaleCache.call # restart with same commit
    end
  end

  it 'will clear the cache when starting on a new commit' do
    Rails.cache.with_local_cache do
      Cdo::ClearStaleCache.call

      expect(Rails.cache).to receive(:clear).twice.and_call_original
      GitUtils.stubs(:git_revision).returns("second commit")
      Cdo::ClearStaleCache.call

      GitUtils.stubs(:git_revision).returns("third commit")
      Cdo::ClearStaleCache.call
    end
  end
end
