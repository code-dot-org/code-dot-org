require 'test_helper'

class DataClassificationTest < ActiveSupport::TestCase
  # A column double exposing the `#name` and `#type` the concern reads.
  def mock_column(name, type)
    stub(name: name, type: type)
  end

  # Columns the test model exposes; override per context.
  let(:columns) {[mock_column('id', :integer)]}

  # An anonymous class that mixes in the concern under test, stubbing the class-level `columns` it
  # reads. Mirrors how real models include it via ApplicationRecord.
  let(:model) do
    concern = described_class
    declared_columns = columns
    Class.new do
      include concern
      define_singleton_method(:name) {'DataClassificationTestModel'}
      define_singleton_method(:columns) {declared_columns}
    end
  end

  describe '.data_classification' do
    it 'registers declarations' do
      model.data_classification(name: :restricted, hashed_password: :highly_restricted)
      _(model.declared_data_classifications).must_equal({name: :restricted, hashed_password: :highly_restricted})
    end

    it 'merges across calls and symbolizes keys' do
      model.data_classification('name' => :restricted)
      model.data_classification(email: :restricted)
      _(model.declared_data_classifications).must_equal({name: :restricted, email: :restricted})
    end

    context 'when an attribute is declared more than once' do
      it 'keeps the last declaration' do
        model.data_classification(name: :restricted)
        model.data_classification(name: :public)
        _(model.declared_data_classifications[:name]).must_equal :public
      end
    end

    context 'with an unknown classification' do
      it 'raises ArgumentError naming the bad value and its attribute' do
        error = _ {model.data_classification(name: :super_secret)}.must_raise ArgumentError
        _(error.message).must_include ':super_secret'
        _(error.message).must_include ':name'
      end
    end

    context 'with an STI subclass' do
      # A subclass inherits the concern (and its `class_attribute`) from its parent rather than
      # re-including it, just as real models inherit from ApplicationRecord.
      let(:child) {Class.new(model)}

      before do
        model.data_classification(name: :restricted)
        child.data_classification(email: :public)
      end

      it 'inherits the parent declarations' do
        _(child.declared_data_classifications[:name]).must_equal :restricted
      end

      it 'extends them with its own' do
        _(child.declared_data_classifications[:email]).must_equal :public
      end

      it 'does not mutate the parent' do
        _(model.declared_data_classifications).must_equal({name: :restricted})
      end
    end
  end

  describe '.effective_data_classification' do
    context 'when the column is explicitly declared' do
      let(:columns) {[mock_column('name', :string)]}
      before {model.data_classification(name: :public)}

      it 'returns the declared classification' do
        _(model.effective_data_classification(:name)).must_equal :public
      end
    end

    context 'with an undeclared text column' do
      let(:columns) {[mock_column('bio', :text), mock_column('title', :string)]}

      it 'defaults to restricted' do
        columns.each {|col| _(model.effective_data_classification(col.name)).must_equal :restricted}
      end
    end

    context 'with an undeclared JSON column' do
      # JSON columns are property bags that routinely hold free-form user content, so they are
      # treated as text.
      let(:columns) {[mock_column('new_message', :json), mock_column('settings', :jsonb)]}

      it 'defaults to restricted' do
        columns.each {|col| _(model.effective_data_classification(col.name)).must_equal :restricted}
      end
    end

    context 'with an undeclared created_at/updated_at/deleted_at column' do
      let(:columns) {%w[created_at updated_at deleted_at].map {|name| mock_column(name, :datetime)}}

      it 'defaults to confidential' do
        columns.each {|col| _(model.effective_data_classification(col.name)).must_equal :confidential}
      end
    end

    context 'with another undeclared date/time column' do
      let(:columns) {[mock_column('birthday', :date), mock_column('last_login', :datetime)]}

      it 'defaults to restricted' do
        columns.each {|col| _(model.effective_data_classification(col.name)).must_equal :restricted}
      end
    end

    context 'with an undeclared numeric or boolean column' do
      let(:columns) {[mock_column('age', :integer), mock_column('admin', :boolean), mock_column('score', :float)]}

      it 'defaults to confidential' do
        columns.each {|col| _(model.effective_data_classification(col.name)).must_equal :confidential}
      end
    end
  end

  describe '.column_names_classified_as' do
    # Spans confidential, restricted, and highly_restricted once defaults and one declaration are
    # applied: id (scalar -> confidential default), name (text -> restricted default),
    # auth_token (highly_restricted, declared), created_at (timestamp -> confidential default).
    let(:columns) do
      [
        mock_column('id', :integer),
        mock_column('name', :string),
        mock_column('auth_token', :string),
        mock_column('created_at', :datetime),
      ]
    end
    before {model.data_classification(auth_token: :highly_restricted)}

    context 'for the non-PII set (:public, :confidential)' do
      subject(:column_names) {model.column_names_classified_as(:public, :confidential)}

      it 'excludes restricted and highly_restricted columns' do
        _column_names.must_equal %w[id created_at]
      end
    end

    context 'for the PII set (:public, :confidential, :restricted)' do
      subject(:column_names) {model.column_names_classified_as(:public, :confidential, :restricted)}

      it 'excludes only highly_restricted columns' do
        _column_names.must_equal %w[id name created_at]
      end
    end
  end

  describe '.data_classification_errors' do
    let(:columns) {[mock_column('name', :string)]}
    subject(:errors) {model.data_classification_errors}

    context 'when a declared attribute is not a real column' do
      before {model.data_classification(name: :restricted, nonexistent: :public)}

      it 'flags the unknown column' do
        _errors.must_equal ['declares data classification for unknown column(s): nonexistent']
      end
    end

    context 'when every declared attribute is a real column' do
      before {model.data_classification(name: :restricted)}

      it 'is empty' do
        _errors.must_be_empty
      end
    end
  end

  describe '.undeclared_data_classification_columns' do
    let(:columns) {[mock_column('id', :integer), mock_column('name', :string), mock_column('email', :string)]}
    before {model.data_classification(name: :restricted)}

    it 'lists the columns without an explicit declaration' do
      _(model.undeclared_data_classification_columns).must_equal %w[id email]
    end
  end
end
