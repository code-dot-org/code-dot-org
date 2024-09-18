require 'test_helper'

class GlobalEditionTest < ActionDispatch::IntegrationTest
  describe 'routing' do
    let(:global_page_path) {incubator_path}
    let(:ge_region) {'fa'}
    let(:ge_region_page_path) {File.join('/global', ge_region, global_page_path)}

    describe 'global page' do
      it 'is accessible' do
        get global_page_path

        assert_equal 200, status
        assert_equal global_page_path, path
        assert_select '#incubator-container'
      end

      context 'when ge_region cookie is set' do
        before do
          cookies[:ge_region] = ge_region
        end

        it 'redirects to region page' do
          get global_page_path

          assert_equal 302, status
          assert_redirected_to ge_region_page_path

          follow_redirect!

          assert_equal 200, status
          assert_equal ge_region_page_path, path
          assert_select '#incubator-container'
        end

        context 'if ge_region is unavailable' do
          let(:ge_region) {'aa'}

          it 'stays on global page' do
            get global_page_path

            assert_equal 200, status
            assert_equal global_page_path, path
            assert_select '#incubator-container'
          end
        end
      end
    end

    describe 'region page' do
      it 'is accessible' do
        get ge_region_page_path

        assert_equal 200, status
        assert_equal ge_region_page_path, path
        assert_select '#incubator-container'
      end

      it 'routing helpers generates region version of urls' do
        assert_change -> {incubator_path}, from: '/incubator', to: ge_region_page_path do
          get ge_region_page_path
        end
      end

      context 'when ge_region is unavailable' do
        let(:ge_region) {'aa'}

        it 'is not accessible' do
          actual_error = assert_raises(ActionController::RoutingError) {get ge_region_page_path}
          assert_equal %Q[No route matches [GET] "#{ge_region_page_path}"], actual_error.message
        end
      end
    end
  end
end
