import {render, screen} from '@testing-library/react';
import React from 'react';

import TeacherPromo, {
  TeacherPromoInfo,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherPromo';
import '@testing-library/jest-dom';

describe('TeacherPromo', () => {
  const mockPromo: TeacherPromoInfo = {
    id: '1',
    announcementType: 'New Curriculum',
    backgroundColor: 'Blue',
    buttonLabel: 'Learn More',
    buttonTarget: '/promo1',
    title: 'Promotion 1',
    description: 'Description for Promotion 1',
    image: '/image1.png',
    isClosable: true,
  };

  const onCloseMock = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the promotion title and description', () => {
    render(<TeacherPromo {...mockPromo} onClose={onCloseMock} />);
    screen.getByText('Promotion 1');
    screen.getByText('Description for Promotion 1');
  });

  it('renders the button with correct label and link', () => {
    render(<TeacherPromo {...mockPromo} onClose={onCloseMock} />);
    expect(screen.getByRole('link', {name: 'Learn More'})).toHaveAttribute(
      'href',
      '/promo1'
    );
  });

  it('renders the promotion image if provided', () => {
    render(<TeacherPromo {...mockPromo} onClose={onCloseMock} />);
    const image = screen.getByAltText('Promotion 1');
    expect(image).toHaveAttribute('src', '/image1.png');
  });

  it('does not render the image if not provided', () => {
    const promoWithoutImage = {...mockPromo, image: null};
    render(<TeacherPromo {...promoWithoutImage} onClose={onCloseMock} />);
    expect(screen.queryByAltText('Promotion 1')).toBeNull();
  });

  it('renders the close button if the promotion is closable', () => {
    render(<TeacherPromo {...mockPromo} onClose={onCloseMock} />);
    screen.getByLabelText('Close');
  });

  it('does not render the close button if the promotion is not closable', () => {
    const nonClosablePromo = {...mockPromo, isClosable: false};
    render(<TeacherPromo {...nonClosablePromo} onClose={onCloseMock} />);
    expect(screen.queryByLabelText('Close dialog')).toBeNull();
  });
});
