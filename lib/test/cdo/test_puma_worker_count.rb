require 'minitest/autorun'
require_relative '../../cdo/puma_worker_count'

# Standalone unit test for the pure worker-count calculation. Deliberately
# avoids the Rails/DB test harness so it runs without a database.
class PumaWorkerCountTest < Minitest::Test
  def compute(**overrides)
    # Defaults model a fall-size m7i.12xlarge (48 vCPU / 192 GB).
    defaults = {
      explicit: nil,
      cpu_count: 48,
      total_memory_mb: 192 * 1024,
      per_worker_mb: 4096,
      headroom: 0.15
    }
    Cdo::PumaWorkerCount.compute(**defaults.merge(overrides))
  end

  # The same default budget must track the seasonal instance resize without
  # a config change: ~26 workers on the summer m7i.8xlarge, 40 in the fall.
  def test_fall_m7i_12xlarge_resolves_to_40
    assert_equal 40, compute(cpu_count: 48, total_memory_mb: 192 * 1024)
  end

  def test_summer_m7i_8xlarge_resolves_to_26
    # 32 vCPU / ~123 GB MemTotal: memory budget (26) wins under the CPU cap (32).
    assert_equal 26, compute(cpu_count: 32, total_memory_mb: 123 * 1024)
  end

  def test_explicit_count_does_not_adapt_to_a_smaller_box
    # Why memory-aware beats a hardcoded count: an explicit 40 is returned
    # verbatim, oversubscribing the summer box's 32 vCPUs (and worsening
    # memory), where the memory-aware calc sizes down to 26.
    assert_equal 40, compute(explicit: 40, cpu_count: 32, total_memory_mb: 123 * 1024)
  end

  def test_explicit_integer_overrides_everything
    assert_equal 5, compute(explicit: 5)
  end

  def test_explicit_zero_is_honored_for_single_mode
    assert_equal 0, compute(explicit: 0)
  end

  def test_integer_valued_string_is_coerced
    assert_equal 2, compute(explicit: '2')
  end

  def test_non_integer_string_falls_through_to_budget
    # e.g. a stray ":auto" or junk value must not silently disable the cap.
    assert_equal 40, compute(explicit: 'auto')
  end

  def test_missing_memory_reading_falls_back_to_cpu
    assert_equal 48, compute(total_memory_mb: nil)
  end

  # concurrent-ruby's available_processor_count returns a Float; the result
  # handed to puma must still be an Integer, on both the CPU- and memory-bound
  # paths. (Production passes a Float here; the integer cpu_count in other
  # cases would mask a type regression.)
  def test_float_cpu_count_yields_integer_on_cpu_path
    result = compute(cpu_count: 48.0, total_memory_mb: nil)
    assert_equal 48, result
    assert_kind_of Integer, result
  end

  def test_float_cpu_count_yields_integer_on_memory_path
    result = compute(cpu_count: 32.0, total_memory_mb: 123 * 1024)
    assert_equal 26, result
    assert_kind_of Integer, result
  end

  def test_fractional_cpu_quota_floors
    # A cgroup quota of 7.5 vCPUs cannot run 7.5 workers.
    assert_equal 7, compute(cpu_count: 7.5, total_memory_mb: nil)
  end

  # A missing or unusable memory config key must degrade to CPU-only sizing,
  # never crash the puma master at boot (TypeError / divide-by-zero).
  def test_nil_per_worker_mb_falls_back_to_cpu
    assert_equal 48, compute(per_worker_mb: nil)
  end

  def test_zero_per_worker_mb_falls_back_to_cpu
    assert_equal 48, compute(per_worker_mb: 0)
  end

  def test_nil_headroom_falls_back_to_cpu
    assert_equal 48, compute(headroom: nil)
  end

  def test_cpu_bound_when_memory_is_abundant
    assert_equal 48, compute(total_memory_mb: 512 * 1024)
  end

  def test_memory_bound_when_ram_is_tight
    # 32 GB / 48 vCPU: 32768 * 0.85 / 4096 = 6 workers.
    assert_equal 6, compute(total_memory_mb: 32 * 1024)
  end

  def test_never_returns_zero_from_computed_budget
    # A memory-starved box still gets a cluster, not an accidental single mode.
    assert_equal 1, compute(total_memory_mb: 1024)
  end

  def test_per_worker_budget_is_tunable
    # Raising the assumed per-worker budget lowers the count.
    assert_equal 33, compute(per_worker_mb: 5000)
  end

  def test_headroom_is_tunable
    # 192*1024 * (1-0.30) / 4096 = 33.6 -> 33.
    assert_equal 33, compute(headroom: 0.30)
  end
end
