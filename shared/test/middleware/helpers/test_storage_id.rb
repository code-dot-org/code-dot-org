require_relative '../../test_helper'
require_relative '../../../middleware/helpers/storage_id'

class StorageIdTest < Minitest::Test
  include SetupTest

  # Create a barrier to synchronize thread start
  class ThreadBarrier
    def initialize(count)
      @count = count
      @mutex = Mutex.new
      @cond = ConditionVariable.new
      @waiting = 0
    end

    def wait
      @mutex.synchronize do
        @waiting += 1
        if @waiting >= @count
          @waiting = 0
          @cond.broadcast
        else
          @cond.wait(@mutex)
        end
      end
    end
  end

  def test_create_storage_id_cookie_with_anon_user_id
    stubs(:storage_encrypt_id).returns('encrypted-storage-id')

    anon_user_id = SecureRandom.uuid
    request = mock(anon_user_id: anon_user_id, shared_cookie_domain: 'code.org')
    stubs(:request).returns(request)

    response = mock
    response.stubs(:set_cookie)
    stubs(:response).returns(response)

    expected_storage_id = rand
    expects(:create_storage_id_for_user).with(anon_user_id:).returns(expected_storage_id)
    assert_equal expected_storage_id, create_storage_id_cookie
  end

  def test_create_storage_id_cookie_without_anon_user_id
    stubs(:storage_encrypt_id).returns('encrypted-storage-id')

    request = mock(anon_user_id: nil, shared_cookie_domain: 'code.org')
    stubs(:request).returns(request)

    response = mock
    response.stubs(:set_cookie)
    stubs(:response).returns(response)

    expected_storage_id = rand
    expects(:create_storage_id_for_user).with(anon_user_id: nil).returns(expected_storage_id)
    assert_equal expected_storage_id, create_storage_id_cookie
  end

  # Ensures decrypt/encrypt performance exceeds a minimum iterations per second threshold.
  def test_encrypt_performance
    require 'benchmark/ips'
    result = Benchmark.ips(time: 1, warmup: 0.5, quiet: true) do |x|
      id_range = 1..10000
      x.report do
        id = rand(id_range)
        assert_equal id, storage_decrypt_id(storage_encrypt_id(id))
      end
    end
    assert_operator result.entries.first.ips, :>, 3000
  end

  def test_storage_encrypt_decrypt_thread_safety
    # Define test parameters
    thread_count = 50
    operations_per_thread = 10_000
    failures = Queue.new
    successful_operations = 0
    successful_operations_mutex = Mutex.new

    barrier = ThreadBarrier.new(thread_count)

    # Track execution time.
    start_time = Time.now

    # Create and start threads.
    threads = Array.new(thread_count) do |thread_id|
      Thread.new do
        thread_successes = 0

        # Wait for all threads to be ready before starting.
        barrier.wait

        operations_per_thread.times do |i|
          # Create a unique value for each thread and operation
          original_value = "thread-#{thread_id}-value-#{i}"

          begin
            # Encrypt the value using storage_encrypt.
            encrypted = storage_encrypt(original_value)

            # Introduce random delay to increase chance of collision.
            sleep(rand * 0.0001) if i % 100 == 0

            # Decrypt the value using storage_decrypt.
            decrypted = storage_decrypt(encrypted)

            # Verify the decryption matches the original.
            if decrypted == original_value
              thread_successes += 1
            else
              failures << "Thread #{thread_id}, operation #{i}: Expected '#{original_value}' but got '#{decrypted}'"
            end
          rescue => exception
            failures << "Thread #{thread_id}, operation #{i}: Exception: #{exception.class} - #{exception.message}"
          end
        end

        # Add this thread's successful operations to the total.
        successful_operations_mutex.synchronize do
          successful_operations += thread_successes
        end
      end
    end

    # Wait for all threads to complete.
    threads.each(&:join)

    # Calculate execution statistics.
    total_time = Time.now - start_time
    total_operations = thread_count * operations_per_thread
    actual_successful_operations = successful_operations
    throughput = total_operations / total_time

    # Prepare assertion message with failure details.
    failure_count = failures.size
    failed_operations_message = if failure_count > 0
                                  error_details = []
                                  error_details << "#{failure_count} failures detected in storage_encrypt/decrypt:"

                                  # Include up to 10 failure details.
                                  sample_size = [10, failure_count].min
                                  sample_size.times do
                                    error_details << failures.pop
                                  end

                                  # Add ellipsis if more failures exist.
                                  error_details << "..." unless failures.empty?

                                  # Add performance info to the message.
                                  error_details << "Threads: #{thread_count}"
                                  error_details << "Operations per thread: #{operations_per_thread}"
                                  error_details << "Total expected operations: #{total_operations}"
                                  error_details << "Successful operations: #{successful_operations}"
                                  error_details << "Execution time: #{total_time.round(2)} seconds"
                                  error_details << "Throughput: #{throughput.round(2)} operations/second"

                                  error_details.join("\n")
                                else
                                  "Expected #{total_operations} successful operations but got #{successful_operations}"
                                end

    # Assert all operations were successful.
    assert_equal(
      total_operations,
      actual_successful_operations,
      "Expected #{total_operations} successful operations but got #{actual_successful_operations}: #{failed_operations_message}"
    )
    assert_equal 0, failure_count, "Expected 0 failures but got #{failure_count}"
    # Ensure execution time was less than 5 seconds.
    assert_operator total_time.round(2), :<, 5
  end
end
