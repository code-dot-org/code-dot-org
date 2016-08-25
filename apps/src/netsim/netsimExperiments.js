/** @file Helpers for NetSim experiments, so we don't depend on strings. */
import experiments from '../experiments';

export function areLobbyHintsEnabled() {
  return experiments.isEnabled('netsimLobbyHints');
}
