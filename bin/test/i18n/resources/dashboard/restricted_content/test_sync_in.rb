require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/restricted_content/sync_in'

describe I18n::Resources::Dashboard::RestrictedContent::SyncIn do
  let(:described_class) {I18n::Resources::Dashboard::RestrictedContent::SyncIn}
  let(:described_instance) {described_class.new}

  let(:origin_i18n_file_path) {CDO.dir('dashboard/config/locales/restricted.en.yml')}
  let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/dashboard/restricted.yml')}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:run_process) {described_instance.process}

    let(:origin_i18n_file_data) {'expected_origin_i18n_file_data'}

    before do
      FileUtils.mkdir_p File.dirname(origin_i18n_file_path)
      File.write(origin_i18n_file_path, origin_i18n_file_data)
    end

    it 'prepares the i18n source file' do
      run_process

      assert File.exist?(i18n_source_file_path)
      assert_equal origin_i18n_file_data, File.read(i18n_source_file_path)
    end
  end
end
