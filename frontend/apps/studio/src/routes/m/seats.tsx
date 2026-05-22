import {Box, Button, Typography} from '@mui/material';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useState, useCallback} from 'react';

import {LanguagePicker} from '@/modules/ai-decisions-mobile/i18n/LanguagePicker';
import {StringsProvider} from '@/modules/ai-decisions-mobile/i18n/StringsProvider';
import {ClearSeatDialog} from '@/modules/ai-decisions-mobile/seats/ClearSeatDialog';
import type {
  Language,
  SeatColorToken,
  SeatId,
} from '@/modules/ai-decisions-mobile/seats/types';
import {useActiveSeat} from '@/modules/ai-decisions-mobile/seats/useActiveSeat';

/** Color dot representing a seat on the picker grid. */
const SEAT_COLOR_CSS: Record<SeatColorToken, string> = {
  red: '#e53935',
  blue: '#1e88e5',
  green: '#43a047',
  yellow: '#fdd835',
};

/** Maximum seats allowed (mirrors useActiveSeat constant). */
const MAX_SEATS = 4;

/** Inner component — has navigate and seat state. */
function SeatsInner() {
  const navigate = useNavigate();
  const {seats, activeSeat, isLoading, createSeat, clearSeat, setActive} =
    useActiveSeat();
  const activeSeatId = activeSeat?.id ?? null;

  /** The seatId pending confirmation in the clear dialog, or null when closed. */
  const [clearPendingId, setClearPendingId] = useState<SeatId | null>(null);

  const handleLanguageSelect = useCallback(
    async (lang: Language) => {
      await createSeat({language: lang});
      void navigate({to: '/m/journey'});
    },
    [createSeat, navigate],
  );

  const handleSeatSelect = useCallback(
    async (seatId: SeatId) => {
      await setActive(seatId);
      void navigate({to: '/m/journey'});
    },
    [setActive, navigate],
  );

  const handleAddSeat = useCallback(async () => {
    await createSeat({language: 'en'});
    void navigate({to: '/m/journey'});
  }, [createSeat, navigate]);

  const handleClearConfirm = useCallback(async () => {
    if (!clearPendingId) return;
    await clearSeat(clearPendingId);
    setClearPendingId(null);
  }, [clearPendingId, clearSeat]);

  const handleClearCancel = useCallback(() => setClearPendingId(null), []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  // First launch: no seats yet — show language picker.
  if (seats.length === 0) {
    return <LanguagePicker onSelect={handleLanguageSelect} />;
  }

  const clearPendingSeat = seats.find(s => s.id === clearPendingId);

  return (
    <>
      <Box sx={{padding: 3, display: 'flex', flexDirection: 'column', gap: 2}}>
        <Typography variant="h5" component="h1" sx={{fontWeight: 700}}>
          Who's learning?
        </Typography>

        <Box
          sx={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2}}
        >
          {seats.map(seat => (
            <Box
              key={seat.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                padding: 2,
                borderRadius: 2,
                border: '2px solid',
                borderColor:
                  seat.id === activeSeatId ? 'primary.main' : 'grey.300',
                position: 'relative',
              }}
            >
              {/* Seat select — tapping the dot/name area enters the journey. */}
              <Box
                component="button"
                onClick={() => void handleSeatSelect(seat.id)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  width: '100%',
                }}
                data-testid={`seat-btn-${seat.color}`}
                aria-label={`Select ${seat.color} seat`}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: SEAT_COLOR_CSS[seat.color],
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{textTransform: 'uppercase', fontWeight: 600}}
                >
                  {seat.color}
                </Typography>
              </Box>

              {/* Clear action — bottom-right of the card. */}
              <Button
                size="small"
                color="error"
                variant="text"
                onClick={() => setClearPendingId(seat.id)}
                data-testid={`seat-clear-${seat.color}`}
                sx={{minWidth: 0, fontSize: '0.7rem', padding: '2px 6px'}}
              >
                Clear
              </Button>
            </Box>
          ))}

          {seats.length < MAX_SEATS ? (
            <Box
              component="button"
              onClick={() => void handleAddSeat()}
              data-testid="seat-add-btn"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                padding: 2,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.400',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                '&:hover': {borderColor: 'primary.light'},
              }}
            >
              <Typography variant="h4" component="span" aria-hidden>
                +
              </Typography>
              <Typography variant="body2">Add learner</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                padding: 2,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.200',
                backgroundColor: 'grey.50',
              }}
              data-testid="seats-full-hint"
            >
              <Typography
                variant="body2"
                color="text.disabled"
                textAlign="center"
              >
                All seats taken
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {clearPendingSeat && (
        <ClearSeatDialog
          open={clearPendingId !== null}
          seatLabel={
            clearPendingSeat.color.charAt(0).toUpperCase() +
            clearPendingSeat.color.slice(1)
          }
          onConfirm={() => void handleClearConfirm()}
          onCancel={handleClearCancel}
        />
      )}
    </>
  );
}

/** Seat picker home screen — the Capacitor shell launches here. */
function SeatsPage() {
  const {activeSeat} = useActiveSeat();
  const lang = activeSeat?.language ?? 'en';

  return (
    <StringsProvider lang={lang}>
      <SeatsInner />
    </StringsProvider>
  );
}

export const Route = createFileRoute('/m/seats')({
  component: SeatsPage,
});
