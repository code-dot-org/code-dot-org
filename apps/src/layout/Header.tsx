import React from 'react';
import DscoHeader from '@code-dot-org/component-library/header';

const LOGGED_OUT_LINKS = [
    { text: 'Learn', href: '/students' },
    { text: 'Teach', href: '/teach' },
    { text: 'Districts', href: '/administrators' },
]

const LOGGED_IN_LINKS = [
    { text: 'My Dashboard', href: '/home' },
    { text: 'Course Catalog', href: '/catalog' },
    { text: 'Projects', href: '/projects' },
    { text: 'Professional Learning', href: '/my-professional-learning' },
    { text: 'Incubator', href: '/incubator' },
]

const Header = () => {
    return <DscoHeader links={LOGGED_IN_LINKS} />;
}

export default Header;