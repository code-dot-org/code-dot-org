require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/docs/sync_in'

describe I18n::Resources::Dashboard::Docs::SyncIn do
  let(:described_class) {I18n::Resources::Dashboard::Docs::SyncIn}
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

    let(:programming_env_name) {'expected_programming_env_name'}
    let(:programming_env) {FactoryBot.build_stubbed(:programming_environment, name: programming_env_name)}
    let(:programming_env_i18n_data) {'expected_programming_env_i18n_data'}

    let(:i18n_source_file_path) {CDO.dir("i18n/locales/source/docs/#{programming_env_name}.json")}
    let(:i18n_original_file_path) {CDO.dir("i18n/locales/original/docs/#{programming_env_name}.json")}

    before do
      described_instance.stubs(:programming_envs).returns([programming_env])
      described_instance.stubs(:i18n_data_of).with(programming_env).returns(programming_env_i18n_data)
    end

    let(:expect_programming_env_i18n_source_file_creation) do
      I18nScriptUtils.expects(:write_json_file).with(i18n_source_file_path, programming_env_i18n_data)
    end
    let(:expect_programming_env_i18n_source_file_backup_creation) do
      I18nScriptUtils.expects(:copy_file).with(i18n_source_file_path, i18n_original_file_path)
    end
    let(:expect_programming_env_i18n_source_file_redaction) do
      RedactRestoreUtils.expects(:redact).with(i18n_source_file_path, i18n_source_file_path, %w[visualCodeBlock link resourceLink])
    end

    it 'prepares the i18n source file for the Programming Environment' do
      execution_sequence = sequence('execution')

      expect_programming_env_i18n_source_file_creation.in_sequence(execution_sequence)
      expect_programming_env_i18n_source_file_backup_creation.in_sequence(execution_sequence)
      expect_programming_env_i18n_source_file_redaction.in_sequence(execution_sequence)

      run_process
    end
  end

  describe '#programming_envs' do
    let(:programming_envs) {described_instance.send(:programming_envs)}

    let(:translatable_programming_env_a) {FactoryBot.create(:programming_environment, name: 'a')}
    let(:translatable_programming_env_b) {FactoryBot.create(:programming_environment, name: 'b')}
    let(:untranslatable_programming_env) {FactoryBot.create(:programming_environment)}

    before do
      # Creates ProgrammingEnvironment records
      untranslatable_programming_env
      translatable_programming_env_b
      translatable_programming_env_a
    end

    it 'returns only translatable ProgrammingEnvironment records ordered by name' do
      described_class.stub_const(:TRANSLATABLE_PROGRAMMING_ENVS, [translatable_programming_env_b.name, translatable_programming_env_a.name]) do
        assert_equal [translatable_programming_env_a, translatable_programming_env_b], programming_envs
      end
    end
  end

  describe '#i18n_data_of' do
    let(:programming_env_i18n_data) {described_instance.send(:i18n_data_of, programming_env)}

    let(:programming_env_name) {'expected-programming-env-name'}
    let(:programming_env_title) {'expected_programming_env_title'}
    let(:programming_env_desc) {'expected_programming_env_desc'}
    let(:programming_env) do
      FactoryBot.create(
        :programming_environment,
        name: programming_env_name,
        title: programming_env_title,
        description: programming_env_desc
      )
    end

    let(:programming_env_category_name) {'expected_programming_env_category_name'}
    let(:programming_env_category_key) {'expected_programming_env_category_key'}
    let(:programming_env_category) do
      FactoryBot.create(
        :programming_environment_category,
        programming_environment: programming_env,
        name: programming_env_category_name,
        key: programming_env_category_key,
      )
    end

    let(:programming_expr_name) {'expected-programming-expr-name'}
    let(:programming_expr_key) {'expected_programming_expr_key'}
    let(:programming_expr_content) {'expected_programming_expr_content'}
    let(:programming_expr_content) {'expected_programming_expr_content'}
    let(:programming_expr_return_value) {'expected_programming_expr_return_value'}
    let(:programming_expr_short_desc) {'expected_programming_expr_short_desc'}
    let(:programming_expr_tips) {'expected_programming_expr_tips'}
    let(:programming_expr_example_name) {'expected_programming_expr_example_name'}
    let(:programming_expr_example_desc) {'expected_programming_expr_example_desc'}
    let(:programming_expr_palette_param_name) {'expected_programming_expr_palette_param_name'}
    let(:programming_expr_palette_param_type) {'expected_programming_expr_palette_param_type'}
    let(:programming_expr_palette_param_desc) {'expected_programming_expr_palette_param_desc'}
    let(:programming_expr) do
      FactoryBot.create(
        :programming_expression,
        programming_environment: programming_env,
        programming_environment_category: programming_env_category,
        name: programming_expr_name,
        key: programming_expr_key,
        content: programming_expr_content,
        return_value: programming_expr_return_value,
        short_description: programming_expr_short_desc,
        tips: programming_expr_tips,
        examples: [
          'name' => programming_expr_example_name,
          'description' => programming_expr_example_desc
        ],
        palette_params: [
          'name' => programming_expr_palette_param_name,
          'type' => programming_expr_palette_param_type,
          'description' => programming_expr_palette_param_desc
        ],
      )
    end

    before do
      # Creates DB data
      programming_env
      programming_env_category
      programming_expr
    end

    let(:expected_programming_env_i18n_data) do
      {
        programming_env_name => {
          'name' => programming_env_title,
          'description' => programming_env_desc,
          'categories' => {
            programming_env_category_key => {
              'name' => programming_env_category_name,
              'expressions' => {
                programming_expr_key => {
                  'content' => programming_expr_content,
                  'examples' => {
                    programming_expr_example_name => {
                      'name' => programming_expr_example_name,
                      'description' => programming_expr_example_desc
                    }
                  },
                  'palette_params' => {
                    programming_expr_palette_param_name => {
                      'type' => programming_expr_palette_param_type,
                      'description' => programming_expr_palette_param_desc
                    }
                  },
                  'return_value' => programming_expr_return_value,
                  'short_description' => programming_expr_short_desc,
                  'tips' => programming_expr_tips
                }
              }
            }
          }
        }
      }
    end

    it 'returns i18n data for the Programming Environment' do
      assert_equal expected_programming_env_i18n_data, programming_env_i18n_data
    end
  end
end
