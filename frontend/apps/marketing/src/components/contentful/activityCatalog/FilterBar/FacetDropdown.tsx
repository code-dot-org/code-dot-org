'use client';

 
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Chip, Collapse, Menu } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
// eslint-disable-next-line import-x/no-named-as-default
import clsx from 'clsx';
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

export default function FacetDropdown({
  facetKey,
  label,
  options,
  selected,
  onChange,
  onOpenChange,
  variant = 'menu',
}: Props) {
  // ----- hooks (top) -----
  const sel = selected ?? new Set<string>();
  const isActive = sel.size > 0;

  // Inline
  const [openInline, setOpenInline] = React.useState(false);

  // Menu
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

  // ----- helpers -----
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
            <Box
              onMouseLeave={handleInlineClose}
              className={styles.inlinePanel}
            >
              <Box className={styles.gridList}>
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
                      className={clsx(
                        styles.chip,
                        selected ? styles.chipSelected : styles.chipUnselected
                      )}
                    />
                  );
                })}
              </Box>
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
        onClick={e => {
          setAnchorEl(e.currentTarget);
          setAnchorWidth(e.currentTarget.offsetWidth);
          onOpenChange?.(true);
        }}
        endIcon={<ExpandMoreIcon />}
        variant={isActive ? 'contained' : 'outlined'}
        color={isActive ? 'primary' : 'inherit'}
        className={clsx(
          styles.btnBase,
          styles.btnPill,
          isActive ? styles.btnActiveMenu : styles.btnInactiveMenu
        )}
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
        <Box className={styles.gridList} sx={{ maxHeight: 360, overflow: 'auto' }}>
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
                className={clsx(
                  styles.chip,
                  selected ? styles.chipSelected : styles.chipUnselected
                )}
              />
            );
          })}
        </Box>
      </Menu>
    </>
  );
}
