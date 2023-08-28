require_relative '../../test_helper'
require 'cdo/rake_utils'

require 'cdo/cloud_formation/lambda'

class CdoCloudFormationLambdaTest < Minitest::Test
  include Cdo::CloudFormation::Lambda

  def setup
    RakeUtils.stubs(:yarn_install)
  end

  def test_inline_js_lambda_stringifies_file_content
    File.stubs(:read).returns("const test = 'hello';")
    result = inline_js_lambda('file.js', uglify: false)

    assert_equal "const test = 'hello';", JSON.parse(result)
  end

  def test_inline_js_lambda_uglifies_content
    File.stubs(:read)

    # stub system call to `npx`
    expects(:`).with("npx uglifyjs --compress --mangle -- lambdas/inline/file.js").once.returns("const test='world';")

    result = inline_js_lambda('file.js')
    assert_equal "const test='world';", JSON.parse(result)
  end

  def test_inline_js_lambda_rejects_big_files
    large_content = 'a' * (ZIPFILE_MAX + 1)
    File.stubs(:read).returns(large_content)

    assert_raises(RuntimeError) do
      inline_js_lambda('large_file.js', uglify: false)
    end
  end

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
