require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/standards/sync_in'

describe I18n::Resources::Dashboard::Standards::SyncIn do
  let(:described_class) {I18n::Resources::Dashboard::Standards::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    DatabaseCleaner.start
    FakeFS.with_fresh {test.call}
    DatabaseCleaner.clean
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:run_process) {described_instance.process}

    let(:framework_shortcode) {'expected-framework-shortcode'}
    let(:framework_name) {'expected-framework-name'}
    let(:standard_category_shortcode) {'expected-standard-category-shortcode'}
    let(:standard_category_desc) {'expected-standard-category-desc'}
    let(:standard_shortcode) {'expected-standard-shortcode'}
    let(:standard_desc) {'expected-standard-desc'}

    let(:i18n_source_file_path) {CDO.dir("i18n/locales/source/standards/#{framework_shortcode}.json")}

    before do
      Framework.destroy_all
      StandardCategory.destroy_all
      Standard.destroy_all

      framework = FactoryBot.create(
        :framework,
        shortcode: framework_shortcode,
        name: framework_name,
      )
      standard_category = FactoryBot.create(
        :standard_category,
        framework: framework,
        shortcode: standard_category_shortcode,
        description: standard_category_desc,
      )
      FactoryBot.create(
        :standard,
        framework: framework,
        category: standard_category,
        shortcode: standard_shortcode,
        description: standard_desc,
      )
    end

    it 'prepares i18n source file for each framework' do
      expected_i18n_source_file_content = <<~JSON.strip
        {
          "name": "#{framework_name}",
          "categories": {
            "#{standard_category_shortcode}": {
              "description": "#{standard_category_desc}"
            }
          },
          "standards": {
            "#{standard_shortcode}": {
              "description": "#{standard_desc}"
            }
          }
        }
      JSON

      run_process

      assert File.exist?(i18n_source_file_path)
      assert_equal expected_i18n_source_file_content, File.read(i18n_source_file_path)
    end
  end
end
