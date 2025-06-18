require_relative 'test_helper'
require 'varnish_environment'

describe VarnishEnvironment do
  let(:app) {VarnishEnvironment.new!}

  describe 'helpers' do
    describe '.language_to_locale' do
      let(:language_to_locale) {app.language_to_locale(language)}

      context 'with a language value of fa' do
        let(:language) {'fa'}

        it 'returns fa-IR' do
          _(language_to_locale).must_equal 'fa-IR'
        end
      end

      context 'with a language value of en' do
        let(:language) {'en'}

        it 'returns en-US' do
          _(language_to_locale).must_equal 'en-US'
        end
      end

      context 'with a language value of es' do
        let(:language) {'es'}

        it 'returns es-ES' do
          _(language_to_locale).must_equal 'es-ES'
        end
      end

      context 'with a language value in a lowercase form such as cs-cz' do
        let(:language) {'cs-cz'}

        it 'returns cs-CZ' do
          _(language_to_locale).must_equal 'cs-CZ'
        end
      end

      context 'with a language value that in unknown' do
        let(:language) {'r2-D2'}

        it 'returns nil' do
          _(language_to_locale).must_be_nil
        end
      end

      context 'with a language value that has an invalid encoding' do
        let(:language) {URI.decode_uri_component('cs-CZ%C0%A7%C0%A2%2527%2522\'\"')}

        it 'returns nil' do
          _(language_to_locale).must_be_nil
        end
      end
    end
  end
end
