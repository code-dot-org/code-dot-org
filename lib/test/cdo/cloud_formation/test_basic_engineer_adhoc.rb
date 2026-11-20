ENV['UNIT_TEST'] = '1'
ENV['RACK_ENV'] = 'test'

require_relative '../../../../deployment'
require 'minitest/autorun'
require 'mocha/minitest'
require 'cdo/aws/cloud_formation'
require 'cdo/cloud_formation/cdo_app'
require 'cdo/cloud_formation/tail_logs'

class BasicEngineerAdhocTest < Minitest::Test
  def setup
    @app = Cdo::CloudFormation::CdoApp.allocate
    @app.instance_variable_set(:@stack_name, 'adhoc-be-policy-test')
    @app.instance_variable_set(:@filename, aws_dir('cloudformation/cloud_formation_stack.yml.erb'))
    @app.instance_variable_set(:@daemon, 'WebServer')
    @app.instance_variable_set(:@tags, [])
    @app.instance_variable_set(:@log_resource_filter, [])
    @app.instance_variable_set(:@options, OpenStruct.new(
                                            basic_engineer: true, branch: 'policy-test', commit: 'abcdef',
                                            frontends: false, database: false, cdn_enabled: false,
                                            load_balancer: false, alarms: false, console: false, domain: 'cdn-code.org'
    )
)
    @app.dry_run = true
    @app.stubs(:rack_env).returns(:adhoc)
    @app.stubs(:rack_env?).returns(false)
    @app.stubs(:rack_env?).with(:adhoc).returns(true)
    CDO.stubs(:chef_local_mode).returns(true)
    CDO.stubs(:hostedzone_id).returns('ZEXAMPLE')
  end

  def test_fixed_profile_replaces_template_iam_resources
    rendered = @app.render
    resources = YAML.safe_load(rendered, permitted_classes: [Date])['Resources']
    refute(resources.values.any? {|r| r['Type'].start_with?('AWS::IAM::')})
    assert_includes rendered, 'IamInstanceProfile: !ImportValue BasicEngineer-AdhocInstanceProfile'
    assert_equal 'required', resources['WebServer']['Properties']['MetadataOptions']['HttpTokens']
    assert_includes rendered, 'ssl/basic-engineer/certs/adhoc-be-policy-test.cdn-code.org'
    assert_includes rendered, 'adhoc/basic-engineer/chef/bootstrap-$STACK.sh'
    assert_includes rendered, '-p s3://cdo-dist/adhoc/basic-engineer/chef/policy-test.tar.gz'
  end

  def test_request_passes_the_restricted_execution_role
    identity = stub(account: '123456789012')
    Aws::STS::Client.stubs(:new).returns(stub(get_caller_identity: identity))
    request = AWS::CloudFormation.new(stack: @app).send(:base_options)
    assert_equal 'arn:aws:iam::123456789012:role/engineering/BasicEngineerAdhocCloudFormation', request[:role_arn]
  end

  def test_legacy_template_keeps_its_own_iam_resources
    @app.options.basic_engineer = false
    resources = YAML.safe_load(@app.render, permitted_classes: [Date])['Resources']
    assert_equal 'AWS::IAM::Role', resources['DaemonRole']['Type']
    assert_equal 'AWS::IAM::ManagedPolicy', resources['CDOPolicy']['Type']
    assert_equal 'AWS::IAM::InstanceProfile', resources['DaemonInstanceProfile']['Type']
  end

  def test_rejects_legacy_namespace_before_uploading_inputs
    @app.instance_variable_set(:@stack_name, 'adhoc-existing')
    Aws::S3::Client.expects(:new).never
    assert_raises(RuntimeError) {@app.render}
  end

  def test_rejects_full_stack_before_uploading_inputs
    @app.options.frontends = true
    Aws::S3::Client.expects(:new).never
    assert_raises(RuntimeError) {@app.render}
  end

  def test_admin_flag_cannot_select_admin_role_in_restricted_mode
    previous = ENV.fetch('ADMIN', nil)
    ENV['ADMIN'] = '1'
    assert_equal 'engineering/BasicEngineerAdhocCloudFormation', @app.execution_role_path
  ensure
    ENV['ADMIN'] = previous
  end

  def test_legacy_role_selection_and_artifact_paths_are_preserved
    previous = ENV.fetch('ADMIN', nil)
    ENV.delete('ADMIN')
    @app.options.basic_engineer = false
    assert_equal 'admin/CloudFormationService', @app.execution_role_path
    assert_equal Cdo::CloudFormation::CdoApp::CHEF_KEY, @app.chef_key
    ENV['ADMIN'] = '1'
    assert_equal 'admin/CloudFormationAdmin', @app.execution_role_path
  ensure
    ENV['ADMIN'] = previous
  end
end
