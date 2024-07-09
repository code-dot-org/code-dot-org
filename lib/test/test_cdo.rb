require_relative 'test_helper'
require 'cdo'

describe CDO do
  let(:described_class) {CDO}

  describe '.aws_access?' do
    let(:aws_access?) {described_class.aws_access?}

    context 'in production' do
      before do
        CDO.stubs(:rack_env?).with(:production).returns(true)
      end

      it 'should return true' do
        _(aws_access?).must_equal true
      end

      context 'AWS_PROFILE is empty' do
        around do |test|
          Object.stub_const('ENV', ENV.to_hash.merge('AWS_PROFILE' => nil)) do
            test.call
          end
        end

        it 'should return true' do
          _(aws_access?).must_equal true
        end
      end

      context 'AWS_PROFILE has a value with "cdo"' do
        around do |test|
          Object.stub_const('ENV', ENV.to_hash.merge('AWS_PROFILE' => 'some-cdo')) do
            test.call
          end
        end

        it 'should return true' do
          _(aws_access?).must_equal true
        end
      end

      context 'AWS_PROFILE has an unrelated value instead' do
        around do |test|
          Object.stub_const('ENV', ENV.to_hash.merge('AWS_PROFILE' => 'some-other-thing')) do
            test.call
          end
        end

        it 'should return true' do
          _(aws_access?).must_equal true
        end
      end
    end

    context 'in development' do
      before do
        CDO.stubs(:rack_env?).with(:production).returns(false)
      end

      context 'AWS_PROFILE is empty' do
        around do |test|
          Object.stub_const('ENV', ENV.to_hash.merge('AWS_PROFILE' => nil)) do
            test.call
          end
        end

        it 'should return false' do
          _(aws_access?).must_equal false
        end
      end

      context 'AWS_PROFILE has a value with "cdo"' do
        around do |test|
          Object.stub_const('ENV', ENV.to_hash.merge('AWS_PROFILE' => 'some-cdo')) do
            test.call
          end
        end

        it 'should return true' do
          _(aws_access?).must_equal true
        end
      end

      context 'AWS_PROFILE has an unrelated value instead' do
        around do |test|
          Object.stub_const('ENV', ENV.to_hash.merge('AWS_PROFILE' => 'some-other-thing')) do
            test.call
          end
        end

        it 'should return false' do
          _(aws_access?).must_equal false
        end
      end
    end
  end
end

class CdoTest < Minitest::Test
  def test_curriculum_languages
    # DCDO request is cached, and only called once
    DCDO.expects(:get).returns([["es-mx", "Spanish"]])

    # includes languages in DCDO
    assert_includes CDO.curriculum_languages, "es-mx"

    # includes additional languages
    assert_includes CDO.curriculum_languages, "zh-tw"
  end

  def test_curriculum_url
    CDO.stubs(:curriculum_languages).returns(["es-mx"])

    # generates a locale-aware link for supported languages
    assert_equal CDO.curriculum_url("es-mx", "/test"), "https://curriculum.code.org/es-mx/test"

    # generates an unmodified link to unknown languages
    assert_equal CDO.curriculum_url("fa-ke", "test"), "https://curriculum.code.org/test"

    # leaves link as-is if host is already specified and non-CB
    assert_equal CDO.curriculum_url("es-mx", "https://code.org/test"), "https://code.org/test"

    # leaves link as-is if autocomplete_partial_path == false
    assert_equal CDO.curriculum_url("es-mx", "/test", autocomplete_partial_path: false), "/test"

    # correctly handles full CB link
    assert_equal CDO.curriculum_url("es-mx", "https://curriculum.code.org/test"), "https://curriculum.code.org/es-mx/test"

    # correctly handles full external links
    assert_equal CDO.curriculum_url("es-mx", "https://docs.google.com/document/d/1Bcx2VcvUd5d75w6ImCI4QtODs5RywRaWwno-gLngLIM/edit"), "https://docs.google.com/document/d/1Bcx2VcvUd5d75w6ImCI4QtODs5RywRaWwno-gLngLIM/edit"
    assert_equal CDO.curriculum_url("fa-ke", "https://www.youtube.com/playlist?list=PLB89L9PPGIrw79QH29j9wy_9rkgd7yY_W"), "https://www.youtube.com/playlist?list=PLB89L9PPGIrw79QH29j9wy_9rkgd7yY_W"
    assert_equal CDO.curriculum_url("en-us", "https://www.tynker.com/hour-of-code/nasa-moon-2-mars"), "https://www.tynker.com/hour-of-code/nasa-moon-2-mars"

    # correctly handles whitespace
    assert_equal CDO.curriculum_url("es-mx", "https://example.com/trailing_whitespace "), "https://example.com/trailing_whitespace%20"
    assert_equal CDO.curriculum_url("es-mx", "https://example.com/intermediate whitespace"), "https://example.com/intermediate%20whitespace"

    # correctly handles undefined uri
    assert_nil CDO.curriculum_url("es-mx", nil)
  end
end
