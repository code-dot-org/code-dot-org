# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(16777215)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#

class NetSim < Blockly
  serialized_attrs %w(
    show_clients_in_lobby
    show_routers_in_lobby
    can_connect_to_clients
    can_connect_to_routers
    show_add_router_button
    show_log_browser_button
    message_granularity
    automatic_receive
    broadcast_mode
    connected_routers
    minimum_extra_hops
    maximum_extra_hops
    address_format
    packet_count_bit_width
    router_expects_packet_header
    client_initial_packet_header
    show_hostname_in_graph
    show_add_packet_button
    show_packet_size_control
    default_packet_size_limit
    show_tabs
    default_tab_index
    show_pulse_rate_slider
    show_metronome
    show_encoding_controls
    default_enabled_encodings
    show_bit_rate_control
    lock_bit_rate_control
    default_bit_rate_bits_per_second
    show_chunk_size_control
    lock_chunk_size_control
    default_chunk_size_bits
    show_router_bandwidth_control
    default_router_bandwidth
    show_router_memory_control
    default_router_memory
    default_random_drop_chance
    show_dns_mode_control
    default_dns_mode
  )

  # Attributes that are stored as JSON strings but should be passed through to the app as
  # actual JSON objects.  You can list attributes in snake_case here for consistency, but this method
  # returns camelCase properties because of where it's used in the pipeline.
  def self.json_object_attrs
    %w(
      router_expects_packet_header
      client_initial_packet_header
      show_tabs
      show_encoding_controls
      default_enabled_encodings
    ).map {|x| x.camelize(:lower)}
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    ['netsim']
  end

  # DNS modes, used by levelbuilder
  def self.dns_modes
    %w(none manual automatic)
  end

  # Message granularity options, used by levelbuilder
  def self.message_granularity_options
    %w(bits packets)
  end

  def self.create_from_level_builder(params, level_params)
    create! level_params.merge(
      user: params[:user],
      game: Game.netsim,
      level_num: 'custom'
    )
  end

  def finishable?
    false
  end
end
