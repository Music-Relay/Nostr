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
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <AppBar position="sticky" sx={{ color: "#000", backgroundColor: '#fff' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>

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
              <MenuItem key={'CollectionPoint'} onClick={handleCloseNavMenu}>
                <Link href={"/collection-point"}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography textAlign="center">Forum</Typography>
                  </div>  
                </Link>
              </MenuItem>
              <MenuItem key={'Events'} onClick={handleCloseNavMenu}>
                <Link href={"/events"}>
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
              key={'CollectionPoint'}
              onClick={handleCloseNavMenu}
              sx={{ 
                color: "#000", 
                display: 'block' 
              }}
              href={'/collection-point'}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Forum</span>
              </div>
            </Button>
            <Button
              key={'Events'}
              onClick={handleCloseNavMenu}
              sx={{ 
                color: "#000", 
                display: 'block' 
              }}
              href={'/events'}
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
                <MenuItem key={'Login'} onClick={handleCloseUserMenu}>
                  <a href='/login'><Typography textAlign="center">Se connecter</Typography></a>
                </MenuItem>
                <MenuItem key={'Signup'} onClick={handleCloseUserMenu}>
                  <a href='/signup'><Typography textAlign="center">S&apos;inscrire</Typography></a>
                </MenuItem>
              </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;