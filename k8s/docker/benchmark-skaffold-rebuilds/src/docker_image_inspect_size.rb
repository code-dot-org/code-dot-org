# frozen_string_literal: true

require 'json'
require 'open3'

module DockerImageInspectSize
  module_function def image_reference(image_name, tag)
    tag || "#{image_name}:n/a"
  end

  module_function def load_built_image_tag(skaffold_build_tags_path, image_name)
    raise "missing skaffold build tags file: #{skaffold_build_tags_path}" unless skaffold_build_tags_path.exist?

    payload = JSON.parse(skaffold_build_tags_path.read)
    builds = payload.fetch('builds')
    match = builds.find {|build| build.fetch('imageName') == image_name}
    raise "could not find #{image_name} in #{skaffold_build_tags_path}" unless match

    match.fetch('tag')
  end

  module_function def docker_inspect_size(repo_root, image_name, tag)
    bytes_text, status = Open3.capture2(
      'docker', 'image', 'inspect', tag, '--format', '{{.Size}}',
      chdir: repo_root.to_s
    )
    raise "docker inspect failed for #{tag}" unless status.success?

    bytes = Integer(bytes_text.strip)
    {
      'docker_image_name' => image_name,
      'docker_image_tag' => tag,
      'docker_image_reference' => image_reference(image_name, tag),
      'docker_inspect_size_bytes' => bytes,
      'docker_inspect_size_gigabytes' => (bytes / 1_000_000_000.0).round(6)
    }
  end

  module_function def payload(repo_root:, image_name:, success:, skaffold_build_tags_path:)
    unless success
      return {
        'docker_image_name' => image_name,
        'docker_image_tag' => nil,
        'docker_image_reference' => image_reference(image_name, nil),
        'docker_inspect_size_bytes' => nil,
        'docker_inspect_size_gigabytes' => nil,
        'error' => 'skaffold build failed; no docker inspect size recorded'
      }
    end

    tag = load_built_image_tag(skaffold_build_tags_path, image_name)
    docker_inspect_size(repo_root, image_name, tag)
  rescue StandardError => exception
    {
      'docker_image_name' => image_name,
      'docker_image_tag' => nil,
      'docker_image_reference' => image_reference(image_name, nil),
      'docker_inspect_size_bytes' => nil,
      'docker_inspect_size_gigabytes' => nil,
      'error' => exception.message
    }
  end
end
