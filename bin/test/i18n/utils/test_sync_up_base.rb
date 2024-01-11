require_relative '../../test_helper'
require_relative '../../../i18n/utils/sync_up_base'

describe I18n::Utils::SyncUpBase do
  let(:described_class) {SyncUpBaseTest = Class.new(I18n::Utils::SyncUpBase)}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  describe '.config' do
    let(:config) {described_class.send(:config)}

    describe '#crowdin_project' do
      let(:crowdin_project) {config.crowdin_project}

      it 'returns default Crowdin project' do
        assert_equal 'codeorg', crowdin_project
      end

      context 'when new value is set' do
        let(:described_class) do
          Class.new(I18n::Utils::SyncUpBase) do
            config.crowdin_project = 'new_crowdin_project'
          end
        end

        it 'returns new value' do
          assert_equal 'new_crowdin_project', crowdin_project
        end
      end
    end

    describe '#source_paths' do
      let(:source_paths) {config.source_paths}

      it 'returns empty array' do
        assert_equal [], source_paths
      end

      context 'when new value is pushed' do
        let(:described_class) do
          Class.new(I18n::Utils::SyncUpBase) do
            config.source_paths << 'new_source_path'
          end
        end

        it 'returns array with new value' do
          assert_equal ['new_source_path'], source_paths
        end
      end
    end

    describe '#ignore_paths' do
      let(:ignore_paths) {config.ignore_paths}

      it 'returns empty array' do
        assert_equal [], ignore_paths
      end

      context 'when new value is pushed' do
        let(:described_class) do
          Class.new(I18n::Utils::SyncUpBase) do
            config.ignore_paths << 'new_ignored_path'
          end
        end

        it 'returns array with new value' do
          assert_equal ['new_ignored_path'], ignore_paths
        end
      end
    end
  end

  describe '.perform' do
    let(:perform) {described_class.perform}

    it 'creates new instance and calls #perform' do
      described_class.any_instance.expects(:perform).once
      perform
    end

    it 'calls report_runtime metrics with class name' do
      I18n::Metrics.expects(:report_runtime).with(described_class.name, 'sync-up').once
      perform
    end

    context 'when class name contains i18n resource name' do
      module I18n
        module Resources
          module ResourceParent
            module ResourceChild
              class SyncUp < I18n::Utils::SyncUpBase
              end
            end
          end
        end
      end

      let(:described_class) {I18n::Resources::ResourceParent::ResourceChild::SyncUp}

      it 'calls report_runtime metrics with i18n resource name' do
        I18n::Metrics.expects(:report_runtime).with('ResourceParent::ResourceChild', 'sync-up').once
        perform
      end
    end
  end

  describe '#perform' do
    let(:perform) {described_instance.send(:perform)}

    let(:config) {stub(crowdin_project: 'expected_crowdin_project')}

    let(:expected_crowdin_client) {stub}
    let(:expected_source_file_path) {'expected_source_file_path'}

    before do
      described_instance.stubs(:config).returns(config)
      described_instance.stubs(:crowdin_client).returns(expected_crowdin_client)
      described_instance.stubs(:source_files).returns([expected_source_file_path])
    end

    it 'uploads source file' do
      execution_sequence = sequence('execution')

      described_instance.expects(:crowdin_client).in_sequence(execution_sequence).returns(expected_crowdin_client)
      expected_crowdin_client.expects(:upload_source_file).with(expected_source_file_path).in_sequence(execution_sequence)

      perform
    end
  end

  describe '#config' do
    let(:config) {described_instance.send(:config)}

    let(:expected_class_config) {'expected_class_config'}

    before do
      described_class.expects(:config).returns(expected_class_config)
    end

    it 'returns class config' do
      assert_equal expected_class_config, config
    end
  end

  describe '#crowdin_project' do
    let(:crowdin_project) {described_instance.send(:crowdin_project)}

    let(:crowdin_prod_project) {'expected_crowdin_prod_project'}
    let(:crowdin_test_project) {'expected_crowdin_test_project'}

    let(:config) {stub(crowdin_project: crowdin_prod_project)}

    let(:is_testing) {false}

    before do
      CDO.stubs(:crowdin_project_test_mapping).returns({crowdin_prod_project => crowdin_test_project})
      described_instance.stubs(:config).returns(config)
      described_instance.stubs(:testing?).returns(is_testing)
    end

    it 'returns Crowdin project from config' do
      assert_equal crowdin_prod_project, crowdin_project
    end

    context 'when testing' do
      let(:is_testing) {true}

      it 'returns test Crowdin project from mapping' do
        assert_equal crowdin_test_project, crowdin_project
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

      I18n::Utils::CrowdinClient.expects(:new).with(expected_crowdin_project).returns(expected_i18n_utils_crowdin_client_instance)

      assert_equal expected_i18n_utils_crowdin_client_instance, crowdin_client
    end
  end

  describe '#source_files' do
    let(:source_files) {described_instance.send(:source_files)}

    let(:i18n_source_dir_path) {'/i18n/locales/sources/resource/'}

    let(:config) do
      stub(
        source_paths: [File.join(i18n_source_dir_path, '**/*.json')],
        ignore_paths: [File.join(i18n_source_dir_path, '**/ignored_*.json')],
      )
    end

    let(:expected_i18n_source_file_path) {File.join(i18n_source_dir_path, 'expected_i18n_source_file.json')}
    let(:ignored_i18n_source_file_path) {File.join(i18n_source_dir_path, 'ignored_i18n_source_file.json')}
    let(:unexpected_i18n_source_file_path) {File.join(i18n_source_dir_path, 'unexpected_i18n_source_file.yaml')}

    before do
      described_instance.stubs(:config).returns(config)

      FileUtils.mkdir_p(i18n_source_dir_path)
      FileUtils.touch(expected_i18n_source_file_path)
      FileUtils.touch(ignored_i18n_source_file_path)
      FileUtils.touch(unexpected_i18n_source_file_path)
    end

    it 'returns existing i18n source file paths from source paths config without ignored' do
      assert_equal [expected_i18n_source_file_path], source_files
    end
  end
end
