#!/usr/bin/env ruby
# frozen_string_literal: true

require 'pathname'
require 'shellwords'
require 'set'

module DeriveDependencies
  Instruction = Struct.new(:op, :body, keyword_init: true)

  SCRIPT_DIR = Pathname(__dir__).realpath
  DOCKER_DIR = SCRIPT_DIR.parent.parent
  MAIN_DOCKERFILE = DOCKER_DIR / 'code-dot-org.dockerfile'

  # This helper exists to derive the two dependency maps used by `update-daily-odds.rb`
  # from the real Dockerfiles instead of maintaining them by hand.
  #
  # Conceptually, the report only cares about Dockerfile inputs whose cache behavior
  # is dominated by file churn, not by expensive compute. So we derive two things:
  #
  # 1. DOCKERFILE_DEPENDENCIES
  #    For the main `code-dot-org.dockerfile`, find `COPY --from=...` edges that
  #    point at Dockerfiles which are effectively file-packaging stages.
  #
  # 2. COPY_PATH_DEPENDENCIES
  #    For those file-packaging Dockerfiles, collect the direct source paths from
  #    their `COPY` lines. Those paths are the repo inputs whose day-to-day changes
  #    can invalidate the copy layer.
  #
  # The "copy file only dockerfile" heuristic is intentionally strict: only
  # Dockerfiles whose instructions are limited to cheap packaging-style operations
  # are eligible. If this logic breaks in the future, the first thing to inspect is
  # whether one of the Dockerfiles gained real build logic (`RUN`, package install,
  # asset build, etc.) or whether a new copy-only Dockerfile needs to be recognized.
  ALLOWED_COPY_ONLY_INSTRUCTIONS = %w[ARG COPY FROM LABEL].freeze
  KNOWN_DOCKERFILE_INSTRUCTIONS = %w[
    ADD ARG CMD COPY ENTRYPOINT ENV EXPOSE FROM HEALTHCHECK LABEL ONBUILD RUN
    SHELL STOPSIGNAL USER VOLUME WORKDIR
  ].freeze

  module_function def dockerfile_instructions(path)
    instructions = []
    current = []
    current_op = nil

    path.each_line do |raw_line|
      stripped = raw_line.strip
      next if stripped.empty? || stripped.start_with?('#')

      if current_op.nil?
        parts = raw_line.split(nil, 2)
        next if parts.empty?

        op = parts[0].upcase
        next unless KNOWN_DOCKERFILE_INSTRUCTIONS.include?(op)

        current_op = op
        current = [raw_line.strip]
      else
        current << raw_line.strip
      end

      next if raw_line.rstrip.end_with?('\\')

      body = current.map {|line| line.delete_suffix('\\').strip}.join(' ')
      instructions << Instruction.new(op: current_op, body: body)
      current = []
      current_op = nil
    end

    instructions
  end

  module_function def parse_copy_instruction(body)
    tokens = Shellwords.split(body)
    raise "not a COPY instruction: #{body}" if tokens.empty? || !tokens[0].casecmp('COPY').zero?

    from_stage = nil
    payload = []

    tokens[1..].each do |token|
      if token.start_with?('--from=')
        from_stage = token.split('=', 2)[1]
      elsif token.start_with?('--')
        next
      else
        payload << token
      end
    end

    raise "unexpected COPY payload: #{body}" if payload.length < 2

    [from_stage, payload[0...-1]]
  end

  module_function def copy_only_dockerfile?(path)
    ops = dockerfile_instructions(path).map(&:op).uniq
    (ops - ALLOWED_COPY_ONLY_INSTRUCTIONS).empty?
  end

  module_function def direct_copy_paths(path)
    paths = []
    dockerfile_instructions(path).each do |instruction|
      next unless instruction.op == 'COPY'

      from_stage, sources = parse_copy_instruction(instruction.body)
      next unless from_stage.nil?

      sources.each do |source|
        paths << source unless paths.include?(source)
      end
    end
    paths
  end

  module_function def alias_to_dockerfile_map(path, copy_only_names)
    mapping = {}
    dockerfile_instructions(path).each do |instruction|
      next unless instruction.op == 'FROM'

      tokens = Shellwords.split(instruction.body)
      next unless tokens.length >= 4 && tokens[-2].casecmp('AS').zero?

      alias_name = tokens[-1]
      filename = "#{alias_name}.dockerfile"
      mapping[alias_name] = filename if copy_only_names.include?(filename)
    end
    mapping
  end

  module_function def dockerfile_dependencies_for_main(path, copy_only_names)
    alias_map = alias_to_dockerfile_map(path, copy_only_names)
    dependencies = []

    dockerfile_instructions(path).each do |instruction|
      next unless instruction.op == 'COPY'

      from_stage, = parse_copy_instruction(instruction.body)
      next if from_stage.nil?

      filename = alias_map[from_stage]
      dependencies << filename if filename && !dependencies.include?(filename)
    end

    dependencies
  end

  module_function def build_copy_path_dependencies(copy_paths)
    ordered = {'code-dot-org.dockerfile' => []}
    copy_only = copy_paths.
      reject {|name, _paths| name == 'code-dot-org.dockerfile'}.
      sort_by {|name, paths| [-paths.length, name]}

    copy_only.each do |name, paths|
      ordered[name] = paths
    end
    ordered
  end

  module_function def generate_dependency_maps
    dockerfiles = Dir[(DOCKER_DIR / 'code-dot-org*.dockerfile').to_s].sort.map {|path| Pathname(path)}
    copy_only_files = dockerfiles.select do |path|
      path.basename.to_s != MAIN_DOCKERFILE.basename.to_s && copy_only_dockerfile?(path)
    end
    copy_only_names = copy_only_files.to_set {|path| path.basename.to_s}

    dockerfile_dependencies = {
      MAIN_DOCKERFILE.basename.to_s => dockerfile_dependencies_for_main(MAIN_DOCKERFILE, copy_only_names)
    }

    copy_paths = copy_only_files.to_h {|path| [path.basename.to_s, direct_copy_paths(path)]}
    copy_paths[MAIN_DOCKERFILE.basename.to_s] = []
    copy_path_dependencies = build_copy_path_dependencies(copy_paths)

    [dockerfile_dependencies, copy_path_dependencies]
  end
end

if $PROGRAM_NAME == __FILE__
  dockerfile_dependencies, copy_path_dependencies = DeriveDependencies.generate_dependency_maps
  puts 'Generated DOCKERFILE_DEPENDENCIES:'
  p dockerfile_dependencies
  puts
  puts 'Generated COPY_PATH_DEPENDENCIES:'
  p copy_path_dependencies
end
