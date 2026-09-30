require 'test_helper'

class AnalyticsExportableTest < ActiveSupport::TestCase
  before {described_class.reset_exported_models!}

  describe '.export_to_analytics' do
    it 'registers the model' do
      model = create_base_model('ExportableTestModel')
      model.export_to_analytics
      _(described_class.exported_models).must_include model
    end

    it 'does not register the same model twice' do
      model = create_base_model('NoDupTestModel')
      model.export_to_analytics
      model.export_to_analytics
      _(described_class.exported_models.size).must_equal 1
    end

    context 'with a Single Table Inheritance subclass' do
      it 'raises ArgumentError pointing at the STI base class' do
        base = create_base_model('StiBase')
        sub = Class.new(base) {include AnalyticsExportable}
        sub.stubs(:base_class).returns(base)
        sub.stubs(:name).returns('StiSub')

        error = _ {sub.export_to_analytics}.must_raise ArgumentError
        _(error.message).must_include 'Single Table Inheritance base class'
        _(error.message).must_include 'StiBase'
      end
    end
  end

  describe '.exported_table_names' do
    it 'strips the database qualifier a cross-database model carries' do
      model = create_base_model('QualifiedTableModel', table_name: 'pegasus_development.hoc_activity')
      model.export_to_analytics
      _(described_class.exported_table_names).must_equal ['hoc_activity']
    end

    it 'leaves an unqualified table name alone' do
      model = create_base_model('UnqualifiedTableModel', table_name: 'users')
      model.export_to_analytics
      _(described_class.exported_table_names).must_equal ['users']
    end

    it 'omits models that fail exportability checks' do
      create_base_model('NoPkModel', table_name: 'no_pk', db_primary_key: nil).export_to_analytics
      _(described_class.exported_table_names).must_be_empty
    end
  end

  describe '.exported_models' do
    it 'is empty when nothing is registered' do
      _(described_class.exported_models).must_be_empty
    end

    it 'registers multiple models independently' do
      model_a = create_base_model('ModelA')
      model_b = create_base_model('ModelB')
      model_a.export_to_analytics
      model_b.export_to_analytics
      _(described_class.exported_models).must_equal Set[model_a, model_b]
    end
  end

  describe '.exportability_errors' do
    subject(:exportability_errors) {described_class.exportability_errors}

    context 'with a model that has no primary key' do
      before {create_base_model('NoPrimaryKeyModel', primary_key: nil).export_to_analytics}

      it 'reports that Zero ETL requires a primary key' do
        _(exportability_errors.size).must_equal 1
        _(exportability_errors.first).must_include 'Zero ETL requires a primary key'
      end
    end

    context 'when the model declares a primary key but the table has none' do
      # Mirrors the `schools` table: `self.primary_key = 'id'` is declared on the model, but the
      # underlying table has only a UNIQUE index, no PRIMARY KEY. The check must consult the
      # database, not the model's declared PK.
      before {create_base_model('SchoolsLikeModel', primary_key: 'id', db_primary_key: nil).export_to_analytics}

      it 'reports that Zero ETL requires a primary key' do
        _(exportability_errors.size).must_equal 1
        _(exportability_errors.first).must_include 'Zero ETL requires a primary key'
      end
    end

    context 'with a model that has blob columns' do
      before do
        create_base_model('BlobModel', columns: [mock_column('id', :integer), mock_column('avatar', :binary)]).
          export_to_analytics
      end

      it 'reports the unsupported blob column by name' do
        _(exportability_errors.size).must_equal 1
        _(exportability_errors.first).must_include 'Zero ETL does not support blob columns'
        _(exportability_errors.first).must_include 'avatar'
      end
    end

    context 'with valid models' do
      before {create_base_model('ValidModel').export_to_analytics}

      it 'is empty' do
        _exportability_errors.must_be_empty
      end
    end

    context 'with several invalid models' do
      before do
        create_base_model('NoPkModel', primary_key: nil).export_to_analytics
        create_base_model('BlobModel', columns: [mock_column('id', :integer), mock_column('data', :binary)]).
          export_to_analytics
      end

      it 'collects an error from each' do
        _(exportability_errors.size).must_equal 2
      end
    end
  end

  describe '.validate_exported_models!' do
    context 'when a model is invalid' do
      before {create_base_model('NoPrimaryKeyModel', primary_key: nil).export_to_analytics}

      it 'raises ArgumentError' do
        error = _ {described_class.validate_exported_models!}.must_raise ArgumentError
        _(error.message).must_include 'Zero ETL requires a primary key'
      end
    end

    context 'when all models are valid' do
      before {create_base_model('ValidModel').export_to_analytics}

      it 'does not raise' do
        assert_nothing_raised {described_class.validate_exported_models!}
      end
    end
  end

  describe '.exportability_errors_by_model' do
    context 'with a mix of invalid and valid models' do
      it 'maps each invalid model to its reasons and omits the valid ones' do
        no_pk = create_base_model('NoPkModel', db_primary_key: nil)
        blob = create_base_model('BlobModel', columns: [mock_column('id', :integer), mock_column('data', :binary)])
        valid = create_base_model('ValidModel')
        [no_pk, blob, valid].each(&:export_to_analytics)

        by_model = described_class.exportability_errors_by_model
        _(by_model.keys.to_set).must_equal [no_pk, blob].to_set
        _(by_model[no_pk].first).must_include 'Zero ETL requires a primary key'
        _(by_model[blob].first).must_include 'Zero ETL does not support blob columns'
      end
    end

    context 'when all models are valid' do
      it 'is an empty hash' do
        create_base_model('ValidA').export_to_analytics
        create_base_model('ValidB').export_to_analytics
        _(described_class.exportability_errors_by_model).must_be_empty
      end
    end

    context 'when a model has a data classification typo' do
      it 'surfaces the unknown-column error' do
        model = create_base_model('TypoModel', columns: [mock_column('id', :integer)])
        model.data_classification(nonexistent: :public)
        model.export_to_analytics

        _(described_class.exportability_errors_by_model[model].first).must_include 'unknown column(s): nonexistent'
      end
    end
  end

  describe '.classification_coverage' do
    it 'maps exported models to their undeclared columns, omitting fully-classified ones' do
      declared = create_base_model('DeclaredModel', columns: [mock_column('id', :integer)])
      declared.data_classification(id: :public)
      partial = create_base_model('PartialModel', columns: [mock_column('id', :integer), mock_column('name', :string)])
      partial.data_classification(id: :public)
      declared.export_to_analytics
      partial.export_to_analytics

      coverage = described_class.classification_coverage
      _(coverage.keys).must_equal [partial]
      _(coverage[partial]).must_equal %w[name]
    end
  end

  describe '.valid_exported_models' do
    context 'when some models fail validation' do
      it 'excludes the invalid ones' do
        valid = create_base_model('ValidModel')
        no_pk = create_base_model('NoPkModel', db_primary_key: nil)
        valid.export_to_analytics
        no_pk.export_to_analytics

        _(described_class.valid_exported_models).must_equal Set[valid]
      end
    end

    context 'when all models are valid' do
      it 'returns them all' do
        a = create_base_model('ValidA')
        b = create_base_model('ValidB')
        a.export_to_analytics
        b.export_to_analytics

        _(described_class.valid_exported_models).must_equal Set[a, b]
      end
    end

    # A model dropped from this set stops having its Redshift materialized views provisioned and
    # refreshed, and stays that way until someone notices. Logging here, in the method that does the
    # filtering, is what keeps a caller from taking the valid subset without the exclusion being
    # recorded anywhere.
    it 'logs each exclusion with the model name and the reason' do
      valid = create_base_model('LoggedValidModel')
      no_pk = create_base_model('LoggedNoPkModel', db_primary_key: nil)
      valid.export_to_analytics
      no_pk.export_to_analytics

      CDO.log.expects(:error).with(regexp_matches(/LoggedNoPkModel cannot be exported.*primary key/))

      _(described_class.valid_exported_models).must_equal Set[valid]
    end

    it 'logs nothing when every model is exportable' do
      create_base_model('QuietValidModel').export_to_analytics

      CDO.log.expects(:error).never

      _(described_class.valid_exported_models).wont_be_empty
    end
  end

  describe '.reset_exported_models!' do
    it 'clears the registry' do
      create_base_model('ResetTestModel').export_to_analytics
      _(described_class.exported_models).wont_be_empty

      described_class.reset_exported_models!
      _(described_class.exported_models).must_be_empty
    end
  end

  describe '.zero_etl_exclude_filters' do
    context 'with a table that has no primary key' do
      it 'excludes that table' do
        conn = mock_connection('my_db',
          'schema_migrations' => {primary_key: nil, columns: [mock_column('version', :string)]},
          'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]}
)
        _(described_class.zero_etl_exclude_filters(connection: conn)).must_equal ['exclude: my_db.schema_migrations']
      end
    end

    context 'with a composite primary key' do
      # `connection.primary_key` returns an Array for a composite PK (e.g., school_stats_by_years
      # has PRIMARY KEY (school_id, school_year)). Zero ETL supports composite PKs, so the table
      # must not be excluded.
      it 'does not exclude the table' do
        conn = mock_connection('my_db',
          'school_stats_by_years' => {
            primary_key: %w[school_id school_year],
            columns: [mock_column('school_id', :integer), mock_column('school_year', :string)],
          }
)
        _(described_class.zero_etl_exclude_filters(connection: conn)).must_be_empty
      end
    end

    context 'with a table that has blob columns' do
      it 'excludes that table' do
        conn = mock_connection('my_db',
          'attachments' => {primary_key: 'id', columns: [mock_column('id', :integer), mock_column('data', :binary)]},
          'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]}
)
        _(described_class.zero_etl_exclude_filters(connection: conn)).must_equal ['exclude: my_db.attachments']
      end
    end

    context 'when every table is exportable' do
      it 'is empty' do
        conn = mock_connection('my_db',
          'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]},
          'projects' => {primary_key: 'id', columns: [mock_column('id', :integer)]}
)
        _(described_class.zero_etl_exclude_filters(connection: conn)).must_be_empty
      end
    end

    it 'uses current_database in the table names' do
      conn = mock_connection('dashboard_production',
        'ar_internal_metadata' => {primary_key: nil, columns: [mock_column('key', :string)]}
)
      _(described_class.zero_etl_exclude_filters(connection: conn)).
        must_equal ['exclude: dashboard_production.ar_internal_metadata']
    end
  end

  describe '.zero_etl_data_filter' do
    context 'with tables to exclude' do
      it 'starts with a blanket include then the excludes' do
        conn = mock_connection('dashboard_production',
          'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]},
          'schema_migrations' => {primary_key: nil, columns: [mock_column('version', :string)]}
)
        _(described_class.zero_etl_data_filter(connection: conn)).
          must_equal 'include: dashboard_production.*, exclude: dashboard_production.schema_migrations'
      end
    end

    context 'with nothing to exclude' do
      it 'returns only the include rule' do
        conn = mock_connection('my_db', 'users' => {primary_key: 'id', columns: [mock_column('id', :integer)]})
        _(described_class.zero_etl_data_filter(connection: conn)).must_equal 'include: my_db.*'
      end
    end
  end

  def mock_column(name, type)
    stub(name: name, type: type)
  end

  def mock_connection(db_name, tables_hash)
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
  def create_base_model(name, table_name: 'test_table', primary_key: 'id', db_primary_key: :same_as_model, columns: nil)
    columns ||= [mock_column('id', :integer)]
    db_pk = db_primary_key == :same_as_model ? primary_key : db_primary_key
    conn = stub
    conn.stubs(:primary_key).with(table_name).returns(db_pk)
    Class.new do
      include AnalyticsExportable
      # ApplicationRecord includes both concerns; AnalyticsExportable's validation calls
      # into DataClassification, so the test double must compose them the same way.
      include DataClassification
      define_singleton_method(:base_class) {self}
      define_singleton_method(:name) {name}
      define_singleton_method(:table_name) {table_name}
      define_singleton_method(:primary_key) {primary_key}
      define_singleton_method(:connection) {conn}
      define_singleton_method(:columns) {columns}
    end
  end
end
