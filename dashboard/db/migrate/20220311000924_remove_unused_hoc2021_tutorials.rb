class RemoveUnusedHoc2021Tutorials < ActiveRecord::Migration[5.2]
  def up
    script_names = %w(
      ai-ethics
      counting-csc
      explore-data-1
      hello-world-animals
      hello-world-food
      hello-world-retro
      hello-world-emoji
      poem-art
      poetry
      spelling-bee
    )
    script_names.each do |name|
      script = Unit.find_by_name(name)
      next unless script
      script.destroy!
    end
  end

  def down
  end
end
