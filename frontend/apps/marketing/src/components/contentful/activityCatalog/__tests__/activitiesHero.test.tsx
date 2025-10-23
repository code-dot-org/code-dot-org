import {render, screen} from '@testing-library/react';

import {ActivityType} from '@/modules/activityCatalog/types/Activity';

import ActivitiesHero from '../activitiesHero';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock('@/components/contentful/link', () => (props: any) => (
  <a href={props.href}>{props.children}</a>
));

describe('ActivitiesHero', () => {
  it('renders Hour of Code hero content', () => {
    render(<ActivitiesHero activityType={ActivityType.HOUR_OF_CODE} />);
    expect(
      screen.getByRole('heading', {name: /Explore Hour of Code Activities/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The most beloved Hour of Code activities aren’t going anywhere/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /Hour of AI Activities/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /Legacy Hour of Code Activities/i}),
    ).toBeInTheDocument();
  });

  it('renders Hour of AI hero content', () => {
    render(<ActivitiesHero activityType={ActivityType.HOUR_OF_AI} />);
    expect(
      screen.getByRole('heading', {name: /Explore Hour of AI Activities/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The new Hour of AI activity catalog launches on November 12, 2025/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /the most beloved Hour of Code activities aren’t going anywhere/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /Hour of AI Activities/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /Legacy Hour of Code Activities/i}),
    ).toBeInTheDocument();
  });

  it('renders teacher links', () => {
    render(<ActivitiesHero activityType={ActivityType.HOUR_OF_CODE} />);
    const hostLink = screen.getByText(/Host an hour/i);
    const guideLink = screen.getByText(/read the How-To Guide/i);
    expect(hostLink.closest('a')).toHaveAttribute(
      'href',
      '/hour-of-ai/partners#host-event',
    );
    expect(guideLink.closest('a')).toHaveAttribute(
      'href',
      '/hour-of-ai/how-to/k-12educator',
    );
  });

  it('renders correct text for both activity types', () => {
    const {rerender} = render(
      <ActivitiesHero activityType={ActivityType.HOUR_OF_CODE} />,
    );
    expect(
      screen.getByText(/Explore Hour of Code Activities/i),
    ).toBeInTheDocument();
    rerender(<ActivitiesHero activityType={ActivityType.HOUR_OF_AI} />);
    expect(
      screen.getByText(/Explore Hour of AI Activities/i),
    ).toBeInTheDocument();
  });

  it('renders correct button hrefs', () => {
    render(<ActivitiesHero activityType={ActivityType.HOUR_OF_AI} />);
    const aiBtn = screen.getByRole('link', {name: /Hour of AI Activities/i});
    const codeBtn = screen.getByRole('link', {
      name: /Legacy Hour of Code Activities/i,
    });
    expect(aiBtn).toHaveAttribute('href', '/activities/hour-of-ai');
    expect(codeBtn).toHaveAttribute('href', '/activities/hour-of-code');
  });
});
