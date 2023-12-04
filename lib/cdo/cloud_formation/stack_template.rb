require_relative './lambda'

module Cdo::CloudFormation
  # Controller class that provides the ERB binding context for CloudFormation stack templates.
  # Includes helper methods for rendering CloudFormation stack templates.
  class StackTemplate
    include Lambda

    # Array preventing specified Logical Resource IDs from having their events logged by `#tail_events`.
    attr_reader :log_resource_filter

    # Array adding specified tags to the CloudFormation stack update.
    attr_reader :tags

    # True when the rendered template won't actually be used to update a stack ('validate').
    # Templates with side-effects coupled to stack updates may execute them only when dry_run is false.
    attr_accessor :dry_run

    # Name of the CloudFormation stack instance to be created.
    attr_reader :stack_name

    # Filename of the ERB template to be rendered to create a CloudFormation stack template.
    attr_reader :filename

    def initialize(filename:, stack_name:, **_options)
      @stack_name = stack_name
      @filename = filename
      @log_resource_filter = []
      @tags = []
    end

    # Returns the fully-rendered template as a string.
    def render(filename: self.filename)
      erb_file(filename)
    end

    private def environment
      rack_env
    end

    # Generate boilerplate Trust Policy for an AWS Service Role.
    private def service_role(service)
      document = {
        Statement: [
          Effect: 'Allow',
          Action: 'sts:AssumeRole',
          Principal: {Service: ["#{service}.amazonaws.com"]}
        ]
      }
      "AssumeRolePolicyDocument: #{document.to_json}"
    end

    private def erb_file(filename, vars = {})
      file = File.expand_path filename
      erb_eval(File.read(file), file, vars)
    end

    # Inline a file into a CloudFormation template.
    private def file(filename, vars = {})
      {'Fn::Sub': erb_file(filename, vars)}.to_json
    end

    private def erb_eval(str, filename = nil, local_vars = {})
      binding = get_binding
      local_vars.each_pair do |key, value|
        binding.local_variable_set(key, value)
      end
      Dir.chdir(File.dirname(filename)) do
        ERB.new(str, trim_mode: '-').tap {|erb| erb.filename = filename}.result(binding)
      end
    end

    # Inline a component file into the stack template using local variables as parameters.
    private def component(name, vars = {})
      erb_file(aws_dir("cloudformation/components/#{name}.yml.erb"), vars)
    end

    # Inline stack resources into the template using local variables as parameters
    # This allows component file to be unindented, and will add a 2-space indent when loaded
    private def resource_component(name, vars = {})
      resource_indent = 2
      indent(erb_file(aws_dir("cloudformation/components/#{name}.yml.erb"), vars), resource_indent)
    end

    # Adds the specified properties to a YAML document.
    private def add_properties(properties)
      properties.transform_values(&:to_json).map {|p| p.join(': ')}.join
    end

    # Indent all lines in the string by the specified number of characters.
    private def indent(string, chars)
      string.gsub(/\n/, "\n#{' ' * chars}")
    end

    # Creates Binding object used for ERB template context.
    # Must be overridden in subclasses.
    private def get_binding
      binding
    end
  end
end
