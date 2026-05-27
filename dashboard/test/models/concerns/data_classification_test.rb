require 'test_helper'

class DataClassificationTest < ActiveSupport::TestCase
  test 'data_classification registers declarations' do
    model = build_model
    model.data_classification(name: :restricted, hashed_password: :highly_restricted)
    assert_equal({name: :restricted, hashed_password: :highly_restricted}, model.declared_data_classifications)
  end

  test 'data_classification merges across calls and symbolizes keys' do
    model = build_model
    model.data_classification('name' => :restricted)
    model.data_classification(email: :restricted)
    assert_equal({name: :restricted, email: :restricted}, model.declared_data_classifications)
  end

  test 'a later declaration overrides an earlier one for the same attribute' do
    model = build_model
    model.data_classification(name: :restricted)
    model.data_classification(name: :public)
    assert_equal :public, model.declared_data_classifications[:name]
  end

  test 'data_classification raises ArgumentError on an unknown classification' do
    model = build_model
    error = assert_raises(ArgumentError) {model.data_classification(name: :super_secret)}
    assert_includes error.message, ':super_secret'
    assert_includes error.message, ':name'
  end

  test 'an STI subclass inherits parent declarations and extends without clobbering' do
    parent = build_model('Parent')
    parent.data_classification(name: :restricted)
    # An STI subclass inherits the concern (and its class_attribute) from its parent;
    # it does not re-include it, just as real models inherit from ApplicationRecord.
    child = Class.new(parent)
    child.data_classification(email: :public)

    assert_equal :public, child.declared_data_classifications[:email]
    assert_equal :restricted, child.declared_data_classifications[:name], 'child should inherit parent declaration'
    assert_equal({name: :restricted}, parent.declared_data_classifications, 'parent must not be mutated by child')
  end

  test 'effective_data_classification returns the declared classification when present' do
    model = build_model(columns: [mock_column('name', :string)])
    model.data_classification(name: :public)
    assert_equal :public, model.effective_data_classification(:name)
  end

  test 'effective_data_classification defaults text/string columns to restricted' do
    model = build_model(columns: [mock_column('bio', :text), mock_column('title', :string)])
    assert_equal :restricted, model.effective_data_classification('bio')
    assert_equal :restricted, model.effective_data_classification('title')
  end

  test 'effective_data_classification defaults timestamp columns to public' do
    columns = %w[created_at updated_at deleted_at].map {|c| mock_column(c, :datetime)}
    model = build_model(columns: columns)
    columns.each {|col| assert_equal :public, model.effective_data_classification(col.name)}
  end

  test 'effective_data_classification defaults other date/time columns to restricted' do
    model = build_model(columns: [mock_column('birthday', :date), mock_column('last_login', :datetime)])
    assert_equal :restricted, model.effective_data_classification('birthday')
    assert_equal :restricted, model.effective_data_classification('last_login')
  end

  test 'effective_data_classification defaults scalar columns to public' do
    model = build_model(columns: [mock_column('age', :integer), mock_column('admin', :boolean), mock_column('score', :float)])
    assert_equal :public, model.effective_data_classification('age')
    assert_equal :public, model.effective_data_classification('admin')
    assert_equal :public, model.effective_data_classification('score')
  end

  test 'column_names_classified_as for the non-PII set excludes restricted and highly_restricted' do
    model = pii_test_model
    assert_equal %w[id created_at], model.column_names_classified_as(:public, :confidential)
  end

  test 'column_names_classified_as for the PII set excludes only highly_restricted' do
    model = pii_test_model
    assert_equal %w[id name created_at], model.column_names_classified_as(:public, :confidential, :restricted)
  end

  test 'data_classification_errors flags a declared key that is not a real column' do
    model = build_model(columns: [mock_column('name', :string)])
    model.data_classification(name: :restricted, nonexistent: :public)
    assert_equal ['declares data classification for unknown column(s): nonexistent'], model.data_classification_errors
  end

  test 'data_classification_errors is empty when every declared key is a real column' do
    model = build_model(columns: [mock_column('name', :string)])
    model.data_classification(name: :restricted)
    assert_empty model.data_classification_errors
  end

  test 'undeclared_data_classification_columns lists columns without an explicit declaration' do
    model = build_model(columns: [mock_column('id', :integer), mock_column('name', :string), mock_column('email', :string)])
    model.data_classification(name: :restricted)
    assert_equal %w[id email], model.undeclared_data_classification_columns
  end

  private def mock_column(name, type)
    col = stub
    col.stubs(:name).returns(name)
    col.stubs(:type).returns(type)
    col
  end

  # A model whose columns span every classification once defaults and one
  # declaration are applied: id (public), name (text -> restricted default),
  # auth_token (highly_restricted, declared), created_at (public default).
  private def pii_test_model
    columns = [
      mock_column('id', :integer),
      mock_column('name', :string),
      mock_column('auth_token', :string),
      mock_column('created_at', :datetime),
    ]
    model = build_model(columns: columns)
    model.data_classification(auth_token: :highly_restricted)
    model
  end

  # Builds an anonymous class that includes the concern, stubbing the class-level
  # `columns` the concern reads. Mirrors the helper style in
  # analytics_exportable_test.rb.
  private def build_model(name = 'DataClassificationTestModel', columns: nil)
    columns ||= [mock_column('id', :integer)]
    klass = Class.new do
      include DataClassification
      define_singleton_method(:name) {name}
      define_singleton_method(:columns) {columns}
    end
    klass
  end
end
