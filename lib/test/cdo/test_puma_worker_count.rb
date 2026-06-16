require 'minitest/autorun'
require_relative '../../cdo/puma_worker_count'

# Standalone unit test for the pure worker-count calculation. Deliberately
# avoids the Rails/DB test harness so it runs without a database.
class PumaWorkerCountTest < Minitest::Test
  # 192 GB / 48 vCPU frontend (m7i.12xlarge), default budget.
  PROD_MEMORY_MB = 192 * 1024

  def compute(**overrides)
    defaults = {
      explicit: nil,
      cpu_count: 48,
      total_memory_mb: PROD_MEMORY_MB,
      per_worker_mb: 4096,
      headroom: 0.15
    }
    Cdo::PumaWorkerCount.compute(**defaults.merge(overrides))
  end

  def test_production_defaults_resolve_to_40
    assert_equal 40, compute
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
