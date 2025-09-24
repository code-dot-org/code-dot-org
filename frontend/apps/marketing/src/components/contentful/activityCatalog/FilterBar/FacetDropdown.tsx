'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Box, Button, Chip, Collapse, Menu} from '@mui/material';
import * as React from 'react';

type Props = {
  facetKey: string;
  label: string;
  options: string[];
  selected: Set<string> | undefined;
  onChange: (facetKey: string, next: Set<string>) => void;
  onOpenChange?: (open: boolean) => void;
  
  variant?: 'menu' | 'inline';
};

export default function FacetDropdown({
  facetKey,
  label,
  options,
  selected,
  onChange,
  onOpenChange,
  variant = 'menu',
}: Props) {
  const sel = selected ?? new Set<string>();
  const isActive = sel.size > 0;

  const toggleValue = (value: string) => {
    const next = new Set(sel);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(facetKey, next);
  };

  const leaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelLeave = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };
  const scheduleLeaveClose = (cb: () => void) => {
    cancelLeave();
    leaveTimer.current = setTimeout(cb, 120);
  };
  const PURPLE = '#2c089f';
  const PURPLE_HOVER = '#24087f';

  /* Mobile */
  const [openInline, setOpenInline] = React.useState(false);

  if (variant === 'inline') {
    return (
      <Box>
        <Button
          onClick={() => {
            const next = !openInline;
            setOpenInline(next);
            onOpenChange?.(next);
          }}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transition: 'transform 0.15s ease',
                transform: openInline ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          }
          variant={isActive ? 'contained' : 'outlined'}
          color={isActive ? 'primary' : 'inherit'}
          sx={{
            borderRadius: 0,
            textTransform: 'none',
            px: 2,
            height: 44,

            ...(isActive
              ? {
                  backgroundColor: PURPLE,
                  color: '#fff',
                  '& .MuiButton-endIcon > *': {color: 'inherit'},
                  '&:hover': {
                    backgroundColor: PURPLE_HOVER,
                  },
                }
              : {
                  backgroundColor: '#e9faff',
                  borderColor: 'primary.main',
                  color: 'text.primary',
                  '& .MuiButton-endIcon > *': {color: 'inherit'},
                }),
          }}
        >
          {label}
        </Button>

        <Collapse in={openInline} unmountOnExit>
          <Box
            onMouseEnter={cancelLeave}
            onMouseLeave={() =>
              scheduleLeaveClose(() => {
                setOpenInline(false);
                onOpenChange?.(false);
              })
            }
            sx={{
              mt: 0,
              p: 1.25,
              width: '100%',
              border: 'none',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                rowGap: 0.75,
                justifyItems: 'start',
              }}
            >
              {options.map(opt => {
                const selected = sel.has(opt);
                return (
                  <Chip
                    key={opt}
                    label={opt}
                    onClick={() => toggleValue(opt)}
                    onDelete={selected ? () => toggleValue(opt) : undefined}
                    deleteIcon={
                      selected ? (
                        <CloseRoundedIcon fontSize="small" />
                      ) : undefined
                    }
                    variant={selected ? 'filled' : 'outlined'}
                    color={selected ? 'primary' : 'default'}
                    sx={{
                      borderRadius: 999,
                      height: 34,
                      '& .MuiChip-label': {
                        px: 1.25,
                        fontSize: 13,
                        lineHeight: '20px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      },
                      '& .MuiChip-deleteIcon': {color: 'inherit'},

                      // 🔽 when selected, make text & X white on hover
                      ...(selected && {
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          color: '#fff',
                          '& .MuiChip-deleteIcon': {color: 'inherit'},
                        },
                      }),
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Collapse>
      </Box>
    );
  }

  /* Desktop / Tablet */
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorWidth, setAnchorWidth] = React.useState<number | undefined>(
    undefined,
  );
  const menuOpen = Boolean(anchorEl);

  React.useEffect(() => {
    if (!menuOpen || !anchorEl) return;
    const update = () => setAnchorWidth(anchorEl.offsetWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [menuOpen, anchorEl]);

  return (
    <>
      <Button
        onClick={e => {
          setAnchorEl(e.currentTarget);
          setAnchorWidth(e.currentTarget.offsetWidth);
          onOpenChange?.(true);
        }}
        endIcon={<ExpandMoreIcon />}
        variant={isActive ? 'contained' : 'outlined'}
        color={isActive ? 'primary' : 'inherit'}
        sx={{
          borderRadius: 999,
          textTransform: 'none',
          px: 2,
          height: 44,
          ...(isActive
            ? {
                color: t => t.palette.primary.contrastText,
                '& .MuiButton-endIcon > *': {color: 'inherit'},
              }
            : {
                borderColor: 'primary.main',
                color: 'text.primary',
                '& .MuiButton-endIcon > *': {color: 'inherit'},
              }),
        }}
      >
        {label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => {
          setAnchorEl(null);
          onOpenChange?.(false);
        }}
        keepMounted
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        transformOrigin={{vertical: 'top', horizontal: 'left'}}
        slotProps={{
          paper: {
            sx: {
              mt: 0,
              minWidth: (anchorWidth ?? 0) + 2,
              maxWidth: 400,
              bgcolor: '#e9faff',
              border: 'none',
              borderRadius: 0.4,
              py: 1.25,
              pr: 1.25,
              pl: 0,
              boxShadow: '0 1px 2px rgba(0,0,0,0.14)',
            },
            onMouseEnter: cancelLeave,
            onMouseLeave: () =>
              scheduleLeaveClose(() => {
                setAnchorEl(null);
                onOpenChange?.(false);
              }),
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            rowGap: 0.75,
            maxHeight: 360,
            overflow: 'auto',
            justifyItems: 'start',
          }}
        >
          {options.map(opt => {
            const selected = sel.has(opt);
            return (
              <Chip
                key={opt}
                label={opt}
                onClick={() => toggleValue(opt)}
                onDelete={selected ? () => toggleValue(opt) : undefined}
                deleteIcon={
                  selected ? <CloseRoundedIcon fontSize="small" /> : undefined
                }
                variant={selected ? 'filled' : 'outlined'}
                color={selected ? 'primary' : 'default'}
                sx={{
                  borderRadius: 999,
                  height: 34,
                  '& .MuiChip-label': {
                    px: 1.25,
                    fontSize: 13,
                    lineHeight: '20px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  },
                  '& .MuiChip-deleteIcon': {color: 'inherit'},

                  // Unselected look
                  ...(selected
                    ? {
                        bgcolor: 'primary.main',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          color: '#fff',
                          '& .MuiChip-deleteIcon': {color: 'inherit'},
                        },
                      }
                    : {
                        bgcolor: '#ffffff',
                        color: '#000000',
                        '&:hover': {bgcolor: '#f5f5f5'},
                      }),
                }}
              />
            );
          })}
        </Box>
      </Menu>
    </>
  );
}
