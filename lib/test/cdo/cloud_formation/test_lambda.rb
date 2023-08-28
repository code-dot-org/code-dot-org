require_relative '../../test_helper'

require 'cdo/cloud_formation/lambda'

class CdoCloudFormationLambdaTest < Minitest::Test
  include Cdo::CloudFormation::Lambda

  def test_basic_custom_resource_object
    result = JSON.parse(lambda_custom_resource('TestFunction'))

    expected_service_token = {"Fn::Sub" => "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:TestFunction"}

    assert_equal 'Custom::TestFunction', result['Type']
    assert_nil result['DependsOn']
    assert_equal expected_service_token, result['Properties']['ServiceToken']
  end

  def test_custom_resource_with_depends_on
    result = JSON.parse(
      lambda_custom_resource('TestFunction',
        DependsOn: 'SomeOtherResource'
      )
    )

    expected_service_token = {"Fn::Sub" => "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:TestFunction"}

    assert_equal 'Custom::TestFunction', result['Type']
    assert_equal 'SomeOtherResource', result['DependsOn']
    assert_equal expected_service_token, result['Properties']['ServiceToken']
  end
end
