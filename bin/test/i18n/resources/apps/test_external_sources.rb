require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/apps/external_sources'

class I18n::Resources::Apps::ExternalSourcesTest < Minitest::Test
  def test_sync_in
    exec_seq = sequence('execution')

    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/external-sources')).in_sequence(exec_seq)

    expected_ml_playground_dir = CDO.dir('i18n/locales/source/external-sources/ml-playground')
    FileUtils.expects(:mkdir_p).with(expected_ml_playground_dir).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('apps/node_modules/@code-dot-org/ml-playground/i18n/mlPlayground.json'), expected_ml_playground_dir).in_sequence(exec_seq)

    expected_datasets_dir = CDO.dir('i18n/locales/source/external-sources/ml-playground/datasets')
    expected_dataset_file_path = CDO.dir('i18n/locales/source/external-sources/ml-playground/datasets/test.json')
    FileUtils.expects(:mkdir_p).with(expected_datasets_dir).in_sequence(exec_seq)
    Dir.stubs(:[]).with(CDO.dir('apps/node_modules/@code-dot-org/ml-playground/public/datasets/*.json')).returns([expected_dataset_file_path])
    FileUtils.expects(:cp).with(expected_dataset_file_path, expected_datasets_dir).in_sequence(exec_seq)

    JSON.stubs(:load_file).with(CDO.dir('apps/node_modules/@code-dot-org/ml-playground/public/datasets-manifest.json')).returns(
      {
        'datasets' => [
          {
            'id'   => 'manifest-id',
            'name' => 'Manifest name'
          }
        ]
      }
    )
    Dir.stubs(:[]).with(CDO.dir('i18n/locales/source/external-sources/ml-playground/datasets/*')).returns([expected_dataset_file_path])
    JSON.stubs(:load_file).with(expected_dataset_file_path).returns(
      {
        'name' => 'manifest-id',
        'card' => {
          'description' => 'Card desc',
          'context' => {
            'potentialUses'    => 'Card -> context -> potentialUses',
            'potentialMisuses' => 'Card -> context -> potentialMisuses'
          }
        },
        'fields' => [
          'id'          => 'field-id',
          'description' => 'Field desc'
        ]
      }
    )
    File.expects(:write).with(
      expected_dataset_file_path,
      <<-JSON.strip.gsub(/^ {8}/, '')
        {
          "fields": {
            "field-id": {
              "id": "field-id",
              "description": "Field desc"
            }
          },
          "card": {
            "description": "Card desc",
            "context": {
              "potentialUses": "Card -> context -> potentialUses",
              "potentialMisuses": "Card -> context -> potentialMisuses"
            }
          },
          "name": "Manifest name"
        }
      JSON
    ).in_sequence(exec_seq)

    I18n::Resources::Apps::ExternalSources.sync_in
  end
end
