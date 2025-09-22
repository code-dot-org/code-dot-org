// FacetDropdown.tsx (drop-in)
'use client';
import * as React from 'react';
import { Box, Button, Chip, Menu } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

type Props = {
  facetKey: string;
  label: string;
  options: string[];
  selected: Set<string> | undefined;
  onChange: (facetKey: string, next: Set<string>) => void;
  onOpenChange?: (open: boolean) => void;   // <-- NEW
};

export default function FacetDropdown({
  facetKey,
  label,
  options,
  selected,
  onChange,
  onOpenChange,
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const sel = selected ?? new Set<string>();

  // close on mouse-leave (short delay to prevent flicker)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const scheduleClose = () => {
    cancelClose();
    timer.current = setTimeout(() => {
      setAnchorEl(null);
      onOpenChange?.(false);                 // report closed
    }, 120);
  };

  const toggle = (value: string) => {
    const next = new Set(sel);
    next.has(value) ? next.delete(value) : next.add(value);
    onChange(facetKey, next);
  };

  return (
    <>
      {/* Trigger chip */}
      <Button
        variant="outlined"
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          onOpenChange?.(true);              // report opened
        }}
        endIcon={<ExpandMoreIcon />}
        sx={{
          borderRadius: 999,
          textTransform: 'none',
          px: 2,
          height: 44,
          borderColor: 'divider',
          ...(sel.size ? { bgcolor: 'action.selected', borderColor: 'primary.main' } : null),
        }}
      >
        {label}
      </Button>

      {/* Rectangular dropdown; chips wrap naturally */}
<Menu
  anchorEl={anchorEl}
  open={open}
  onClose={() => { setAnchorEl(null); onOpenChange?.(false); }}
  keepMounted
  slotProps={{
    paper: {
      sx: {
        p: 1,
        borderRadius: 0, 
        minWidth: 260,
        maxWidth: 520,
        mt: 0.75,
        boxShadow: (t) => t.shadows[0],
        //  boxShadow: (t) => t.shadows[4],
      },
      onMouseEnter: cancelClose,
      onMouseLeave: scheduleClose,
    },
  }}
>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: 0.75,
            rowGap: 0.75,
            maxHeight: 360,
            overflow: 'auto',
          }}
        >
          {options.map((opt) => {
            const isSelected = sel.has(opt);
            return (
              <Chip
                key={opt}
                label={opt}
                onClick={() => toggle(opt)}
                onDelete={isSelected ? () => toggle(opt) : undefined}
                deleteIcon={isSelected ? <CloseRoundedIcon fontSize="small" /> : undefined}
                variant={isSelected ? 'filled' : 'outlined'}
                color={isSelected ? 'primary' : 'default'}
                size="small"
                sx={{
                  borderRadius: 1,
                  height: 28,
                  '& .MuiChip-label': {
                    px: 1,
                    fontSize: 12,
                    lineHeight: '18px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  },
                }}
              />
            );
          })}
        </Box>
      </Menu>
    </>
  );
}
