import Menu from '@mui/material/Menu';

import LinkList from './LinkList';

const MenuList: React.FC<{
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
}> = ({anchorEl, open, onClose}) => {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <LinkList
        linkList={[
          {
            key: 'profile',
            label: 'Profile',
            href: '/profile',
            typography: 'body3',
          },
          {
            key: 'my-account',
            label: 'My account',
            href: '/my-account',
            typography: 'body3',
          },
          {
            key: 'logout',
            label: 'Logout',
            href: '/logout',
            typography: 'body3',
          },
        ]}
      />
    </Menu>
  );
};

export default MenuList;
