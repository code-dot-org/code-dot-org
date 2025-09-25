# frozen_string_literal: true

require 'test_helper'

class LocalizableTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  # Create a test model that includes the Localizable concern
  let(:described_model_class) do
    Class.new do
      include ActiveSupport::Callbacks
      define_callbacks :initialize

      # Add after_initialize method to support the callback BEFORE including Localizable
      def self.after_initialize(method_name)
        set_callback :initialize, :after, method_name
      end

      include Localizable

      attr_accessor :display_name, :description, :key

      def initialize(attributes = {})
        @display_name = attributes[:display_name]
        @description = attributes[:description]
        @key = attributes[:key]
        run_callbacks :initialize
      end

      def self.model_name
        OpenStruct.new(plural: 'described_models')
      end

      def self.name
        'DescribedModel'
      end
    end
  end

  let(:described_instance) {described_model_class.new(display_name: 'Test Display', description: 'Test Description', key: 'described_key')}

  before do
    # Reset I18n locale to default
    I18n.locale = I18n.default_locale

    # Clear any existing translations
    I18n.backend.reload!

    # Setup test translations
    I18n.backend.store_translations(
      :es, {
        data: {
          described_models: {
            described_key: {
              display_name: 'Nombre de Prueba',
              description: 'Descripción de Prueba'
            },
            another_key: {
              display_name: 'Otro Nombre',
              description: 'Otra Descripción'
            }
          }
        }
      }
    )
  end

  describe 'class methods' do
    describe '.localizable_attributes' do
      subject(:localizable_attributes) {described_model_class.localizable_attributes}

      context 'when no attributes are configured' do
        it 'returns empty array' do
          _localizable_attributes.must_equal []
        end
      end

      context 'when attributes are configured' do
        before do
          described_model_class.localizable_attributes = :display_name, :description
        end

        it 'returns configured attributes as symbols' do
          _localizable_attributes.must_equal [:display_name, :description]
        end
      end
    end

    describe '.localizable_attributes=' do
      subject(:set_attributes) {described_model_class.localizable_attributes = :display_name, :description}

      it 'sets the localizable attributes' do
        _set_attributes
        _(described_model_class.localizable_attributes).must_equal [:display_name, :description]
      end

      it 'generates localized_* methods for each attribute' do
        _set_attributes
        _(described_instance).must_respond_to :localized_display_name
        _(described_instance).must_respond_to :localized_description
        _(described_instance).must_respond_to :localized_display_name_with_options
        _(described_instance).must_respond_to :localized_description_with_options
      end

      context 'when passed as array' do
        subject(:set_attributes) {described_model_class.localizable_attributes = [:display_name, :description]}

        it 'flattens and converts to symbols' do
          _set_attributes
          _(described_model_class.localizable_attributes).must_equal [:display_name, :description]
        end
      end

      context 'when passed as strings' do
        subject(:set_attributes) {described_model_class.localizable_attributes = 'display_name', 'description'}

        it 'converts to symbols' do
          _set_attributes
          _(described_model_class.localizable_attributes).must_equal [:display_name, :description]
        end
      end
    end

    describe '.has_localizable_attributes?' do
      subject(:has_localizable_attributes?) {described_model_class.has_localizable_attributes?}

      context 'when no attributes are configured' do
        it 'returns false' do
          _has_localizable_attributes?.must_equal false
        end
      end

      context 'when attributes are configured' do
        before do
          described_model_class.localizable_attributes = :display_name
        end

        it 'returns true' do
          _has_localizable_attributes?.must_equal true
        end
      end
    end
  end

  describe 'instance methods' do
    before do
      described_model_class.localizable_attributes = :display_name, :description
    end

    describe '#localize_property' do
      subject(:localize_property) {described_instance.localize_property(property_name, locale_code: locale_code, key_override: key_override)}

      let(:property_name) {:display_name}
      let(:locale_code) {I18n.locale}
      let(:key_override) {nil}

      context 'when property is not configured as localizable' do
        let(:property_name) {:non_localizable_attr}

        it 'logs warning and returns original value' do
          expect(CDO).to receive(:log).and_return(double(warn: nil))

          _localize_property.must_be_nil
        end
      end

      context 'when fallback value is nil' do
        let(:described_instance) {described_model_class.new(display_name: nil, key: 'described_key')}

        it 'returns nil immediately' do
          _localize_property.must_be_nil
        end

        it 'caches nil result' do
          _localize_property
          cache_value = described_instance.instance_variable_get(:@localization_cache)["display_name_#{I18n.locale}"]
          _(cache_value).must_be_nil
        end
      end

      context 'when using default locale' do
        let(:locale_code) {I18n.default_locale}

        it 'returns fallback value without I18n lookup' do
          _localize_property.must_equal 'Test Display'
        end
      end

      context 'when translation exists' do
        let(:locale_code) {:es}

        it 'returns translated value' do
          _localize_property.must_equal 'Nombre de Prueba'
        end

        it 'caches the result' do
          _localize_property
          cache = described_instance.instance_variable_get(:@localization_cache)
          _(cache['display_name_es']).must_equal 'Nombre de Prueba'
        end
      end

      context 'when translation does not exist' do
        let(:locale_code) {:fr}

        it 'returns fallback value' do
          _localize_property.must_equal 'Test Display'
        end
      end

      context 'when using key_override' do
        let(:key_override) {'another_key'}
        let(:locale_code) {:es}

        it 'uses override key for lookup' do
          _localize_property.must_equal 'Otro Nombre'
        end
      end

      context 'when instance has no key method' do
        let(:described_instance) {described_model_class.new(display_name: 'Test Display')}
        let(:locale_code) {:es}

        it 'returns fallback value' do
          _localize_property.must_equal 'Test Display'
        end
      end

      context 'when I18n raises unexpected error' do
        let(:locale_code) {:es}

        it 'logs error and returns fallback value' do
          expect(I18n).to receive(:t).and_raise(StandardError, 'Test error')
          expect(CDO).to receive(:log).and_return(double(error: nil))

          _localize_property.must_equal 'Test Display'
        end
      end

      context 'when cached result exists' do
        let(:locale_code) {:es}

        before do
          # Pre-populate cache
          described_instance.instance_variable_get(:@localization_cache)['display_name_es'] = 'Cached Value'
        end

        it 'returns cached value without I18n lookup' do
          _localize_property.must_equal 'Cached Value'
        end
      end
    end

    describe '#uses_localization?' do
      subject(:uses_localization) {described_instance.uses_localization?}

      it 'returns true when class has localizable attributes' do
        _uses_localization.must_equal true
      end

      context 'when class has no localizable attributes' do
        before do
          described_model_class.instance_variable_set(:@localizable_attributes, [])
        end

        it 'returns false' do
          _uses_localization.must_equal false
        end
      end
    end

    describe '#clear_localization_cache!' do
      subject(:clear_cache) {described_instance.clear_localization_cache!}

      before do
        # Populate cache with some data
        described_instance.localize_property(:display_name, locale_code: :es)
      end

      it 'clears the localization cache' do
        cache = described_instance.instance_variable_get(:@localization_cache)
        _(cache).wont_be_empty

        _clear_cache

        _(cache).must_be_empty
      end
    end

    describe 'generated localized_* methods' do
      describe '#localized_display_name' do
        subject(:localized_display_name) {described_instance.localized_display_name(locale_code, key_override: key_override)}

        let(:locale_code) {I18n.locale}
        let(:key_override) {nil}

        context 'when called without parameters' do
          subject(:localized_display_name) {described_instance.localized_display_name}

          it 'uses current locale' do
            _localized_display_name.must_equal 'Test Display'
          end
        end

        context 'when called with locale parameter' do
          let(:locale_code) {:es}

          it 'uses specified locale' do
            _localized_display_name.must_equal 'Nombre de Prueba'
          end
        end

        context 'when called with key_override' do
          let(:locale_code) {:es}
          let(:key_override) {'another_key'}

          it 'uses override key' do
            _localized_display_name.must_equal 'Otro Nombre'
          end
        end
      end

      describe '#localized_display_name_with_options' do
        subject(:localized_with_options) {described_instance.localized_display_name_with_options(options)}

        let(:options) {{}}

        context 'when called without options' do
          it 'uses current locale' do
            _localized_with_options.must_equal 'Test Display'
          end
        end

        context 'when called with locale option' do
          let(:options) {{locale: :es}}

          it 'uses specified locale' do
            _localized_with_options.must_equal 'Nombre de Prueba'
          end
        end

        context 'when called with locale_code option' do
          let(:options) {{locale_code: :es}}

          it 'uses specified locale' do
            _localized_with_options.must_equal 'Nombre de Prueba'
          end
        end

        context 'when called with key option' do
          let(:options) {{locale: :es, key: 'another_key'}}

          it 'uses override key' do
            _localized_with_options.must_equal 'Otro Nombre'
          end
        end
      end
    end
  end

  describe 'integration scenarios' do
    before do
      described_model_class.localizable_attributes = :display_name, :description
    end

    context 'when switching locales multiple times' do
      it 'caches results per locale' do
        # Get English version
        english_result = described_instance.localized_display_name
        _(english_result).must_equal 'Test Display'

        # Get Spanish version
        spanish_result = described_instance.localized_display_name(:es)
        _(spanish_result).must_equal 'Nombre de Prueba'

        # Verify non_default is cached
        cache = described_instance.instance_variable_get(:@localization_cache)
        _(cache["display_name_#{I18n.default_locale}"]).must_be_nil
        _(cache['display_name_es']).must_equal 'Nombre de Prueba'
      end
    end

    context 'when model is reinitialized' do
      it 'sets up fresh cache' do
        # Use the instance to populate cache
        described_instance.localized_display_name(:es)

        # Create new instance
        new_instance = described_model_class.new(display_name: 'New Display', key: 'described_key')

        # Cache should be empty for new instance
        new_cache = new_instance.instance_variable_get(:@localization_cache)
        _(new_cache).must_be_empty
      end
    end

    context 'when working with multiple attributes' do
      it 'handles localization for all configured attributes' do
        display_result = described_instance.localized_display_name(:es)
        description_result = described_instance.localized_description(:es)

        _(display_result).must_equal 'Nombre de Prueba'
        _(description_result).must_equal 'Descripción de Prueba'
      end
    end
  end
end
