/**
 * @vitest-environment jsdom
 */

import {describe, expect, it} from 'vitest';

import type {GlobalNavItem} from '@code-dot-org/component-library/header';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';

import {
  buildCreateMenuItems,
  buildGlobalNav,
  buildMarketingGlobalNav,
  buildStudentMenuItems,
  buildTeacherMenuItems,
} from '../config';

/** Flatten top-level entries and their subItems into a single href list. */
function allHrefs(items: GlobalNavItem[]): string[] {
  return items.flatMap(item =>
    item.subItems ? item.subItems.map(sub => sub.href) : [item.href!],
  );
}

describe('buildGlobalNav', () => {
  it('resolves every code.org-hosted entry via siteConfig.marketingUrl', () => {
    const marketingPaths = [
      '/students',
      '/teach',
      '/educate/curriculum/elementary-school',
      '/educate/curriculum/middle-school',
      '/educate/curriculum/high-school',
      '/hour-of-ai',
      '/educate/curriculum/3rd-party',
      '/educate/it',
      '/educate/resources/videos',
      '/administrators',
      '/promote',
      '/donate',
      '/incubator',
      '/about',
      '/about/leadership',
      '/about/donors',
      '/about/partners',
      '/about/team',
      '/about/news',
      '/about/jobs',
      '/contact',
      '/faq',
      '/privacy',
      '/cookies',
      '/terms-of-service',
    ];
    const hrefs = allHrefs(buildGlobalNav());
    for (const path of marketingPaths) {
      expect(hrefs).toContain(siteConfig.marketingUrl(path));
    }
  });

  it('leaves genuinely external hosts untouched', () => {
    expect(allHrefs(buildGlobalNav())).toContain('https://forum.code.org/');
  });

  it('never hardcodes a //code.org href', () => {
    for (const href of allHrefs(buildGlobalNav())) {
      expect(href).not.toContain('//code.org');
    }
  });
});

describe('buildMarketingGlobalNav', () => {
  it('never hardcodes a //code.org href', () => {
    for (const href of allHrefs(buildMarketingGlobalNav())) {
      expect(href).not.toContain('//code.org');
    }
  });
});

describe('buildStudentMenuItems', () => {
  it('resolves Course Catalog and Incubator via siteConfig.marketingUrl', () => {
    const items = buildStudentMenuItems();
    expect(items.find(i => i.label === 'Course Catalog')?.href).toBe(
      siteConfig.marketingUrl('/students'),
    );
    expect(items.find(i => i.label === 'Incubator')?.href).toBe(
      siteConfig.marketingUrl('/incubator'),
    );
  });
});

describe('buildTeacherMenuItems', () => {
  it('resolves Incubator via siteConfig.marketingUrl', () => {
    const items = buildTeacherMenuItems();
    expect(items.find(i => i.label === 'Incubator')?.href).toBe(
      siteConfig.marketingUrl('/incubator'),
    );
  });
});

describe('buildCreateMenuItems', () => {
  it('resolves Mix & Move with AI via siteConfig.marketingUrl', () => {
    const items = buildCreateMenuItems();
    expect(items.find(i => i.label === 'Mix & Move with AI')?.href).toBe(
      siteConfig.marketingUrl('/mix-move-ai'),
    );
  });

  it('links Build Lab through the public projects route', () => {
    const items = buildCreateMenuItems();
    expect(items.find(i => i.label === 'Build Lab')?.href).toBe(
      '/projects/build-lab/new',
    );
  });
});
