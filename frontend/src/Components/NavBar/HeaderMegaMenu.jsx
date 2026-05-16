import {
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogin } from '@tabler/icons-react';
import { NavLink, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  getIsLoggedIn,
  getUserRole,
  removeUser,
} from '../../redux/slices/User';
import classes from './HeaderMegaMenu.module.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/donate', label: 'Post Donation' },
  { to: '/history', label: 'My History' },
  { to: '/feed', label: 'Available Donations' },
  { to: '/admin', label: 'Admin Dashboard' },
  { to: '/profile', label: 'Profile' },
];

export default function HeaderMegaMenu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const isLoggedIn = useSelector(getIsLoggedIn);
  const userRole = useSelector(getUserRole);
  const dispatch = useDispatch();

  const navItems = navLinks
    .filter((link) => {
      if (!isLoggedIn) {
        return link.to === '/login';
      }

      // Home and Profile are visible to everyone (Guest + Donor/Volunteer)
      // Admins are restricted to Admin Dashboard only
      if (userRole === 'Admin') {
        if (link.to === '/admin' ||link.to==='/profile') return true;
        return false;
      }

      if (link.to === '/' || link.to === '/login') {
        return true;
      }

      // Logic for Donor role: Can post and see their own history
      if (userRole === 'Donor') {
        if (link.to === '/donate' || link.to === '/history' || link.to === '/profile') return true;
        return false;
      }
      
      // Logic for Volunteer role: Can see Available Donations
      if (userRole === 'Volunteer') {
        if (link.to === '/feed' || link.to === '/history' || link.to === '/profile') return true;
        return false;
      }

      return true;
    })
    .map((link) => (
      <NavLink
      key={link.to}
      to={link.to}
      className={({ isActive }) =>
        `${classes.link} ${isActive ? classes.activeLink : ''}`
      }
      onClick={closeDrawer}
    >
      {link.label}
    </NavLink>
  ));

  return (
    <Box pb={0}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Text component={Link} to="/" className={classes.logo} style={{ fontSize: '24px', fontWeight: 900, textDecoration: 'none', color: 'black' }}>
            Nutri<Text component="span" c="teal">Loop</Text>
          </Text>

          <Group h="100%" gap={0} visibleFrom="sm">
            {navItems}
          </Group>

          <Group visibleFrom="sm">
            {isLoggedIn ? (
              <Button variant="default" onClick={() => dispatch(removeUser())}>
                Logout
              </Button>
            ) : (
              <Button
                variant="default"
                component={Link}
                to="/login"
                leftSection={<IconLogin size={16} />}
              >
                Log in
              </Button>
            )}
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
          <Divider my="sm" />
          <Box className={classes.drawerLinks}>
            {navItems}
          </Box>
          <Divider my="sm" />
          <Group justify="center" grow pb="xl" px="md">
            {isLoggedIn ? (
              <Button fullWidth onClick={() => { dispatch(removeUser()); closeDrawer(); }}>
                Logout
              </Button>
            ) : (
              <Button component={Link} to="/login" fullWidth onClick={closeDrawer}>
                Login
              </Button>
            )}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
