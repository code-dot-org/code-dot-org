require 'test_helper'
require 'hashing_utils'

class HashingUtilsTest < ActiveSupport::TestCase
  test 'hash a hash' do
    h = {a: 1, b: 'foo', c: false, d: [4, 5, 6]}
    assert_equal '322a438e16052716f77670602a1fffad', HashingUtils.ruby_hash_to_md5_hash(h)
  end

  test 'order doesnt matter' do
    h1 = {a: 1, b: 2}
    h2 = {b: 2, a: 1}
    assert_equal HashingUtils.ruby_hash_to_md5_hash(h1), HashingUtils.ruby_hash_to_md5_hash(h2)
  end
end
