# adapted from https://github.com/arvanasse/sti_factory
# When included, wraps #new to instantiate class based on STI inheritance column
module StiFactory
  extend ActiveSupport::Concern
  included do
    class << self
      unless method_defined?(:new_without_factory)
        alias_method :new_without_factory, :new
        alias_method :new, :new_with_factory
      end
    end

    def with_type(type)
      if self.type != type
        self.type = type
        becomes(type.constantize)
      else
        self
      end
    end
  end

  module ClassMethods
    def subclass_names
      descendants.map(&:name).push(name)
    end

    def new_with_factory(*args)
      attributes = args.first
      klass_name = identify_target_class attributes
      force_load_of_unreferenced_subclass klass_name
      klass = subclass_names.include?(klass_name) ? klass_name.constantize : self

      instance = klass.new_without_factory(*args)
      yield instance if block_given?
      instance
    end

    private

    def identify_target_class(attributes)
      return(class_name_from_column_definition || name) if attributes.nil?

      class_name = attributes.delete(inheritance_column.to_sym)
      class_name ||= attributes.delete(inheritance_column)
      class_name || name
    end

    def force_load_of_unreferenced_subclass(class_name)
      require class_name.underscore unless Object.const_defined?(class_name)
    end

    def class_name_from_column_definition
      columns.find {|col| col.name.to_s == inheritance_column.to_s}.try(:default)
    end
  end
end
