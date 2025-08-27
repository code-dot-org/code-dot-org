'use client';
import CopyrightIcon from '@mui/icons-material/Copyright';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import NativeSelect from '@mui/material/NativeSelect';
import Stack from '@mui/material/Stack';
import {styled} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import {
  AnchorHTMLAttributes,
  HTMLAttributes,
  Key,
  ReactNode,
  MouseEvent,
} from 'react';

import './onetrust.scss';

import {isExternalLink} from '@/components/common/utils';
import {Brand} from '@/config/brand';

export interface SiteLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export interface SocialLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
  icon: ReactNode;
}

export interface Copyright {
  value: string;
  showIcon: boolean;
}

export interface LanguageOption {
  value: string;
  text: string;
}

export interface ImageLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  imageSrc: string;
  label: string;
  href: string;
  isLinkExternal?: boolean;
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /** Brand */
  brand: Brand;
  /** Footer links */
  siteLinks?: SiteLink[];
  /** Footer social links */
  socialLinks?: SocialLink[];
  /** Footer copyright */
  copyright?: Copyright;
  /** Footer language options */
  languages: LanguageOption[];
  /** Callback for language change */
  onLanguageChange: (args: string) => void;
  /** The selected locale code for the language dropdown */
  selectedLocaleCode?: string;
  /** Optional image */
  imageLink?: ImageLink;
  /** Footer class */
  className?: string;
}

const FooterRoot = styled('footer', {
  name: 'MuiFooter',
  slot: 'root',
})(() => ({}));

const FooterGrid = styled(Grid, {
  name: 'MuiFooter',
  slot: 'grid',
})(() => ({}));

const FooterLinks = styled(List, {
  name: 'MuiFooter',
  slot: 'links',
})(() => ({}));

const FooterLink = styled(Link, {
  name: 'MuiFooter',
  slot: 'link',
})(() => ({}));

const FooterImageLink = styled(Link, {
  name: 'MuiFooter',
  slot: 'imageLink',
})(() => ({}));

const Copyright = styled(Typography, {
  name: 'MuiFooter',
  slot: 'copyright',
})(() => ({}));

const FooterMui: React.FC<FooterProps> = ({
  siteLinks,
  socialLinks,
  copyright,
  languages,
  selectedLocaleCode,
  onLanguageChange,
  brand,
  imageLink,
  className,
}) => {
  return (
    <FooterRoot className={className}>
      <FooterGrid container spacing={2}>
        <Grid
          className="top-section"
          size={12}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap-reverse"
          gap={4}
        >
          {/* Site Links */}
          <Grid size={{md: 9.5}}>
            <FooterLinks
              className="site-links"
              aria-label="Site links"
              sx={{flexWrap: 'wrap'}}
            >
              {siteLinks?.map(({key, label, href, onClick, ...linkProps}) => (
                <ListItem key={key}>
                  <FooterLink
                    href={href}
                    variant="body4"
                    target={
                      typeof onClick !== 'function' &&
                      isExternalLink(href, brand, 'production')
                        ? '_blank'
                        : undefined
                    }
                    rel={
                      typeof onClick !== 'function' &&
                      isExternalLink(href, brand, 'production')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    onClick={onClick}
                    {...linkProps}
                  >
                    {label}
                  </FooterLink>
                </ListItem>
              ))}
            </FooterLinks>
          </Grid>
          {/* Language Selector */}
          <FormControl variant="standard">
            <NativeSelect
              className="notranslate"
              disableUnderline
              name="language-select"
              IconComponent={KeyboardArrowDownIcon}
              value={selectedLocaleCode}
              inputProps={{'aria-label': 'Language selection dropdown'}}
              onChange={e => onLanguageChange(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.text}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
        </Grid>
        <Grid
          size={12}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          {/* Copyright */}
          {copyright && (
            <Copyright variant="body4">
              {copyright.showIcon && <CopyrightIcon fontSize="small" />}
              {copyright.value}
            </Copyright>
          )}
          {/* Social Links */}
          <Stack direction="row" spacing={1} aria-label="Social links">
            {socialLinks?.map(({key, label, icon, href}) => (
              <IconButton
                className="social-icon"
                key={key}
                aria-label={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                disableRipple
              >
                {icon}
              </IconButton>
            ))}
          </Stack>
        </Grid>
        {/* Image Link */}
        {imageLink && (
          <FooterImageLink
            href={imageLink.href}
            target={imageLink.isLinkExternal ? '_blank' : undefined}
            rel={imageLink.isLinkExternal ? 'noopener noreferrer' : undefined}
            sx={{mb: 0}}
          >
            <img src={imageLink.imageSrc} alt={imageLink.label} />
          </FooterImageLink>
        )}
      </FooterGrid>
    </FooterRoot>
  );
};

export default FooterMui;
