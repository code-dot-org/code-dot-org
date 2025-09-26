'use client';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Chip, Collapse, Menu } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { clsx } from 'clsx';
import * as React from 'react';

import styles from './facetDropdown.module.scss';

type Props = {
  facetKey: string;
  label: string;
  options: string[];
  selected: Set<string> | undefined;
  onChange: (facetKey: string, next: Set<string>) => void;
  onOpenChange?: (open: boolean) => void;
  variant?: 'menu' | 'inline';
};

// --- Sub-component: renders the list of chips ---
function OptionChips({
  options,
  sel,
  onToggle,
}: {
  options: string[];
  sel: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <Box className={styles.gridList}>
      {options.map((opt) => {
        const isSelected = sel.has(opt);
        return (
          <Chip
            key={opt}
            label={opt}
            onClick={() => onToggle(opt)}
            onDelete={isSelected ? () => onToggle(opt) : undefined}
            deleteIcon={isSelected ? <CloseRoundedIcon fontSize="small" /> : undefined}
            variant={isSelected ? 'filled' : 'outlined'}
            color={isSelected ? 'primary' : 'default'}
            className={clsx(
              styles.chip,
              isSelected ? styles.chipSelected : styles.chipUnselected
            )}
          />
        );
      })}
    </Box>
  );
}

export default function FacetDropdown({
  facetKey,
  label,
  options,
  selected,
  onChange,
  onOpenChange,
  variant = 'menu',
}: Props) {
  // hooks
  const [openInline, setOpenInline] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorWidth, setAnchorWidth] = React.useState<number | undefined>();
  const menuOpen = Boolean(anchorEl);

  React.useEffect(() => {
    if (!menuOpen || !anchorEl) return;
    const update = () => setAnchorWidth(anchorEl.offsetWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [menuOpen, anchorEl]);

  // derived
  const sel = selected ?? new Set<string>();
  const isActive = sel.size > 0;

  // handlers
  const toggleValue = (value: string) => {
    const next = new Set(sel);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    next.has(value) ? next.delete(value) : next.add(value);
    onChange(facetKey, next);
  };

  const handleInlineClose = () => {
    setOpenInline(false);
    onOpenChange?.(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    onOpenChange?.(false);
  };

  // render
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
          className={clsx(
            styles.btnBase,
            isActive ? styles.btnActiveInline : styles.btnInactiveInline
          )}
        >
          {label}
        </Button>

        <Collapse in={openInline} unmountOnExit>
          <ClickAwayListener onClickAway={handleInlineClose}>
            <Box onMouseLeave={handleInlineClose} className={styles.inlinePanel}>
              <OptionChips options={options} sel={sel} onToggle={toggleValue} />
            </Box>
          </ClickAwayListener>
        </Collapse>
      </Box>
    );
  }

  // Desktop / Tablet (Menu)
  return (
    <>
      <Button
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          setAnchorWidth(e.currentTarget.offsetWidth);
          onOpenChange?.(true);
        }}
        endIcon={<ExpandMoreIcon />}
        variant={isActive ? 'contained' : 'outlined'}
        color={isActive ? 'primary' : 'inherit'}
        className={clsx(styles.btnBase, styles.btnPill, styles.btnInactiveMenu)}
      >
        {label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        MenuListProps={{ onMouseLeave: handleMenuClose }}
        keepMounted
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            className: styles.menuPaper,
            sx: {
              // keep dynamic width in TS (depends on button width)
              minWidth: (anchorWidth ?? 0) + 2,
            },
          },
        }}
      >
        <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
          <OptionChips options={options} sel={sel} onToggle={toggleValue} />
        </Box>
      </Menu>
    </>
  );
}
