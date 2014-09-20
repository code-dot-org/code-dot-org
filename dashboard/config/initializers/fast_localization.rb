ENV['FAST_LOC'] ||= '1' if Rails.env.development? || rack_env?(:development)

if ENV['FAST_LOC'] == '1'
  Bundler.require(:fast_loc)
  I18n.backend = I18nema::Backend.new
  I18nema::Backend.send(:include, I18n::Backend::Fallbacks)
  I18n.backend.init_translations
  # I18nema loads Syck, but we want to keep Psych as our application's YAML engine
  YAML::ENGINE.yamler = 'psych'
  # We need to remove the :to_yaml methods Syck injects into certain classes (Psych only uses Object::to_yaml)
  # Class list is from syck-1.0.1/lib/syck/rubytypes.rb
  %w(Class Hash Struct Array Exception String Symbol Range Regexp
  Time Date Integer Float Rational Complex TrueClass FalseClass NilClass).each do |x|
    x.constantize.send(:remove_method, :to_yaml) if x.constantize.instance_methods(false).include?(:to_yaml)
  end
end
