import ReactDOM from 'react-dom';
import Link from '../link'
import headerStyles from './header.module.scss';
import { useEffect } from 'react';

interface HeaderLink {
    text: string;
    href: string;
}

interface HeaderProps {
    links: HeaderLink[];
}

const Header = ({links}: HeaderProps) => {
    return <nav className={headerStyles.main}>
        <img src={'https://code.org/images/logo.svg'} className={headerStyles.logo} />
        <div className={'header_middle'}>
            <div className={'header_level'} />
        </div>
        <ul className={headerStyles.link_list}>
            {links.map(headerLink => <li><Link href={headerLink.href} text={headerLink.text} /></li>)}
        </ul>
    </nav>
}

export default Header;