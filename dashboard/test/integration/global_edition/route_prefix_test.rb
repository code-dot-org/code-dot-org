# frozen_string_literal: true

require 'test_helper'

class GlobalEditionRoutePrefixTest < ActionDispatch::IntegrationTest
  describe 'route helper' do
    subject(:generated_url) {Rails.application.routes.url_helpers.public_send(url_helper, **url_options)}

    let(:url_helper) {:home_path}
    let(:url_path) {'/home'}
    let(:url_options) {{}}
    let(:ge_region) {'in'}
    let(:ge_locale) {'hi'}
    let(:locale) {'hi-IN'}

    let!(:original_region) {Cdo::GlobalEdition.current_region}
    let!(:original_locale) {I18n.locale}

    before do
      Cdo::GlobalEdition.current_region = ge_region
      I18n.locale = locale
    end

    after do
      Cdo::GlobalEdition.current_region = original_region
      I18n.locale = original_locale
    end

    it 'generates path with GE prefix' do
      _generated_url.must_equal "/#{ge_region}/#{ge_locale}#{url_path}"
    end

    context 'when GE region has a single locale' do
      let(:ge_region) {'fa'}
      let(:locale) {'fa-IR'}

      it 'generates path with GE region prefix' do
        _generated_url.must_equal "/#{ge_region}#{url_path}"
      end
    end

    context 'when GE region is the default region' do
      let(:ge_region) {Cdo::GlobalEdition::DEFAULT_REGION}
      let(:locale) {Cdo::GlobalEdition::DEFAULT_LOCALE}

      it 'generates normal prefixless path for default locale' do
        _generated_url.must_equal url_path
      end

      context 'and locale is not the default locale' do
        let(:locale) {(Cdo::GlobalEdition.region_locales(ge_region) - [Cdo::GlobalEdition::DEFAULT_LOCALE]).first}
        let(:ge_locale) {Cdo::GlobalEdition.url_locale_segment(locale)}

        it 'generates path with default region locale prefix' do
          _(locale).wont_be_nil
          _generated_url.must_equal "/#{ge_region}/#{ge_locale}#{url_path}"
        end
      end
    end

    context 'when no GE region' do
      let(:ge_region) {nil}

      it 'generates normal prefixless path' do
        _generated_url.must_equal url_path
      end
    end

    context 'when route is excluded' do
      let(:url_helper) {:health_check_path}
      let(:url_path) {'/health_check'}

      it 'generates path without region prefix' do
        _generated_url.must_equal url_path
      end
    end

    context 'when url options contain :script_name' do
      let(:url_options) {{script_name:}}

      let(:script_name) {'/custom_script_name'}

      it 'generates path with GE prefix at the root' do
        _generated_url.must_equal "/#{ge_region}/#{ge_locale}#{script_name}#{url_path}"
      end
    end

    context 'when url options contain :script_name with different valid GE region prefix' do
      let(:url_options) {{script_name: '/ua'}}

      it 'generates path with prefix for current GE region' do
        _generated_url.must_equal "/#{ge_region}/#{ge_locale}#{url_path}"
      end
    end
  end
end
