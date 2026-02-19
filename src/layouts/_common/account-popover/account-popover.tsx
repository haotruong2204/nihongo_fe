import { m } from 'framer-motion';
// @mui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { varHover } from 'src/components/animate';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { Box, Typography } from '@mui/material';
import { NavSectionVertical } from 'src/components/nav-section';
import { useNavData } from './config-navigation';

export default function AccountPopover() {
  const drawer = useBoolean();
  const router = useRouter();
  const { logout, user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const navData = useNavData();

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <IconButton onClick={drawer.onFalse}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const handleLogout = async () => {
    try {
      await logout();
      drawer.onFalse();
      router.replace('/');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={drawer.onTrue}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(drawer.value && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src={user?.photoURL}
          alt={user?.email}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {user?.email.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      {/* <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 420 },
        }}
      >
        {renderHead}

        <Avatar
          src={user?.photoURL}
          alt={user?.email}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {user?.email.charAt(0).toUpperCase()}
        </Avatar>

        {user?.email}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Button
          variant="contained"
          color="primary"
          sx={{
            margin: 1.5,
            padding: 1,
          }}
          onClick={handleLogout}
        >
          Rời đi
        </Button>
      </Drawer> */}

      <Drawer
        anchor="right"
        open={drawer.value}
        onClose={drawer.onFalse}
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 420 },
        }}
      >
        {renderHead}
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar src="https://i.pravatar.cc/150?img=3" sx={{ width: 80, height: 80, mb: 1 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.role.toUpperCase()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', mb: 4 }} />

        <NavSectionVertical
          data={navData}
          config={{
            currentRole: user?.role || 'admin',
          }}
        />

        <Box flexGrow={1} />
        {/* Logout */}
        <Button
          variant="contained"
          color="primary"
          sx={{
            margin: 1.5,
            padding: 1,
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Drawer>
    </>
  );
}
