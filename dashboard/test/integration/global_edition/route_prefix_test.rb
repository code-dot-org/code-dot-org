# frozen_string_literal: true

require 'test_helper'

class GlobalEditionRoutePrefixTest < ActionDispatch::IntegrationTest
  describe 'route helper' do
    subject(:home_path) {Rails.application.routes.url_helpers.home_path(**url_options)}

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
      _home_path.must_equal "/#{ge_region}/#{ge_locale}/home"
    end

    context 'when no GE region' do
      let(:ge_region) {nil}

      it 'generates normal prefixless path' do
        _home_path.must_equal '/home'
      end
    end

    context 'when url options contain :script_name' do
      let(:url_options) {{script_name:}}

      let(:script_name) {'/custom_script_name'}

      it 'generates path without adding GE prefix' do
        _home_path.must_equal "#{script_name}/home"
      end

      context 'and it is nil' do
        let(:script_name) {nil}

        it 'generates path without adding GE prefix' do
          _home_path.must_equal '/home'
        end
      end
    end
  end
end
