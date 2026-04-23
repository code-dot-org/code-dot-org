require 'test_helper'

class AnalyticsExportableTest < ActiveSupport::TestCase
  setup do
    AnalyticsExportable.reset_exported_models!
  end

  test 'export_to_analytics registers the model' do
    model = create_base_model('ExportableTestModel')
    model.export_to_analytics
    assert_includes AnalyticsExportable.exported_models, model
  end

  test 'exported_models returns empty set when nothing is registered' do
    assert_empty AnalyticsExportable.exported_models
  end

  test 'calling export_to_analytics twice does not duplicate' do
    model = create_base_model('NoDupTestModel')
    model.export_to_analytics
    model.export_to_analytics
    assert_equal 1, AnalyticsExportable.exported_models.size
  end

  test 'multiple models can register independently' do
    model_a = create_base_model('ModelA')
    model_b = create_base_model('ModelB')
    model_a.export_to_analytics
    model_b.export_to_analytics
    assert_equal Set[model_a, model_b], AnalyticsExportable.exported_models
  end

  test 'raises ArgumentError when called on a Single Table Inheritance subclass' do
    base = create_base_model('StiBase')
    sub = Class.new(base) {include AnalyticsExportable}
    sub.stubs(:base_class).returns(base)
    sub.stubs(:name).returns('StiSub')

    error = assert_raises(ArgumentError) {sub.export_to_analytics}
    assert_includes error.message, 'Single Table Inheritance base class'
    assert_includes error.message, 'StiBase'
  end

  test 'raises ArgumentError when model has no primary key' do
    model = create_base_model('NoPrimaryKeyModel', primary_key: nil)

    error = assert_raises(ArgumentError) {model.export_to_analytics}
    assert_includes error.message, 'Zero ETL requires a primary key'
  end

  test 'raises ArgumentError when model has blob columns' do
    blob_col = mock_column('avatar', :binary)
    model = create_base_model('BlobModel', columns: [mock_column('id', :integer), blob_col])

    error = assert_raises(ArgumentError) {model.export_to_analytics}
    assert_includes error.message, 'Zero ETL does not support blob columns'
    assert_includes error.message, 'avatar'
  end

  test 'reset_exported_models! clears the registry' do
    model = create_base_model('ResetTestModel')
    model.export_to_analytics
    refute_empty AnalyticsExportable.exported_models

    AnalyticsExportable.reset_exported_models!
    assert_empty AnalyticsExportable.exported_models
  end

  test 'zero_etl_exclude_filters excludes tables without a primary key' do
    no_pk = create_base_model('NoPkModel', table_name: 'schema_migrations', primary_key: nil)
    ok = create_base_model('OkModel', table_name: 'users')

    excludes = AnalyticsExportable.zero_etl_exclude_filters(
      environment_type: :production,
      models: [no_pk, ok]
    )

    assert_equal ['exclude: `dashboard_production`.`schema_migrations`'], excludes
  end

  test 'zero_etl_exclude_filters excludes tables with blob columns' do
    blob_model = create_base_model('BlobModel', table_name: 'attachments',
      columns: [mock_column('id', :integer), mock_column('data', :binary)]
    )
    ok = create_base_model('OkModel', table_name: 'users')

    excludes = AnalyticsExportable.zero_etl_exclude_filters(
      environment_type: :test,
      models: [blob_model, ok]
    )

    assert_equal ['exclude: `dashboard_test`.`attachments`'], excludes
  end

  test 'zero_etl_exclude_filters returns empty array when all models are exportable' do
    model_a = create_base_model('ModelA', table_name: 'users')
    model_b = create_base_model('ModelB', table_name: 'projects')

    excludes = AnalyticsExportable.zero_etl_exclude_filters(
      environment_type: :production,
      models: [model_a, model_b]
    )

    assert_empty excludes
  end

  test 'zero_etl_exclude_filters uses environment_type in database name' do
    no_pk = create_base_model('NoPkModel', table_name: 'ar_internal_metadata', primary_key: nil)

    prod = AnalyticsExportable.zero_etl_exclude_filters(environment_type: :production, models: [no_pk])
    test_env = AnalyticsExportable.zero_etl_exclude_filters(environment_type: :test, models: [no_pk])

    assert_equal ['exclude: `dashboard_production`.`ar_internal_metadata`'], prod
    assert_equal ['exclude: `dashboard_test`.`ar_internal_metadata`'], test_env
  end

  private def mock_column(name, type)
    col = stub
    col.stubs(:name).returns(name)
    col.stubs(:type).returns(type)
    col
  end

  private def create_base_model(name, table_name: 'test_table', primary_key: 'id', columns: nil)
    columns ||= [mock_column('id', :integer)]
    klass = Class.new do
      include AnalyticsExportable
      define_singleton_method(:base_class) {self}
      define_singleton_method(:name) {name}
      define_singleton_method(:table_name) {table_name}
      define_singleton_method(:primary_key) {primary_key}
      define_singleton_method(:columns) {columns}
    end
    klass
  end
end
