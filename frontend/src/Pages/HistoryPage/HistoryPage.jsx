import { Container, Title, Text, Card, Group, Badge, SimpleGrid, Stack, Loader, Center, Paper } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserData } from '../../redux/slices/User';
import http from '../../utils/http';
import { DONATION_URLS } from '../../utils/urls';

function HistoryPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(getUserData);

  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        // Fetch only donations belonging to the logged-in user using their ID (handled by backend 'protect' middleware)
        const response = await http.get(DONATION_URLS.GET_MY_POSTS);
        setDonations(response.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyHistory();
  }, [user]);

  if (loading) {
    return (
      <Center h="50vh">
        <Loader color="teal" size="xl" />
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack mb="xl" align="center">
        <Title order={1} c="teal">My Donation History</Title>
        <Text c="dimmed">Tracking your impact on NutriLoop</Text>
      </Stack>

      {donations.length === 0 ? (
        <Center h="30vh">
          <Paper withBorder p="xl" radius="md" align="center">
            <Text size="lg">You haven't posted any donations yet.</Text>
            <Text size="sm" c="dimmed" mt="xs">Your contributions will appear here once you share food.</Text>
          </Paper>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {donations.map((donation) => (
            <Card key={donation._id} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={700} size="lg">{donation.foodItem}</Text>
                <Badge color="blue" variant="light">
                  {donation.status || 'Pending'}
                </Badge>
              </Group>

              <Text size="sm" c="dimmed" mb="md">
                Posted on: {new Date(donation.createdAt || Date.now()).toLocaleDateString()}
              </Text>

              <Stack gap="xs">
                <Group gap={5}>
                  <Text fw={500} size="sm">Quantity:</Text>
                  <Text size="sm">{donation.quantity} units</Text>
                </Group>
                <Group gap={5}>
                  <Text fw={500} size="sm">Location:</Text>
                  <Text size="sm">{donation.address || donation.location}</Text>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

export default HistoryPage;
