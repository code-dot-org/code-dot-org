module Models
  # Level in the graphql schema corresponds roughly to the ScriptLevel rails model
  class Level
    def initialize(script_level)
      @script_level = script_level
    end

    def id
      @script_level.level.id
    end

    def kind
      if @script_level.level.unplugged?
        "unplugged"
      elsif @script_level.assessment
        "assessment"
      else
        "puzzle"
      end
    end

    def title
      @script_level.level_display_text
    end

    def is_unplugged
      !!@script_level.level.unplugged?
    end

    def is_bonus
      !!@script_level.bonus
    end

    def is_concept
      !!@script_level.level.concept_level?
    end
  end
end