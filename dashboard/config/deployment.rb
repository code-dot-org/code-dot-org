require_relative '../../deployment'

def slog(h)
  CDO.slog ({ application: :dashboard }).merge(h)
end
