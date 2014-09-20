require 'erb'
require 'ostruct'

def erb_file_to_string(path, locals)
  ERB.new(
    IO.read(path)
  ).result(
    OpenStruct.new(locals).instance_eval{binding}
  )
end

def erb_file_to_file(template_path, out_path, locals)
  content = erb_file_to_string(template_path, locals)
  IO.write(out_path, content)
  File.chmod(0755, out_path) if File.executable?(template_path)
end
