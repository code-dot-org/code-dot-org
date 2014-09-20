# Trophies are awarded based on percentage completion of Concepts
class Trophy < ActiveRecord::Base
  include Seeded
  #Hardcoded IDs
  BRONZE = 1
  SILVER = 2
  GOLD = 3
  BRONZE_THRESHOLD = 0.2
  SILVER_THRESHOLD = 0.5
  GOLD_THRESHOLD = 1
  TROPHIES_PER_CONCEPT = 3

  # Hard coded for perf. could be: Concept.cached.count * 3
  TROPHY_MAX = 27
end
