This directory contains definitions for [FactoryBot](https://github.com/thoughtbot/factory_bot).

Our pattern is to put smaller groups of factories for non-namespaced models in `factories.rb`,
namespaced models in a file named for the namespace, e.g., `pd_factories.rb` or `plc_factories.rb`,
and larger groups of associated factories (either within a single model or across multiple associated models) in a single file (eg, `user_factories.rb` or `school_factories.rb`).
