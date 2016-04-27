require_relative 'test_helper'
require 'cdo/aws/cloudfront'
require 'active_support/core_ext/hash/except'

# These unit tests simply confirm that the #create_or_update method will pass
# properly-structured data to the AWS CloudFront Client library.
# Separate integration tests are required to guarantee that the live API
# endpoints will accept the values provided.
class TestCloudFront < Minitest::Test
  def around(&block)
    AWS::CloudFront.stub(:alias_cache, pegasus_dir('cache', 'cloudfront_aliases_stub.json'), &block)
  end

  def setup
    @old_stub_responses = Aws.config[:stub_responses]
    Aws.config[:stub_responses] = true
    Aws.config[:cloudfront] = {
      stub_responses: {
        # Allow #wait_until methods to finish
        get_distribution: Aws::CloudFront::Client.new.
          get_distribution(id: 'string').data.
          tap { |x| x[:distribution][:status] = 'Deployed' }
      }
    }
  end

  def teardown
    Aws.config[:stub_responses] = @old_stub_responses
  end

  def distribution_list(items=[])
    {
      distribution_list: {
        marker: '',
        max_items: 0,
        quantity: items.length,
        is_truncated: false,
        items: items
      }
    }
  end

  def test_cloudfront_create
    Aws.config[:cloudfront][:stub_responses][:get_distribution_config] = ['NoSuchDistribution']
    Aws.config[:cloudfront][:stub_responses][:list_distributions] = distribution_list
    assert_output (<<STR) { AWS::CloudFront.create_or_update }
pegasus distribution created!
dashboard distribution created!
hourofcode distribution created!
pegasus distribution deployed!
dashboard distribution deployed!
hourofcode distribution deployed!
STR
  end

  def test_cloudfront_update
    # Stub list_distributions with the required aliases
    distribution = Aws::CloudFront::Client.new.
      get_distribution(id: 'string').data.distribution.to_h
    distribution_summary = distribution.except(
      :in_progress_invalidation_batches,
      :active_trusted_signers,
      :distribution_config
    ).merge(distribution[:distribution_config].except(
      :caller_reference,
      :default_root_object,
      :logging)
    ).merge(
      aliases: {
        quantity: 3,
        items: [CDO.pegasus_hostname, CDO.dashboard_hostname, CDO.hourofcode_hostname]
      }
    )
    Aws.config[:cloudfront][:stub_responses][:list_distributions] =
      distribution_list [distribution_summary]
    assert_output (<<STR) { AWS::CloudFront.create_or_update }
pegasus distribution updated!
dashboard distribution updated!
hourofcode distribution updated!
pegasus distribution deployed!
dashboard distribution deployed!
hourofcode distribution deployed!
STR
  end

  # Ensures that the cache configuration does not exceed CloudFront distribution limits.
  # 50 Cache behaviors per distribution (Updated from 25 through special request).
  # Ref: http://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html#limits_cloudfront
  def test_cloudfront_limits
    %i(pegasus dashboard).each do |app|
      # +1 to include the default cache behavior in the count.
      behavior_count = AWS::CloudFront.config(app)[:cache_behaviors][:quantity] + 1
      assert behavior_count <= 50, "#{app} has #{behavior_count} cache behaviors (max is 50)"
    end
  end

end
