import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// types
import { IUserItem } from 'src/types/user';
// api
import { updateUser } from 'src/api/user';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentUser?: IUserItem;
};

export default function UserQuickEditForm({ currentUser, open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const UpdateUserSchema = Yup.object().shape({
    is_premium: Yup.string().required('Premium status is required'),
    is_banned: Yup.string().required('Status is required'),
    banned_reason: Yup.string()
      .nullable()
      .when('is_banned', {
        is: 'true',
        then: (schema) => schema.required('Banned reason is required'),
      }),
    premium_until: Yup.string().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      is_premium: currentUser?.is_premium ? 'true' : 'false',
      is_banned: currentUser?.is_banned ? 'true' : 'false',
      banned_reason: currentUser?.banned_reason || '',
      premium_until: currentUser?.premium_until
        ? currentUser.premium_until.slice(0, 16)
        : '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const isBanned = watch('is_banned') === 'true';

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentUser) return;

      const isBanning = data.is_banned === 'true';

      await updateUser(currentUser.id, {
        is_premium: data.is_premium === 'true',
        is_banned: isBanning,
        banned_reason: isBanning ? data.banned_reason : null,
        premium_until: data.premium_until || null,
      });

      reset();
      onClose();
      enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Update failed!', { variant: 'error' });
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 480 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns="repeat(1, 1fr)"
            sx={{ pt: 1 }}
          >
            <RHFSelect name="is_banned" label="Status">
              <MenuItem value="false">Active</MenuItem>
              <MenuItem value="true">Banned</MenuItem>
            </RHFSelect>

            {isBanned && (
              <RHFTextField
                name="banned_reason"
                label="Banned Reason"
                multiline
                rows={3}
              />
            )}

            <RHFSelect name="is_premium" label="Premium Status">
              <MenuItem value="true">Premium</MenuItem>
              <MenuItem value="false">Free</MenuItem>
            </RHFSelect>

            <RHFTextField
              name="premium_until"
              label="Premium Until"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
