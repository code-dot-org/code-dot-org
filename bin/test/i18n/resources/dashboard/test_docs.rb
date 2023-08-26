require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/docs'

class I18n::Resources::Dashboard::DocsTest < Minitest::Test
  def test_sync_in
    exec_seq = sequence('execution')
    expected_programming_environments = %w[applab gamelab weblab]

    ActiveRecord::Base.transaction do
      ProgrammingEnvironment.destroy_all

      expected_programming_environments.each do |env|
        expected_source_file_path = CDO.dir("i18n/locales/source/docs/#{env}.json")
        expected_backup_file_path = CDO.dir("i18n/locales/original/docs/#{env}.json")

        generate_db_data_for(env)

        # Preparation of the i18n file
        FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/docs')).in_sequence(exec_seq)
        File.expects(:write).with(expected_source_file_path, expected_docs_json_for(env)).in_sequence(exec_seq)

        # Redaction of the i18n file
        FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/original/docs')).in_sequence(exec_seq)
        FileUtils.expects(:cp).with(expected_source_file_path, expected_backup_file_path).in_sequence(exec_seq)
        RedactRestoreUtils.expects(:redact).with(expected_source_file_path, expected_source_file_path, %w[visualCodeBlock link resourceLink]).in_sequence(exec_seq)
      end

      # Should not be translated
      generate_db_data_for('unexpected')
      File.expects(:write).with(CDO.dir('i18n/locales/source/docs/unexpected.json'), expected_docs_json_for('unexpected')).never

      I18n::Resources::Dashboard::Docs.sync_in
    ensure
      raise ActiveRecord::Rollback
    end
  end

  private

  def generate_db_data_for(env_name)
    env = FactoryBot.create(
      :programming_environment,
      name: env_name,
      title: "#{env_name} Env name",
      description: "#{env_name} Env desc"
    )

    env_category = FactoryBot.create(
      :programming_environment_category,
      programming_environment: env,
      name: "#{env_name} Env Category name",
      key: "#{env_name}_env_category_key"
    )

    FactoryBot.create(
      :programming_expression,
      programming_environment: env,
      programming_environment_category: env_category,
      name: "#{env_name} Expr name",
      key: "#{env_name}_expr_key",
      content: "#{env_name} Expr content",
      examples: [
        'name' => "#{env_name} Expr example name",
        'description' => "#{env_name} Expr example desc"
      ],
      palette_params: [
        'name' => "#{env_name} Expr palette_param name",
        'type' => "#{env_name} Expr palette_param type",
        'description' => "#{env_name} Expr palette_param desc"
      ],
      return_value: "#{env_name} Expr return_value",
      short_description: "#{env_name} Expr short_description",
      tips: "#{env_name} Expr tips"
    )
  end

  def expected_docs_json_for(env)
    <<-JSON.strip.gsub(/^ {6}/, '')
      {
        "#{env}": {
          "name": "#{env} Env name",
          "description": "#{env} Env desc",
          "categories": {
            "#{env}_env_category_key": {
              "name": "#{env} Env Category name",
              "expressions": {
                "#{env}_expr_key": {
                  "content": "#{env} Expr content",
                  "examples": {
                    "#{env} Expr example name": {
                      "name": "#{env} Expr example name",
                      "description": "#{env} Expr example desc"
                    }
                  },
                  "palette_params": {
                    "#{env} Expr palette_param name": {
                      "type": "#{env} Expr palette_param type",
                      "description": "#{env} Expr palette_param desc"
                    }
                  },
                  "return_value": "#{env} Expr return_value",
                  "short_description": "#{env} Expr short_description",
                  "tips": "#{env} Expr tips"
                }
              }
            }
          }
        }
      }
    JSON
  end
end
