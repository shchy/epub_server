import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';

export const LoadingComponent = ({
  isLoading,
  progress,
}: {
  isLoading: boolean;
  progress?: number;
}) => {
  return (
    <Backdrop
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
      open={isLoading}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          size="5rem"
          variant={progress === undefined ? undefined : 'determinate'}
          value={(progress ?? 0) * 100}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {progress !== undefined && (
            <Typography
              variant="caption"
              component="div"
              sx={{ color: '#fff' }}
            >{`${Math.round((progress ?? 0) * 100)}%`}</Typography>
          )}
        </Box>
      </Box>
    </Backdrop>
  );
};
