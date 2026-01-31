import { useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  CheckCircle,
  Info,
  Warning,
  Error,
  DoneAll,
  Clear,
} from '@mui/icons-material';
import { useNotifications, createNotificationHelpers } from '../contexts/NotificationContext';

export default function NotificationCenter() {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'warning':
        return <Warning sx={{ color: '#ff9800' }} />;
      case 'error':
        return <Error sx={{ color: '#f44336' }} />;
      default:
        return <Info sx={{ color: '#2196f3' }} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            position: 'relative',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          {unreadCount > 0 ? (
            <Badge
              badgeContent={unreadCount > 99 ? '99+' : unreadCount}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.6rem',
                  height: 16,
                  minWidth: 16,
                },
              }}
            >
              <Notifications sx={{ color: 'white' }} />
            </Badge>
          ) : (
            <NotificationsNone sx={{ color: 'white' }} />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            background: 'rgba(20, 20, 25, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(98, 0, 69, 0.3)',
            color: 'white',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(98, 0, 69, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Notifications
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  p: 0.5,
                }}
                startIcon={<DoneAll fontSize="small" />}
              >
                Mark all read
              </Button>
            )}
            <Button
              size="small"
              onClick={clearNotifications}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.75rem',
                minWidth: 'auto',
                p: 0.5,
              }}
              startIcon={<Clear fontSize="small" />}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {/* Notification List */}
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsNone sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    py: 1.5,
                    px: 2,
                    bgcolor: notification.read ? 'transparent' : 'rgba(98, 0, 69, 0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    if (notification.action_url) {
                      window.open(notification.action_url, '_blank');
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'white',
                            fontWeight: notification.read ? 'normal' : 600,
                            mb: 0.5,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}
                        >
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.5)' }}
                          >
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                          {notification.action_text && (
                            <Chip
                              label={notification.action_text}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(98, 0, 69, 0.8)',
                                color: 'white',
                                fontSize: '0.65rem',
                                height: 20,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'rgba(98, 0, 69, 1)',
                        minWidth: 8,
                      }}
                    />
                  )}
                </ListItem>
                {index < notifications.length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(98, 0, 69, 0.2)' }} />
                )}
              </Box>
            ))}
          </List>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid rgba(98, 0, 69, 0.3)',
              textAlign: 'center',
            }}
          >
            <Button
              size="small"
              onClick={handleClose}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.75rem',
              }}
            >
              Close
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
}
