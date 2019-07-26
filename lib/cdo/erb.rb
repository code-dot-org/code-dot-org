require 'erb'
require 'ostruct'

def erb_file_to_string(path, binding)
  ERB.new(IO.read(path), nil, '-').
    tap {|erb| erb.filename = path}.
    result(binding)
end

def erb_file_to_file(template_path, out_path, locals)
  bind = OpenStruct.new(locals).instance_eval {binding}
  content = erb_file_to_string(template_path, bind)
  IO.write(out_path, content)
  File.chmod(0o755, out_path) if File.executable?(template_path)
end
