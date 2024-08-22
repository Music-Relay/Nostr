"use client";

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import Link from 'next/link';
import { redirect } from 'next/dist/server/api-utils';

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    // redirect to login page
    window.location.href = '/login';
  };

  const privateKey = typeof window !== 'undefined' ? localStorage.getItem('privateKey') : null;

  return (
    <AppBar position="sticky" sx={{ color: "#000", backgroundColor: '#fff' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          <Link href={"/"}>
            <img src="/logo.png" alt="logo" style={{ height: '40px', width: '40px' }} />
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', lg: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', lg: 'none' },
              }}
            >
              <MenuItem key={'Home'} onClick={handleCloseNavMenu}>
                <Link href={"/"}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography textAlign="center">Home</Typography>
                  </div>
                </Link>
              </MenuItem>
              <MenuItem key={'Forum'} onClick={handleCloseNavMenu}>
                <Link href={"/posts"}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography textAlign="center">Forum</Typography>
                  </div>  
                </Link>
              </MenuItem>
              <MenuItem key={'Groups'} onClick={handleCloseNavMenu}>
                <Link href={"/groups"}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography textAlign="center">Groups</Typography>
                  </div>
                </Link>
              </MenuItem>
            </Menu>
          </Box>
          
          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', lg: 'flex' },
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}>
            <Button
              key={'Home'}
              onClick={handleCloseNavMenu}
              sx={{ 
                color: "#000", 
                display: 'block' 
              }}
              href={'/'}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Home</span>
              </div>
            </Button>
            <Button
              key={'Forum'}
              onClick={handleCloseNavMenu}
              sx={{ 
                color: "#000", 
                display: 'block' 
              }}
              href={'/posts'}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Forum</span>
              </div>
            </Button>
            <Button
              key={'Groups'}
              onClick={handleCloseNavMenu}
              sx={{ 
                color: "#000", 
                display: 'block' 
              }}
              href={'/groups'}
            >
              <div style={{ display: 'flex', alignItems: 'center', color: 'primary' }}>
                <span>Groups</span>
              </div>
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <AccountCircleIcon sx={{ color: '#000', height: '40px', width: '40px' }} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
            {privateKey ? (
              <div>
                <MenuItem key={'Login'} onClick={handleCloseUserMenu}>
                  <a href='/profile'><Typography textAlign="center">Profile</Typography></a>
                </MenuItem>
                <MenuItem key={'Signup'} onClick={handleCloseUserMenu}>
                  <a onClick={handleLogout}><Typography textAlign="center">Log out</Typography></a>
                </MenuItem>
              </div>
            ) : (
              <div>
                <MenuItem key={'Login'} onClick={handleCloseUserMenu}>
                  <a href='/login'><Typography textAlign="center">Log in</Typography></a>
                </MenuItem>
              </div>
            )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;