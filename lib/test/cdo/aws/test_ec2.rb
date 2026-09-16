require_relative '../../test_helper'
require 'cdo/aws/ec2'

describe AWS::EC2 do
  let(:described_class) {AWS::EC2}

  # Reset memoized variables to ensure fresh metadata lookups
  before do
    [:@instance_id, :@region, :@account_id, :@local_ipv4, :@instance_type, :@availability_zone, :@hourly_rates].each do |var|
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

  describe '.local_ipv4' do
    it 'returns the private IPv4 address of the current EC2 instance' do
      mock_token_resp = mock {stubs(code: '200', body: 'test_token')}
      mock_ip_resp = mock {stubs(code: '200', body: '10.0.1.23')}

      described_class.stubs(:http_request).
        with {|method, uri, _| method == Net::HTTP::Put && uri.path.include?('token')}.
        returns(mock_token_resp)

      described_class.stubs(:http_request).
        with {|method, uri, _| method == Net::HTTP::Get && uri.path.include?('local-ipv4')}.
        returns(mock_ip_resp)

      _(described_class.local_ipv4).must_equal '10.0.1.23'
    end
  end

  describe '.hourly_rate' do
    # A trimmed shape of one AWS Price List product document.
    let(:product_json) do
      {
        'terms' => {
          'OnDemand' => {
            'ABC.JRTCKXETXF' => {
              'priceDimensions' => {
                'ABC.JRTCKXETXF.6YS6EN2CT7' => {
                  'pricePerUnit' => {'USD' => '0.192000000'}
                }
              }
            }
          }
        }
      }.to_json
    end

    it 'returns the on-demand USD/hour and memoizes the query' do
      pricing_client = mock
      pricing_client.expects(:get_products).once.returns(stub(price_list: [product_json]))
      described_class.stubs(:pricing_client).returns(pricing_client)

      _(described_class.hourly_rate(instance_type: 'm5.xlarge', region: 'us-east-1')).must_be_close_to 0.192
      # Second call is served from the memo, not a second API query.
      _(described_class.hourly_rate(instance_type: 'm5.xlarge', region: 'us-east-1')).must_be_close_to 0.192
    end

    it 'defaults to this instance type and region' do
      described_class.stubs(:instance_type).returns('c5.large')
      described_class.stubs(:region).returns('us-west-2')
      pricing_client = mock
      pricing_client.expects(:get_products).
        with {|args| args[:filters].include?(type: 'TERM_MATCH', field: 'instanceType', value: 'c5.large')}.
        returns(stub(price_list: [product_json]))
      described_class.stubs(:pricing_client).returns(pricing_client)

      _(described_class.hourly_rate).must_be_close_to 0.192
    end

    it 'returns nil without a resolvable type or region' do
      described_class.stubs(:instance_type).returns(nil)
      described_class.stubs(:region).returns(nil)
      _(described_class.hourly_rate).must_be_nil
    end

    it 'returns nil on an empty price list' do
      described_class.stubs(:pricing_client).returns(stub(get_products: stub(price_list: [])))
      _(described_class.hourly_rate(instance_type: 'nonexistent.type', region: 'us-east-1')).must_be_nil
    end

    it 'returns nil on an API error' do
      pricing_client = mock
      pricing_client.stubs(:get_products).raises(StandardError, 'boom')
      described_class.stubs(:pricing_client).returns(pricing_client)
      _(described_class.hourly_rate(instance_type: 'm5.xlarge', region: 'us-east-1')).must_be_nil
    end
  end

  describe '.account_id' do
    let(:mock_token_resp) {mock {stubs(code: '200', body: 'test_token')}}

    before do
      # Common stub for the token request needed by all metadata calls
      described_class.stubs(:http_request).
        with {|method, uri, _| method == Net::HTTP::Put && uri.path.include?('token')}.
        returns(mock_token_resp)
    end

    it 'returns current AWS Account ID by parsing the identity-credentials JSON' do
      json_body = {
        'Code' => 'Success',
        'LastUpdated' => '2023-10-27T10:00:00Z',
        'AccountId' => '123456789012'
      }.to_json

      mock_info_resp = mock {stubs(code: '200', body: json_body)}

      described_class.stubs(:http_request).
        with {|method, uri, _| method == Net::HTTP::Get && uri.path.include?('identity-credentials/ec2/info')}.
        returns(mock_info_resp)

      _(described_class.account_id).must_equal '123456789012'
    end

    it 'returns nil if the metadata response is invalid JSON' do
      mock_bad_resp = mock {stubs(code: '200', body: 'not-json-content')}

      described_class.stubs(:http_request).
        with {|method, uri, _| method == Net::HTTP::Get && uri.path.include?('identity-credentials')}.
        returns(mock_bad_resp)

      _(described_class.account_id).must_be_nil
    end

    it 'returns nil if the metadata service returns a 404' do
      mock_404_resp = mock {stubs(code: '404', body: 'Not Found')}

      described_class.stubs(:http_request).
        with {|method, uri, _| method == Net::HTTP::Get && uri.path.include?('identity-credentials')}.
        returns(mock_404_resp)

      _(described_class.account_id).must_be_nil
    end
  end
end
