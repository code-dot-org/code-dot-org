# Custom Brakeman Check for Unsafe exists? Usage
#
# This check detects when exists? is called with params directly
# Pattern: Model.exists?(params[:key])  <- VULNERABLE
# Safe: Model.exists?(id: params[:key])  <- SAFE

module Brakeman
  module CheckUnsafeExists
    class CheckUnsafeExists < Brakeman::BaseCheck
      Brakeman::Checks.add self

      @description = "Checks for unsafe exists? usage with params (SQL injection risk)"

      def run_check
        # Find all exists? calls using the same API as CheckSQL
        calls = tracker.find_call(:methods => [:exists?], :nested => true)

        # Debug: Check if we're finding any calls
        # puts "DEBUG: Found #{calls.length} exists? calls"

        calls.each do |result|
          process_result(result)
        end
      end

      def process_result(result)
        return if duplicate?(result)

        # In Brakeman 6.x, result might be a Call object directly
        call = result.is_a?(Hash) ? result[:call] : result
        return unless call

        # Get the first argument
        first_arg = call.first_arg
        return unless first_arg

        # Skip if it's a hash (safe pattern: exists?(id: params[:id]))
        return if hash?(first_arg)

        # Check if argument is params access
        if params_access?(first_arg)
          warn_unsafe_exists(result, call)
        end
      end

      def params_access?(exp)
        return false unless exp.is_a?(Sexp)

        case exp.node_type
        when :call
          # Check if this is a sanitization method (safe)
          # Methods like .to_i, .to_s, .to_f convert to safe types
          sanitization_methods = [:to_i, :to_s, :to_f, :to_d, :to_r, :to_c]
          if sanitization_methods.include?(exp.method)
            # This is a sanitization call - it's safe, return false
            return false
          end

          # Check if this is a call on params
          # params[:key] = s(:call, s(:params), :[], s(:lit, :key))
          # The target is s(:params) which has node_type == :params
          target = exp.target

          # Check if target is params (s(:params) has node_type :params)
          if target&.is_a?(Sexp) && target.node_type == :params
            return true
          end

          # Also check for params variable (lvar: s(:lvar, :params))
          if target&.is_a?(Sexp) && target.node_type == :lvar && target.value == :params
            return true
          end

          # Check for chained calls (but sanitization methods already handled above)
          if target&.is_a?(Sexp)
            return params_access?(target)
          end
        when :lvar
          # Direct params variable reference
          return true if exp.value == :params
        end

        false
      end

      def hash?(exp)
        return false unless exp.is_a?(Sexp)
        exp.node_type == :hash
      end

      def warn_unsafe_exists(result, call)
        warn(
          :result => result,
          :warning_type => "SQL Injection",
          :warning_code => :sql_injection,
          :message => msg("Unsafe exists? usage: params passed directly can lead to SQL injection when params contains an array. Use exists?(id: params[:id]) instead"),
          :confidence => :high,
          :code => call,
          :link_path => "https://brakemanscanner.org/docs/warning_types/sql_injection/"
        )
      end
    end
  end
end
