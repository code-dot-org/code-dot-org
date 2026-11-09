require_relative '../test_helper'
require 'cdo/aws'
require 'aws-sdk-s3'
require 'cdo/aws/ec2'

# Constant resolution around Cdo::Aws. Every bug this guards against is load-order dependent: the
# offending reference sits in a file that is correct on its own and only resolves wrong once some
# unrelated require has pulled in a neighbouring namespace, so running one file in isolation cannot
# see them.
class CdoAwsNamespaceTest < Minitest::Test
  def test_unprefixed_aws_inside_module_cdo_reaches_the_gem
    assert_same ::Aws::S3::Client, Cdo.const_get(:NamespaceProbe).gem_client
  end

  def test_unprefixed_legacy_aws_inside_module_cdo_reaches_the_legacy_wrapper
    assert_same ::AWS::EC2, Cdo.const_get(:NamespaceProbe).legacy_wrapper
  end

  def test_forwarding_does_not_alias_the_gem_namespace_itself
    refute_same ::Aws, Cdo::Aws
  end

  def test_a_wrapped_service_never_falls_through_to_the_gem
    error = assert_raises(NameError) {Cdo::Aws.const_missing(Cdo::Aws::WRAPPED.first)}
    assert_includes error.message, 'Code.org wrapper'
  end

  def test_an_unknown_service_raises_rather_than_resolving_somewhere_odd
    assert_raises(NameError) {Cdo::Aws::NoSuchService}
  end

  def test_forwarding_does_not_reach_top_level_constants
    assert_raises(NameError) {Cdo::Aws::String}
  end
end

module Cdo
  # Lexically inside module Cdo, the only place these spellings can diverge.
  module NamespaceProbe
    def self.gem_client = Aws::S3::Client
    def self.legacy_wrapper = AWS::EC2
  end
end
