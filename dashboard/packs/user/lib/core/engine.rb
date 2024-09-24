module Core
  class Engine < ::Rails::Engine
    isolate_namespace Core
  end
end
