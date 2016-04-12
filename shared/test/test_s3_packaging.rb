require_relative './test_helper'
require 'securerandom'
require 'aws-sdk'
require 'cdo/rake_utils'

require_relative '../../lib/cdo/aws/s3_packaging'
ORIGINAL_HASH = 'fake-hash'

class S3PackagingTest < Minitest::Test
  include SetupTest

  def create_packager(commit_hash = ORIGINAL_HASH)
    source_location = Dir.mktmpdir
    target_location = Dir.mktmpdir
    Dir.chdir(source_location) do
      FileUtils.mkdir('src')
      File.open('src/one.js', 'w') { |file| file.write("file one") }
      File.open('src/two.js', 'w') { |file| file.write("file two") }
      FileUtils.mkdir('build')
      File.open('build/output.js', 'w') { |file| file.write("output") }
    end
    packager = RakeUtils.stub(:git_folder_hash, commit_hash) do
      S3Packaging.new('test-package', source_location, target_location)
    end
    [source_location, target_location, packager]
  end

  def cleanup_packager(source_location, target_location)
    FileUtils.remove_entry_secure source_location
    FileUtils.remove_entry_secure target_location
  end

  def setup
    @source_location, @target_location, @packager = create_packager
  end

  def teardown
    cleanup_packager(@source_location, @target_location)
  end

  def test_s3_key
    s3_key = @packager.send(:s3_key)
    assert_equal s3_key, 'test-package/fake-hash.tar.gz'
  end

  def test_target_commit_hash
    # starts out as nil, since we don't have a commit_hash file
    assert @packager.send(:target_commit_hash, @target_location).nil?

    IO.write(@target_location + '/commit_hash', 'manual-hash')
    assert_equal @packager.send(:target_commit_hash, @target_location), 'manual-hash'
    FileUtils.rm(@target_location + '/commit_hash')
  end

  def test_create_and_decompress_package
    package = RakeUtils.stub(:git_folder_hash, ORIGINAL_HASH) do
      @packager.send(:create_package, 'build')
    end
    assert package.is_a?(Tempfile)

    `rm -rf #{@target_location}/*`
    @packager.decompress_package(package)

    # package contains a commit_hash
    commit_hash_file = @target_location + '/commit_hash'
    assert File.exist?(commit_hash_file)
    assert_equal ORIGINAL_HASH, IO.read(commit_hash_file)

    assert File.exist?(@target_location + '/output.js')
  end

  def test_upload_download_package
    package = @packager.send(:create_package, 'build')

    @packager.send(:upload_package, package)

    downloaded = @packager.send(:download_package)
    assert @packager.send(:packages_equivalent, package, downloaded)
  end

  def test_download_nonexistent
    alt_source_loc, alt_target_loc, alt_packager = create_packager('fake-nonexistent-hash')

    begin
      threw = false
      begin
        alt_packager.send(:download_package)
      rescue Aws::S3::Errors::NoSuchKey
        threw = true
      end
      assert threw
    ensure
      cleanup_packager(alt_source_loc, alt_target_loc)
    end
  end

  def test_ensure_updated_package
    alt_hash = 'alternate-hash'
    alt_source_loc, alt_target_loc, alt_packager = create_packager(alt_hash)
    begin
      # upload package for ORIGINAL_HASH
      original_package = RakeUtils.stub(:git_folder_hash, ORIGINAL_HASH) do
        @packager.send(:create_package, 'build')
      end
      @packager.send(:upload_package, original_package)

      # upload package for "alternate-hash"
      alt_package = RakeUtils.stub(:git_folder_hash, alt_hash) do
        alt_packager.send(:create_package, 'build')
      end
      alt_packager.send(:upload_package, alt_package)

      # we have no package, so we download one
      FileUtils.rm_rf(@target_location + '/*')
      assert @packager.send(:target_commit_hash, @target_location).nil?
      @packager.send(:ensure_updated_package)
      assert_equal @packager.send(:target_commit_hash, @target_location), ORIGINAL_HASH

      # trash output.js, but keep our commit_hash.
      FileUtils.rm_rf(@target_location + '/output.js')
      @packager.send(:ensure_updated_package)
      # we shouldn't have redownloaded output, because commit_hash still claims we're up to date
      assert_equal @packager.send(:target_commit_hash, @target_location), ORIGINAL_HASH
      assert !File.exist?(@target_location + '/output.js')

      # if we have the wrong package, we download
      FileUtils.cp(@target_location + '/commit_hash', alt_target_loc)
      assert_equal alt_packager.send(:target_commit_hash, alt_target_loc), ORIGINAL_HASH
      alt_packager.send(:ensure_updated_package)
      assert_equal alt_packager.send(:target_commit_hash, alt_target_loc), alt_hash
      assert File.exist?(alt_target_loc + '/output.js')

      # if there is no package to download, we throw
      cleanup_packager(alt_source_loc, alt_target_loc)
      alt_source_loc, alt_target_loc, alt_packager = create_packager('fake-nonexistent-hash')
      threw = false
      begin
        alt_packager.send(:ensure_updated_package)
      rescue Aws::S3::Errors::NoSuchKey
        threw = true
      end
      assert threw
    ensure
      cleanup_packager(alt_source_loc, alt_target_loc)
    end
  end

  def test_upload_package_to_s3
    # Note: In a world where we were regularly running this test without VCR, we'd need to worry about clients
    # colliding (since they're using the same S3 paths). However, because all of our network requests end up being
    # mocked, this is not a concern

    # begin by deleting existing object
    client = Aws::S3::Client.new
    client.delete_object(bucket: S3Packaging::BUCKET_NAME, key: @packager.send(:s3_key))

    # upload a package
    assert @packager.upload_package_to_s3('/build')

    # upload the same package again, it works
    assert @packager.upload_package_to_s3('/build')

    # try uploading a different package under the same name, it fails
    threw = false
    begin
      assert !@packager.upload_package_to_s3('/src')
    rescue
      threw = true
    end
    assert threw
  end

  def test_download_anonymous
    package = RakeUtils.stub(:git_folder_hash, ORIGINAL_HASH) do
      @packager.send(:create_package, 'build')
    end
    @packager.send(:upload_package, package)
    # Stub blank AWS credentials in packager's S3 client
    @packager.instance_variable_set(:@client, Aws::S3::Client.new(credentials: Aws::Credentials.new(nil,nil)))
    downloaded = @packager.send(:download_package)
    assert @packager.send(:packages_equivalent, package, downloaded)
  end
end
