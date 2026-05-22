/**
 * Seat reducer and useActiveSeat hook.
 *
 * Single source of truth for all seat mutations in the mobile prototype.
 * Persists every state change to Capacitor Preferences via storage.ts.
 *
 * Exposed surface:
 *   activeSeat    — current Seat or null (not yet selected or loading)
 *   seats         — ordered list of all Seat objects
 *   isLoading     — true while the boot load is in flight
 *   createSeat    — creates a new seat (max 4 per FR-001)
 *   clearSeat     — removes a seat and all its progress
 *   setActive     — sets the active seat without creating
 *   setLanguage   — updates the language on the active seat
 */

import {useCallback, useEffect, useReducer} from 'react';

import {
  readSeatIndex,
  readSeatProfile,
  removeSeatProgress,
  removeSeatProfile,
  writeSeatIndex,
  writeSeatProfile,
} from './storage';
import type {Language, Seat, SeatColorToken, SeatId, SeatIndex} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum seats per device (FR-001). */
const MAX_SEATS = 4;

/** Ordered color tokens — used to assign color when a new seat is created. */
const COLOR_ROTATION: SeatColorToken[] = ['red', 'blue', 'green', 'yellow'];

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface SeatState {
  seats: Seat[];
  activeSeatId: SeatId | null;
  isLoading: boolean;
}

const initialState: SeatState = {
  seats: [],
  activeSeatId: null,
  isLoading: true,
};

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

type SeatAction =
  | {type: 'BOOT_COMPLETE'; seats: Seat[]; activeSeatId: SeatId | null}
  | {type: 'CREATE'; seat: Seat; newActiveSeatId: SeatId}
  | {type: 'CLEAR'; seatId: SeatId}
  | {type: 'SET_ACTIVE'; seatId: SeatId}
  | {type: 'SET_LANGUAGE'; seatId: SeatId; language: Language};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/** Pure seat-list reducer — all side effects (storage) happen in action creators. */
function seatReducer(state: SeatState, action: SeatAction): SeatState {
  switch (action.type) {
    case 'BOOT_COMPLETE':
      return {
        seats: action.seats,
        activeSeatId: action.activeSeatId,
        isLoading: false,
      };

    case 'CREATE': {
      if (state.seats.length >= MAX_SEATS) return state;
      return {
        ...state,
        seats: [...state.seats, action.seat],
        activeSeatId: action.newActiveSeatId,
      };
    }

    case 'CLEAR': {
      const remaining = state.seats.filter(s => s.id !== action.seatId);
      const nextActive =
        state.activeSeatId === action.seatId
          ? (remaining[0]?.id ?? null)
          : state.activeSeatId;
      return {...state, seats: remaining, activeSeatId: nextActive};
    }

    case 'SET_ACTIVE':
      return {...state, activeSeatId: action.seatId};

    case 'SET_LANGUAGE':
      return {
        ...state,
        seats: state.seats.map(s =>
          s.id === action.seatId ? {...s, language: action.language} : s,
        ),
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/** Return value of useActiveSeat. */
export interface UseActiveSeatResult {
  /** Currently active Seat, or null if none selected. */
  activeSeat: Seat | null;
  /** All seats on this device (max 4). */
  seats: Seat[];
  /** True while the initial Preferences load is in flight. */
  isLoading: boolean;
  /** Creates a new seat and makes it active. No-op if already at MAX_SEATS. */
  createSeat: (opts: {language: Language}) => Promise<void>;
  /** Removes a seat and all its stored progress. */
  clearSeat: (seatId: SeatId) => Promise<void>;
  /** Makes an existing seat the active seat. */
  setActive: (seatId: SeatId) => Promise<void>;
  /** Updates the language on the active seat. */
  setLanguage: (language: Language) => Promise<void>;
}

/**
 * Loads seat data from Preferences on mount and exposes mutation helpers
 * that keep in-memory state and persisted storage in sync.
 */
export function useActiveSeat(): UseActiveSeatResult {
  const [state, dispatch] = useReducer(seatReducer, initialState);

  // Boot load — runs once on mount.
  useEffect(() => {
    void (async () => {
      const index = await readSeatIndex();
      const profiles: Seat[] = [];
      for (const id of index.seats) {
        const profile = await readSeatProfile(id);
        if (profile !== null) profiles.push(profile);
      }
      dispatch({
        type: 'BOOT_COMPLETE',
        seats: profiles,
        activeSeatId: index.activeSeatId,
      });
    })();
  }, []);

  const createSeat = useCallback(
    async ({language}: {language: Language}) => {
      if (state.seats.length >= MAX_SEATS) return;

      // Pick a color not yet used by existing seats.
      const usedColors = new Set(state.seats.map(s => s.color));
      const color =
        COLOR_ROTATION.find(c => !usedColors.has(c)) ?? COLOR_ROTATION[0]!;

      // crypto.randomUUID requires a secure context; fall back to Math.random
      // for HTTP dev environments (Capacitor native always uses HTTPS).
      const uuid =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      const seatId: SeatId = `seat:${uuid}`;
      const seat: Seat = {
        id: seatId,
        color,
        avatar: null,
        language,
        createdAt: Date.now(),
      };

      // Write profile before index (atomicity convention from storage.ts).
      await writeSeatProfile(seat);
      const index = await readSeatIndex();
      const newIndex: SeatIndex = {
        seats: [...index.seats, seatId],
        activeSeatId: seatId,
      };
      await writeSeatIndex(newIndex);

      dispatch({type: 'CREATE', seat, newActiveSeatId: seatId});
    },
    [state.seats],
  );

  const clearSeat = useCallback(async (seatId: SeatId) => {
    // Remove progress before profile, then remove from index.
    await removeSeatProgress(seatId);
    await removeSeatProfile(seatId);

    const index = await readSeatIndex();
    const remaining = index.seats.filter(id => id !== seatId);
    const nextActive =
      index.activeSeatId === seatId
        ? (remaining[0] ?? null)
        : index.activeSeatId;
    await writeSeatIndex({seats: remaining, activeSeatId: nextActive});

    dispatch({type: 'CLEAR', seatId});
  }, []);

  const setActive = useCallback(async (seatId: SeatId) => {
    const index = await readSeatIndex();
    await writeSeatIndex({...index, activeSeatId: seatId});
    dispatch({type: 'SET_ACTIVE', seatId});
  }, []);

  const setLanguage = useCallback(
    async (language: Language) => {
      if (!state.activeSeatId) return;
      const seatId = state.activeSeatId;
      const seat = state.seats.find(s => s.id === seatId);
      if (!seat) return;
      const updated: Seat = {...seat, language};
      await writeSeatProfile(updated);
      dispatch({type: 'SET_LANGUAGE', seatId, language});
    },
    [state.activeSeatId, state.seats],
  );

  const activeSeat = state.seats.find(s => s.id === state.activeSeatId) ?? null;

  return {
    activeSeat,
    seats: state.seats,
    isLoading: state.isLoading,
    createSeat,
    clearSeat,
    setActive,
    setLanguage,
  };
}
