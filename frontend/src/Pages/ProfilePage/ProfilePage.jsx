import { Container, Paper, Title, Text, Avatar, Stack, Group, Badge, Divider } from '@mantine/core';
import { useSelector } from 'react-redux';
import { getUserData } from '../../redux/slices/User';

export const ProfilePage = () => {
  const user = useSelector(getUserData);

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
        <Stack align="center" mb="lg">
          <Avatar size={100} radius={100} color="teal">
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Title order={2}>{user.name}</Title>
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
            <Text fw={500}>Account Type</Text>
            <Text>{user.role === 'Donor' ? 'Food Donor' : 'Volunteer / Driver'}</Text>
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

