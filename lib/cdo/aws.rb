# The Code.org AWS wrapper namespace.
#
# `Cdo::Aws` shadows the aws-sdk gem's `::Aws` for every file lexically inside `module Cdo`: Ruby
# finds `Cdo::Aws` walking out through the lexical scope and stops there. Rather than prefix those
# call sites with `::Aws`, which has to be rediscovered every time a new file reaches for the gem,
# forward the constants we do not wrap.
module Cdo
  module Aws
    # Services we wrap under lib/cdo/aws/. Asked for before their file is required, these must fail
    # loudly -- forwarding them would hand back a gem client with none of the timeout and retry
    # policy the wrapper exists to apply, and nothing at the call site would show it.
    WRAPPED = %i[Redshift].freeze

    def self.const_missing(name)
      if WRAPPED.include?(name)
        raise NameError, "Cdo::Aws::#{name} is a Code.org wrapper; require its file before using it"
      end
      ::Aws.const_get(name, false)
    end
  end
end
