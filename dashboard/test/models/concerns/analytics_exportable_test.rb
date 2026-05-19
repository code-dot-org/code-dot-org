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

  test 'exportability_errors returns error for model with no primary key' do
    model = create_base_model('NoPrimaryKeyModel', primary_key: nil)
    model.export_to_analytics

    errors = AnalyticsExportable.exportability_errors
    assert_equal 1, errors.size
    assert_includes errors.first, 'Zero ETL requires a primary key'
  end

  test 'exportability_errors flags model whose table has no PK even when model declares one' do
    # Mirrors the `schools` table: `self.primary_key = 'id'` is declared on the
    # model, but the underlying table has only a UNIQUE index, no PRIMARY KEY.
    # The check must consult the database, not the model's declared PK.
    model = create_base_model('SchoolsLikeModel', primary_key: 'id', db_primary_key: nil)
    model.export_to_analytics

    errors = AnalyticsExportable.exportability_errors
    assert_equal 1, errors.size
    assert_includes errors.first, 'Zero ETL requires a primary key'
  end

  test 'exportability_errors returns error for model with blob columns' do
    blob_col = mock_column('avatar', :binary)
    model = create_base_model('BlobModel', columns: [mock_column('id', :integer), blob_col])
    model.export_to_analytics

    errors = AnalyticsExportable.exportability_errors
    assert_equal 1, errors.size
    assert_includes errors.first, 'Zero ETL does not support blob columns'
    assert_includes errors.first, 'avatar'
  end

  test 'exportability_errors returns empty array for valid models' do
    model = create_base_model('ValidModel')
    model.export_to_analytics
    assert_empty AnalyticsExportable.exportability_errors
  end

  test 'exportability_errors collects errors from multiple models' do
    no_pk = create_base_model('NoPkModel', primary_key: nil)
    blob = create_base_model('BlobModel', columns: [mock_column('id', :integer), mock_column('data', :binary)])
    no_pk.export_to_analytics
    blob.export_to_analytics

    errors = AnalyticsExportable.exportability_errors
    assert_equal 2, errors.size
  end

  test 'validate_exported_models! raises when models are invalid' do
    model = create_base_model('NoPrimaryKeyModel', primary_key: nil)
    model.export_to_analytics

    error = assert_raises(ArgumentError) {AnalyticsExportable.validate_exported_models!}
    assert_includes error.message, 'Zero ETL requires a primary key'
  end

  test 'validate_exported_models! passes for valid models' do
    model = create_base_model('ValidModel')
    model.export_to_analytics
    assert_nothing_raised {AnalyticsExportable.validate_exported_models!}
  end

  test 'reset_exported_models! clears the registry' do
    model = create_base_model('ResetTestModel')
    model.export_to_analytics
    refute_empty AnalyticsExportable.exported_models

    AnalyticsExportable.reset_exported_models!
    assert_empty AnalyticsExportable.exported_models
  end

  test 'zero_etl_exclude_filters excludes tables without a primary key' do
    conn = mock_connection('my_db',
      'schema_migrations' => {primary_key: nil, columns: [mock_column('version', :string)]},
      'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]}
    )

    excludes = AnalyticsExportable.zero_etl_exclude_filters(connection: conn)
    assert_equal ['exclude: my_db.schema_migrations'], excludes
  end

  test 'zero_etl_exclude_filters excludes tables with blob columns' do
    conn = mock_connection('my_db',
      'attachments' => {primary_key: 'id', columns: [mock_column('id', :integer), mock_column('data', :binary)]},
      'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]}
    )

    excludes = AnalyticsExportable.zero_etl_exclude_filters(connection: conn)
    assert_equal ['exclude: my_db.attachments'], excludes
  end

  test 'zero_etl_exclude_filters returns empty array when all tables are exportable' do
    conn = mock_connection('my_db',
      'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]},
      'projects' => {primary_key: 'id', columns: [mock_column('id', :integer)]}
    )

    assert_empty AnalyticsExportable.zero_etl_exclude_filters(connection: conn)
  end

  test 'zero_etl_exclude_filters uses current_database in table names' do
    conn = mock_connection('dashboard_production',
      'ar_internal_metadata' => {primary_key: nil, columns: [mock_column('key', :string)]}
    )

    excludes = AnalyticsExportable.zero_etl_exclude_filters(connection: conn)
    assert_equal ['exclude: dashboard_production.ar_internal_metadata'], excludes
  end

  test 'zero_etl_data_filter starts with blanket include then excludes' do
    conn = mock_connection('dashboard_production',
      'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]},
      'schema_migrations' => {primary_key: nil, columns: [mock_column('version', :string)]}
    )

    filter = AnalyticsExportable.zero_etl_data_filter(connection: conn)
    assert_equal(
      'include: dashboard_production.*, exclude: dashboard_production.schema_migrations',
      filter
    )
  end

  test 'zero_etl_data_filter with no excludes returns only the include rule' do
    conn = mock_connection('my_db',
      'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]}
    )

    assert_equal 'include: my_db.*', AnalyticsExportable.zero_etl_data_filter(connection: conn)
  end

  test 'parse_data_filter splits comma-separated rules' do
    filter = 'include: db.*, exclude: db.t1, exclude: db.t2'
    assert_equal(
      ['include: db.*', 'exclude: db.t1', 'exclude: db.t2'],
      AnalyticsExportable.parse_data_filter(filter)
    )
  end

  test 'parse_data_filter returns empty array for blank input' do
    assert_empty AnalyticsExportable.parse_data_filter(nil)
    assert_empty AnalyticsExportable.parse_data_filter('')
  end

  test 'reconcile identifies rules to add and remove' do
    conn = mock_connection('dashboard_prod',
      'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]},
      'no_pk' => {primary_key: nil, columns: [mock_column('v', :string)]}
    )
    current = 'include: pegasus.*, include: dashboard_prod.*, exclude: dashboard_prod.old_table'

    result = AnalyticsExportable.reconcile_zero_etl_filters(current, connection: conn)

    assert_equal ['exclude: dashboard_prod.no_pk'], result[:to_add]
    assert_equal ['exclude: dashboard_prod.old_table'], result[:to_remove]
    assert_includes result[:reconciled_filter], 'include: pegasus.*'
    assert_includes result[:reconciled_filter], 'exclude: dashboard_prod.no_pk'
    refute_includes result[:reconciled_filter], 'old_table'
  end

  test 'reconcile preserves rules for other databases' do
    conn = mock_connection('dashboard_prod',
      'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]}
    )
    current = 'include: pegasus.*, include: dashboard_prod.*'

    result = AnalyticsExportable.reconcile_zero_etl_filters(current, connection: conn)

    assert_empty result[:to_add]
    assert_empty result[:to_remove]
    assert_includes result[:reconciled_filter], 'include: pegasus.*'
  end

  test 'reconcile reports unchanged excludes' do
    conn = mock_connection('dashboard_prod',
      'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]},
      'no_pk' => {primary_key: nil, columns: [mock_column('v', :string)]}
    )
    current = 'include: dashboard_prod.*, exclude: dashboard_prod.no_pk'

    result = AnalyticsExportable.reconcile_zero_etl_filters(current, connection: conn)

    assert_empty result[:to_add]
    assert_empty result[:to_remove]
    assert_equal ['exclude: dashboard_prod.no_pk'], result[:unchanged]
  end

  private def mock_column(name, type)
    col = stub
    col.stubs(:name).returns(name)
    col.stubs(:type).returns(type)
    col
  end

  private def mock_connection(db_name, tables_hash)
    conn = stub
    conn.stubs(:current_database).returns(db_name)
    conn.stubs(:tables).returns(tables_hash.keys)
    tables_hash.each do |table_name, spec|
      conn.stubs(:columns).with(table_name).returns(spec[:columns])
      conn.stubs(:primary_key).with(table_name).returns(spec[:primary_key])
    end
    conn
  end

  # `primary_key:` sets the Rails-level primary key on the model class.
  # `db_primary_key:` sets the database-level primary key reported by the
  # model's connection (what `connection.primary_key(table_name)` returns).
  # Defaults to the same value as `primary_key:` to mirror the common case
  # where the model's declared PK matches the table's PRIMARY KEY constraint.
  # Pass `db_primary_key: nil` together with `primary_key: 'id'` to reproduce
  # the `schools` case where the model declares a PK but the table has none.
  private def create_base_model(name, table_name: 'test_table', primary_key: 'id', db_primary_key: :same_as_model, columns: nil)
    columns ||= [mock_column('id', :integer)]
    db_pk = db_primary_key == :same_as_model ? primary_key : db_primary_key
    conn = stub
    conn.stubs(:primary_key).with(table_name).returns(db_pk)
    klass = Class.new do
      include AnalyticsExportable
      define_singleton_method(:base_class) {self}
      define_singleton_method(:name) {name}
      define_singleton_method(:table_name) {table_name}
      define_singleton_method(:primary_key) {primary_key}
      define_singleton_method(:connection) {conn}
      define_singleton_method(:columns) {columns}
    end
    klass
  end
end
