import { Container, Paper, Title, Text, Avatar, Stack, Group, Badge, Divider, Loader, Center, Notification } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserData } from '../../redux/slices/User';
import http from '../../utils/http';
import { USER_URLS } from '../../utils/urls';

export const ProfilePage = () => {
  const cachedUser = useSelector(getUserData);
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('');
        const response = await http.get(USER_URLS.PROFILE);
        setUser(response.data?.user || cachedUser);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        setUser(cachedUser);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [cachedUser]);

  if (loading) {
    return (
      <Center h="50vh">
        <Loader color="teal" size="xl" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Text align="center">Please login to view your profile.</Text>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="md" shadow="sm">
        {error && (
          <Notification color="red" mb="md" onClose={() => setError('')}>
            {error}
          </Notification>
        )}
        <Stack align="center" mb="lg">
          <Avatar size={100} radius={100} color="teal">
            {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Title order={2} c="dark">{user.displayName || user.username || user.name || 'Member'}</Title>
          <Badge size="lg" color="teal" variant="filled">
            {user.role?.toUpperCase()}
          </Badge>
        </Stack>

        <Divider mb="lg" />

        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={500}>Email Address</Text>
            <Text>{user.email}</Text>
          </Group>

          <Group justify="space-between">
            <Text fw={500}>Phone Number</Text>
            <Text>{user.phone || 'Not provided'}</Text>
          </Group>
          
          <Group justify="space-between">
            <Text fw={500}>Impact Hub</Text>
            <Text c="teal" fw={700}>Active Member</Text>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ProfilePage;

