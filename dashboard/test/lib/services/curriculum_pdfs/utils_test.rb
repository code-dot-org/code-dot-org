require 'test_helper'

class Services::CurriculumPdfs::UtilsTest < ActiveSupport::TestCase
  test 'timestamp equality can compare Times and Strings' do
    assert Services::CurriculumPdfs.timestamps_equal(
      Time.new(2007, 1, 29, 12, 34, 56),
      "2007-01-29 12:34:56"
    )

    refute Services::CurriculumPdfs.timestamps_equal(
      Time.new(2007, 1, 29, 12, 34),
      "2007-01-29 12:34:56"
    )

    assert Services::CurriculumPdfs.timestamps_equal(
      "20070129123456",
      "2007-01-29 12:34:56"
    )

    assert Services::CurriculumPdfs.timestamps_equal(
      "20070129123456",
      Time.parse("2007-01-29 12:34:56")
    )
  end

  test 'pdf_exists_at will cache if possible' do
    test_pathname = "foo.pdf"
    expected_cache_key = "CurriculumPdfs/pdf_exists/\"foo.pdf\""

    # The test environment by default will not even attempt to cache.
    CDO.shared_cache.expects(:exist?).never
    CDO.shared_cache.expects(:read).never
    CDO.shared_cache.expects(:write).never
    AWS::S3.expects(:exists_in_bucket).once.returns(true)
    assert Services::CurriculumPdfs.pdf_exists_at?(test_pathname)

    # But if we're using MemCache (as we do in production), we will attempt to
    # read from and write to the cache.
    mock_memcache = mock
    mock_memcache.stubs(:is_a?).with(ActiveSupport::Cache::MemCacheStore).returns(true)
    CDO.stubs(:shared_cache).returns(mock_memcache)

    # Write to the cache if it isn't already populated.
    CDO.shared_cache.expects(:exist?).with(expected_cache_key).returns(false)
    CDO.shared_cache.expects(:read).never
    CDO.shared_cache.expects(:write).with(expected_cache_key, true)
    AWS::S3.expects(:exists_in_bucket).once.returns(true)
    assert Services::CurriculumPdfs.pdf_exists_at?(test_pathname)

    # Read from the cache if it is.
    CDO.shared_cache.expects(:exist?).with(expected_cache_key).returns(true)
    CDO.shared_cache.expects(:read).with(expected_cache_key).returns(true)
    CDO.shared_cache.expects(:write).never
    AWS::S3.expects(:exists_in_bucket).never
    assert Services::CurriculumPdfs.pdf_exists_at?(test_pathname)

    CDO.unstub(:shared_cache)
  end
end
