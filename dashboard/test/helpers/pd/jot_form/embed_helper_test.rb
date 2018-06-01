require 'test_helper'

module Pd
  module JotForm
    class EmbedHelperTest < ActionView::TestCase
      include EmbedHelper

      test 'embed_jotform' do
        embed_tag = embed_jotform(101, firstQuestion: 'answer 1', secondQuestion: 'answer 2', withPlus: 'a+b')
        expected_src =
          'https://form.jotform.com/jsform/101?firstQuestion=answer+1&amp;secondQuestion=answer+2&amp;withPlus=a%7BplusSign%7Db'

        assert_equal(
          "<script src=\"#{expected_src}\"></script>",
          embed_tag
        )
      end

      test 'sanitize_value replaces plus sign' do
        assert_equal 'before {plusSign} after', sanitize_value('before + after')
        assert_equal 'dev{plusSign}tag@code.org', sanitize_value('dev+tag@code.org')
      end
    end
  end
end
