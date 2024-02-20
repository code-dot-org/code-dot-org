require_relative '../../test_helper'
require_relative '../../../i18n/utils/sync_down_base'

describe I18n::Utils::SyncDownBase do
  let(:described_class) {I18n::Utils::SyncDownBase}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  describe '.config' do
    let(:config) {described_class.send(:config)}

    describe '#crowdin_project' do
      let(:crowdin_project) {config.crowdin_project}

      it 'returns default Crowdin project' do
        _(crowdin_project).must_equal 'codeorg'
      end

      context 'when new value is set' do
        let(:described_class) do
          Class.new(I18n::Utils::SyncDownBase) do
            config.crowdin_project = 'new_crowdin_project'
          end
        end

        it 'returns new value' do
          _(crowdin_project).must_equal 'new_crowdin_project'
        end
      end
    end

    describe '#download_paths' do
      let(:download_paths) {config.download_paths}

      it 'returns empty array' do
        _(download_paths).must_equal []
      end

      context 'when new value is pushed' do
        let(:described_class) do
          Class.new(I18n::Utils::SyncDownBase) do
            config.download_paths << 'new_download_path'
          end
        end

        it 'returns array with new value' do
          _(download_paths).must_equal ['new_download_path']
        end
      end
    end
  end

  describe '.parse_options' do
    let(:parse_options) {described_class.parse_options}

    it 'returns default options' do
      _(parse_options).must_equal({testing: false})
    end

    describe ':testing' do
      let(:option_testing) {parse_options[:testing]}

      context 'when "-t" command line option is set' do
        before do
          ARGV << '-t'
        end

        it 'returns true' do
          _(option_testing).must_equal true
        end
      end

      context 'when "--testing" command line option is set' do
        before do
          ARGV << '--testing'
        end

        it 'returns true' do
          _(option_testing).must_equal true
        end
      end
    end
  end

  describe '.perform' do
    let(:perform) {described_class.perform}

    before do
      I18n::Metrics.stubs(:report_runtime).yields(nil)
    end

    it 'creates new instance with command-line options and calls #perform' do
      expected_options = {testing: true}
      sync_down_instance = mock

      described_class.expects(:parse_options).returns(expected_options)
      described_class.expects(:new).with(**expected_options).returns(sync_down_instance)

      sync_down_instance.expects(:resource_name).once
      sync_down_instance.expects(:perform).once

      perform
    end

    it 'calls report_runtime metrics with class name' do
      I18n::Metrics.expects(:report_runtime).with(described_class.name, 'sync-down').once
      perform
    end

    context 'when class name contains i18n resource name' do
      module I18n
        module Resources
          module ResourceParent
            module ResourceChild
              class SyncDown < I18n::Utils::SyncDownBase
              end
            end
          end
        end
      end

      let(:described_class) {I18n::Resources::ResourceParent::ResourceChild::SyncDown}

      it 'calls report_runtime metrics with i18n resource name' do
        I18n::Metrics.expects(:report_runtime).with('ResourceParent::ResourceChild', 'sync-down').once
        perform
      end
    end
  end

  describe '#perform' do
    let(:perform) {described_instance.send(:perform)}

    let(:crowdin_src) {'expected_source_file.json'}
    let(:dest_subdir) {'expected_dest_subdir'}
    let(:config) {stub(download_paths: [I18n::Utils::SyncDownBase::DownloadPath.new(crowdin_src: crowdin_src, dest_subdir: dest_subdir)])}

    let(:resource_name) {'expected_resource_name'}
    let(:crowdin_project) {'expected_crowdin_project'}

    let(:source_file_id) {'expected_source_file_id'}
    let(:source_file_path) {'expected_source_file_path'}
    let(:source_file_data) {{'id' => source_file_id, 'path' => source_file_path}}

    let(:crowdin_language_id) {'uk'}
    let(:locale) {'uk-UA'}

    let(:cdo_language) {{crowdin_code_s: crowdin_language_id, locale_s: locale}}
    let(:crowdin_client) {stub(:crowdin_client)}

    before do
      described_instance.stubs(:config).returns(config)
      described_instance.stubs(:resource_name).returns(resource_name)
      described_instance.stubs(:crowdin_project).returns(crowdin_project)
      described_instance.stubs(:crowdin_client).returns(crowdin_client)
      described_instance.stubs(:cdo_languages).returns([cdo_language])
      described_instance.stubs(:source_files).with(crowdin_src).returns([source_file_data])
    end

    it 'downloads the source file translation' do
      expected_dest_path = CDO.dir('i18n/crowdin', locale, dest_subdir, source_file_path)

      crowdin_client.
        expects(:download_translation).
        with(source_file_id, crowdin_language_id, expected_dest_path, etag: nil).
        once

      perform
    end

    describe 'translation etags saving' do
      let(:old_translation_etag) {'old_translation_etag'}
      let(:i18n_resource_etags_path) {CDO.dir('bin/i18n/crowdin/etags', "#{resource_name}.#{crowdin_project}.json")}

      before do
        FileUtils.mkdir_p File.dirname(i18n_resource_etags_path)
        File.write i18n_resource_etags_path, JSON.dump({locale => {source_file_path => old_translation_etag}})
      end

      it 'saves new translation etags' do
        expected_dest_path = CDO.dir('i18n/crowdin', locale, dest_subdir, source_file_path)
        new_translation_etag = 'new_translation_etag'

        crowdin_client.
          stubs(:download_translation).
          with(source_file_id, crowdin_language_id, expected_dest_path, etag: old_translation_etag).
          returns(new_translation_etag)

        perform

        _(JSON.load_file(i18n_resource_etags_path)).must_equal({locale => {source_file_path => new_translation_etag}})
      end
    end

    context 'when download source is a dir' do
      let(:crowdin_src) {'/expected_source_dir'}
      let(:dest_subdir) {nil}

      it 'downloads the source file translation' do
        expected_dest_path = CDO.dir('i18n/crowdin', locale, source_file_path)

        crowdin_client.
          expects(:download_translation).
          with(source_file_id, crowdin_language_id, expected_dest_path, etag: nil).
          once

        perform
      end
    end
  end

  describe '#crowdin_project' do
    let(:crowdin_project) {described_instance.send(:crowdin_project)}

    let(:crowdin_prod_project) {'expected_crowdin_prod_project'}
    let(:crowdin_test_project) {'expected_crowdin_test_project'}

    let(:config) {stub(crowdin_project: crowdin_prod_project)}
    let(:options) {stub(testing: is_testing)}

    let(:is_testing) {false}

    before do
      CDO.stubs(:crowdin_project_test_mapping).returns({crowdin_prod_project => crowdin_test_project})
      described_class.stubs(:config).returns(config)
      described_instance.stubs(:options).returns(options)
    end

    it 'returns Crowdin project from config' do
      _(crowdin_project).must_equal crowdin_prod_project
    end

    context 'when testing' do
      let(:is_testing) {true}

      it 'returns test Crowdin project from mapping' do
        _(crowdin_project).must_equal crowdin_test_project
      end
    end
  end

  describe '#crowdin_client' do
    let(:crowdin_client) {described_instance.send(:crowdin_client)}

    let(:expected_crowdin_project) {'expected_crowdin_project'}

    before do
      described_instance.stubs(:crowdin_project).returns(expected_crowdin_project)
    end

    it 'returns I18n Crowdin client until instance' do
      expected_i18n_utils_crowdin_client_instance = 'expected_i18n_utils_crowdin_client_instance'

      I18n::Utils::CrowdinClient.
        expects(:new).
        with(project: expected_crowdin_project).
        returns(expected_i18n_utils_crowdin_client_instance)

      _(crowdin_client).must_equal expected_i18n_utils_crowdin_client_instance
    end
  end

  describe '#cdo_languages' do
    let(:cdo_languages) {described_instance.send(:cdo_languages)}

    let(:crowdin_client) {stub(:crowdin_client)}

    before do
      described_instance.stubs(:crowdin_client).returns(crowdin_client)
    end

    it 'returns CDO languages supported by the Crowdin project' do
      available_crowdin_lang_id = 'uk'

      crowdin_client.expects(:get_project).returns('targetLanguages' => [{'id' => available_crowdin_lang_id}])

      _(cdo_languages.first).must_be_instance_of CdoLanguages
      _(cdo_languages.map {|lang| lang[:crowdin_code_s]}).must_equal [available_crowdin_lang_id]
    end
  end

  describe '#source_files' do
    let(:source_files) {described_instance.send(:source_files, crowdin_src)}

    let(:crowdin_src) {nil}

    let(:crowdin_client) {stub(:crowdin_client)}

    before do
      described_instance.stubs(:crowdin_client).returns(crowdin_client)
    end

    it 'returns data of all the source files in the root dir' do
      source_file1_data = {'path' => 'expected_source_file1_path'}
      source_file2_data = {'path' => 'expected_source_file2_path'}

      crowdin_client.expects(:list_source_files).with(crowdin_src).returns([source_file2_data, source_file1_data])

      _(source_files).must_equal [source_file1_data, source_file2_data]
    end

    context 'when the download source is a file' do
      let(:crowdin_src) {'expected_crowdin_source_file.json'}

      it 'returns source file data' do
        source_file_data = 'expected_source_file_data'

        crowdin_client.expects(:get_source_file).with(crowdin_src).returns(source_file_data)

        _(source_files).must_equal [source_file_data]
      end
    end

    context 'when the download source is a dir' do
      let(:crowdin_src) {'/expected_crowdin_source_path'}

      it 'returns data of all the source files in the dir' do
        source_files_data = ['path' => 'expected_source_file_data']

        crowdin_client.expects(:list_source_files).with(crowdin_src).returns(source_files_data)

        _(source_files).must_equal source_files_data
      end
    end
  end
end
