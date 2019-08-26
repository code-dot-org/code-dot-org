require 'test_helper'

module Pd
  module JotForm
    class EmbedHelperTest < ActionView::TestCase
      include EmbedHelper

      test 'jotform_iframe' do
        form_id = 101
        embed_tag = jotform_iframe(form_id, firstQuestion: 'answer 1', secondQuestion: 'answer 2', withPlus: 'a+b')
        expected_src =
          "https://form.jotform.com/#{form_id}?firstQuestion=answer+1&amp;secondQuestion=answer+2&amp;withPlus=a%7BplusSign%7Db"

        assert_equal(
          "<iframe id=\"JotFormIFrame-#{form_id}\" onload=\"window.parent.scrollTo(0,0)\" allowtransparency=\"true\" allowfullscreen=\"allowfullscreen\" allow=\"geolocation; microphone; camera\" sandbox=\"allow-forms allow-same-origin allow-scripts allow-top-navigation\" src=\"#{expected_src}\" frameborder=\"0\" style=\"width: 1px; min-width: 100%; height:539px; border:none;\" scrolling=\"no\"></iframe>",
          embed_tag
        )
      end

      test 'sanitize_value replaces plus sign' do
        assert_equal 'before {plusSign} after', sanitize_value('before + after')
        assert_equal 'dev{plusSign}tag@code.org', sanitize_value('dev+tag@code.org')
      end

      test 'form_in_experiment? works for strings' do
        assert form_in_experiment? '90986506471163'
        refute form_in_experiment? '90986506471164'
      end

      test 'form_in_experiment? works for integers' do
        assert form_in_experiment? 90_986_506_471_163
        refute form_in_experiment? 90_986_506_471_164
      end

      test 'form_in_experiment? safely returns false for nil' do
        refute form_in_experiment? nil
      end
    end
  end
end
