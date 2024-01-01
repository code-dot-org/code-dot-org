require_relative '../test_helper'
require_relative '../../i18n/metrics'

describe I18n::Metrics do
  let(:described_class) {I18n::Metrics}

  let(:cdo_ec2_instance_id_endpoint) {'expected_cdo_ec2_instance_id_endpoint'}
  let(:cdo_ec2_instance_id_endpoint_uri) {URI(cdo_ec2_instance_id_endpoint)}

  before do
    described_class.remove_instance_variable(:@machine_id) if described_class.instance_variable_get(:@machine_id)
    CDO.stubs(:ec2_instance_id_endpoint).returns(cdo_ec2_instance_id_endpoint)
    Net::HTTP.stubs(:get).with(cdo_ec2_instance_id_endpoint_uri)
    Cdo::Metrics.client = Aws::CloudWatch::Client.new(stub_responses: true)
  end

  describe '.machine_id' do
    it 'returns the machine id from the EC2 instance_id endpoint'  do
      expected_machine_id = 'expected_machine_id'

      Net::HTTP.expects(:get).with(cdo_ec2_instance_id_endpoint_uri).returns(expected_machine_id)

      assert_equal expected_machine_id, described_class.machine_id
    end

    context 'when an error occurred on getting machine_id from the EC2 instance_id endpoint' do
      it 'returns "local_machine"' do
        Net::HTTP.stubs(:get).with(cdo_ec2_instance_id_endpoint_uri).raises('expected_error')

        assert_equal 'local_machine', described_class.machine_id
      end
    end
  end

  describe '.log_metric' do
    let(:cdo_rack_env) {'expected_cdo_rack_env'}
    let(:machine_id) {'expected_machine_id'}

    let(:metric_name) {'expected_metric_name'}
    let(:metric_value) {'expected_metric_value'}
    let(:addtl_dimensions) {[]}
    let(:metric_units) {'None'}

    let(:expect_metric_logging) do
      expected_metric_attrs = {
        metric_name: metric_name,
        value: metric_value,
        dimensions: [
          *addtl_dimensions,
          {name: 'Environment', value: cdo_rack_env},
          {name: 'MachineId', value: machine_id},
        ],
        unit: metric_units
      }

      Cdo::Metrics.expects(:put_metric).with('I18n', expected_metric_attrs)
    end

    before do
      described_class.unstub(:log_metric)
      CDO.stubs(:rack_env).returns(cdo_rack_env)
      Net::HTTP.stubs(:get).with(cdo_ec2_instance_id_endpoint_uri).returns(machine_id)
    end

    it 'logs metric' do
      expect_metric_logging.once
      described_class.log_metric(metric_name, metric_value)
    end

    context 'when addtl dimension is provided' do
      let(:addtl_dimensions) {['expected_addtl_dimension']}

      it 'logs metric with the addtl dimension' do
        expect_metric_logging.once
        described_class.log_metric(metric_name, metric_value, addtl_dimensions)
      end
    end

    context 'when metric unit is provided' do
      let(:metric_units) {'expected_metric_units'}

      it 'logs metric with the metric unit' do
        expect_metric_logging.once
        described_class.log_metric(metric_name, metric_value, addtl_dimensions, metric_units)
      end
    end
  end

  describe '.report_runtime' do
    let(:method_name) {'expected_method_name'}
    let(:sync_step) {'expected_sync_step'}

    it 'logs the block runtime metric' do
      expected_runtime = 0.003
      expected_runtime_ms = expected_runtime * 1000
      expected_addtl_dimensions = [{name: 'MethodName', value: method_name}, {name: 'SyncStep', value: sync_step}]

      described_class.expects(:log_metric).with(:Runtime, expected_runtime_ms, expected_addtl_dimensions, 'Milliseconds').once

      described_class.report_runtime(method_name, sync_step) {sleep expected_runtime}
    end

    it 'returns the block execution result' do
      expected_block_result = 'expected_block_result'
      assert_equal(expected_block_result, described_class.report_runtime(method_name, sync_step) {expected_block_result})
    end
  end

  describe '.report_filesize' do
    let(:file_dir) {'expected_file_dir'}
    let(:file_name) {'expected_file_name'}
    let(:file_size) {'expected_file_size'}

    let(:file_path) {File.join(file_dir, file_name)}
    let(:sync_step) {'expected_sync_step'}

    before do
      File.stubs(:size).with(file_path).returns(file_size)
    end

    it 'logs the file size metric' do
      expected_addtl_dimensions = [{name: 'SyncStep', value: sync_step}, {name: 'FileName', value: file_name}, {name: 'FileDir', value: file_dir}]

      described_class.expects(:log_metric).with(:FileSize, file_size, expected_addtl_dimensions, 'Bytes').once

      described_class.report_filesize(file_path, sync_step)
    end
  end

  describe '.report_status' do
    let(:status) {true}
    let(:sync_step) {'expected_sync_step'}
    let(:message_arg) {'None'}
    let(:sync_component) {'None'}

    let(:expected_status_value) {1}
    let(:expect_metric_logging) do
      expected_addtl_dimensions = [
        {name: 'SyncStep', value: sync_step},
        {name: 'SyncComponent', value: sync_component},
        {name: 'Message', value: message_arg},
      ]
      described_class.expects(:log_metric).with(:Status, expected_status_value, expected_addtl_dimensions).once
    end

    it 'logs status metric with value 1' do
      expect_metric_logging.once
      described_class.report_status(status, sync_step)
    end

    context 'when status is false' do
      let(:status) {false}
      let(:expected_status_value) {0}

      it 'logs status metric with value 0' do
        expect_metric_logging.once
        described_class.report_status(status, sync_step)
      end
    end

    context 'when message is provided' do
      let(:message_arg) {'expected_message'}

      it 'logs metric with the message' do
        expect_metric_logging.once
        described_class.report_status(status, sync_step, message_arg)
      end
    end

    context 'when sync component is provided' do
      let(:sync_component) {'expected_sync_component'}

      it 'logs metric with the sync component' do
        expect_metric_logging.once
        described_class.report_status(status, sync_step, message_arg, sync_component)
      end
    end
  end
end
