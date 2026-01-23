require_relative '../../test_helper'
require 'cdo/aws/ec2'

describe AWS::EC2 do
  let(:described_class) {AWS::EC2}

  # Reset memoized variables to ensure fresh metadata lookups
  before do
    [:@instance_id, :@region].each do |var|
      described_class.remove_instance_variable(var) if described_class.instance_variable_defined?(var)
    end
  end

  describe '.instance_id' do
    it 'returns current AWS EC2 instance id using IMDSv2' do
      # Setup mock response objects
      mock_token_resp = mock {stubs(code: '200', body: 'test_token')}
      mock_id_resp = mock {stubs(code: '200', body: 'i-0123456789f987654')}

      # Stub token request (PUT)
      # We use a block with .with to safely check the URI's path as a string
      described_class.stubs(:http_request).
        with {|method, uri, _| method == Net::HTTP::Put && uri.path.include?('token')}.
        returns(mock_token_resp)

      # Stub metadata request (GET)
      described_class.stubs(:http_request).
        with {|method, uri, _| method == Net::HTTP::Get && uri.path.include?('instance-id')}.
        returns(mock_id_resp)

      _(described_class.instance_id).must_equal 'i-0123456789f987654'
    end

    context 'when not running on an AWS EC2 instance' do
      it 'returns nil' do
        # To test that the code handles a failure, we simulate http_request
        # returning nil (which is what it does when it catches a StandardError).
        described_class.stubs(:http_request).returns(nil)

        _(described_class.instance_id).must_be_nil
      end
    end
  end

  describe '.region' do
    it 'returns current AWS EC2 region' do
      mock_token_resp = mock {stubs(code: '200', body: 'test_token')}
      mock_region_resp = mock {stubs(code: '200', body: 'us-west-2')}

      described_class.stubs(:http_request).
        with {|method, uri, _| method == Net::HTTP::Put && uri.path.include?('token')}.
        returns(mock_token_resp)

      described_class.stubs(:http_request).
        with {|method, uri, _| method == Net::HTTP::Get && uri.path.include?('region')}.
        returns(mock_region_resp)

      _(described_class.region).must_equal 'us-west-2'
    end
  end
end
