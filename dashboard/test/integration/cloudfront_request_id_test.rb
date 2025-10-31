# frozen_string_literal: true

require_relative '../test_helper'

class CloudFrontRequestIdTest < ActionDispatch::IntegrationTest
  test 'promotes CloudFront request id to X-Request-Id header' do
    cf_id = 'test-cloudfront-request-id'

    get '/', headers: {'X-Amz-Cf-Id' => cf_id}

    assert_equal cf_id, response.headers['X-Request-Id'],
      'Expected CloudFront request id to be forwarded as X-Request-Id'
  end

  test 'generates request id when CloudFront header missing' do
    get '/'

    assert response.headers['X-Request-Id'].present?,
      'Expected a request id to be generated when CloudFront header is absent'
  end
end
