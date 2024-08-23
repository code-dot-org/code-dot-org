require_relative '../../test_helper'

describe AWS::EC2 do
  let(:described_class) {AWS::EC2}

  describe '.instance_id' do
    let(:instance_id) {described_class.instance_id}

    before do
      described_class.remove_instance_variable(:@instance_id) if described_class.instance_variable_defined?(:@instance_id)
    end

    it 'returns current AWS EC2 instance id' do
      VCR.use_cassette('aws/ec2/instance_id', record: :none) do
        _(instance_id).must_equal 'expected_aws_ec2_instance_id'
      end
    end

    context 'when not running on an AWS EC2 instance' do
      before do
        Net::HTTP.any_instance.stubs(:request_get).raises(Net::OpenTimeout)
      end

      it 'returns nil' do
        _(instance_id).must_be_nil
      end
    end
  end

  describe '.region' do
    let(:region) {described_class.region}

    before do
      described_class.remove_instance_variable(:@region) if described_class.instance_variable_defined?(:@region)
    end

    it 'returns current AWS EC2 region' do
      VCR.use_cassette('aws/ec2/region', record: :none) do
        _(region).must_equal 'expected_aws_ec2_region'
      end
    end

    context 'when not running on an AWS EC2 instance' do
      before do
        Net::HTTP.any_instance.stubs(:request_get).raises(Net::OpenTimeout)
      end

      it 'returns nil' do
        _(region).must_be_nil
      end
    end
  end
end
