require 'minitest/autorun'
require_relative 'test_helper'
require 'cdo/analytics/milestone_parser'

class MilestoneParser
  def stub_fetch(key, path, bytes)
    TestMilestoneParser.instance.fetch(key, path, bytes)
  end

  def debug(msg)
    # CDO.log.info msg # Uncomment to show debug logs
  end
end

class TestMilestoneParser < Minitest::Test
  def self.instance
    @@instance
  end

  MILESTONE_LOG = File.join(__dir__, 'fixtures', 'milestone.log')
  LOG_SIZE = File.stat(MILESTONE_LOG).size
  CACHE_FILE = File.join(__dir__, 'fixtures', 'milestone-cache-test.json')

  def fetch(key, path, bytes)
    @fetch_count += 1
    @bytes_count += bytes
    log = MILESTONE_LOG
    milestone_cache = pegasus_dir 'cache', 'milestone.log'
    if File.extname(path) == '.gz'
      File.write("#{milestone_cache}.gz", `cat #{log} | gzip -c`)
    else
      FileUtils.copy(log, path)
    end
  end

  def setup
    @@instance = self
    @bytes_count = 0
    @fetch_count = 0

    @s3_client = Aws::S3::Client.new(stub_responses: true)
    @s3_client.stub_responses(:list_objects_v2,
      [
        {common_prefixes: [{prefix: 'hosts/adhoc-12345/'}, {prefix: 'hosts/folder_1/'}, {prefix: 'hosts/folder_2/'}, {prefix: 'hosts/folder_3/'}]},
        {contents: [
          {key: 'hosts/folder_1/dashboard/milestone.log', size: LOG_SIZE, etag: 'x'},
          {key: 'hosts/folder_1/dashboard/milestone.log.gz', size: 20, etag: 'y'},
        ]},
        {contents: [
          {key: 'hosts/folder_2/dashboard/milestone.log', size: LOG_SIZE, etag: 'x'},
          {key: 'hosts/folder_2/dashboard/milestone.log.gz', size: 20, etag: 'y'},
        ]},
        {contents: [
          {key: 'hosts/folder_3/dashboard/milestone.log', size: LOG_SIZE, etag: 'x'},
          {key: 'hosts/folder_3/dashboard/milestone.log.gz', size: 20, etag: 'y'},
        ]}
      ]
    )
    @cache = JSON.parse(IO.read(CACHE_FILE))
  end

  def test_parse_create_cache
    parser = MilestoneParser.new({}, @s3_client)
    count = parser.count
    assert_equal 90, count
    assert_equal 6, @fetch_count
    assert_equal parser.cache, @cache
    assert_equal LOG_SIZE * 3 + 20 * 3, @bytes_count
  end

  def test_parse_fully_cached
    count = MilestoneParser.new(@cache, @s3_client).count
    assert_equal 90, count
    assert_equal 0, @fetch_count
  end

  def test_etag_modified_md5_match
    @s3_client.stub_responses(:get_object,
      {body: `cat #{MILESTONE_LOG} | head -c #{MilestoneParser::COMPARE_BYTE_LENGTH}`},
    )
    cache = @cache.dup.tap do |x|
      x[x.keys[0]]['length'] = 1050
      x[x.keys[0]]['etag'] = 'y'
      x[x.keys[0]]['count'] = 20
    end
    count = MilestoneParser.new(cache, @s3_client).count
    assert_equal 90 + 20, count
    assert_equal 1, @fetch_count
    assert_equal LOG_SIZE - 1050, @bytes_count
  end

  def test_zero_length_append
    cache = @cache.dup.tap do |x|
      x[x.keys[0]] = {
        'count' => 5,
        'length' => 0,
        'md5' => Digest::MD5.hexdigest(''),
        'etag' => 'z'
      }
    end
    count = MilestoneParser.new(cache, @s3_client).count
    assert_equal 90 + 5, count
    assert_equal 1, @fetch_count
    assert_equal LOG_SIZE, @bytes_count
  end

  def test_log_rollover
    cache = @cache.dup.tap do |x|
      x[x.keys[0]] = {
        'count' => 50,
        'length' => 5000,
        'md5' => 'z',
        'etag' => 'z'
      }
    end
    count = MilestoneParser.new(cache, @s3_client).count
    assert_equal 90, count
    assert_equal 1, @fetch_count
    assert_equal LOG_SIZE, @bytes_count
  end

  def test_error_handling
    @s3_client.stub_responses(
      :list_objects_v2,
      [
        {common_prefixes: [{prefix: 'hosts/folder_1/'}]},
        {contents: [
          {key: 'hosts/folder_1/dashboard/milestone.log.12345', size: LOG_SIZE, etag: 'x'}
        ]}
      ]
    )
    count = MilestoneParser.new(@cache, @s3_client).count
    assert_equal 0, count
  end
end
