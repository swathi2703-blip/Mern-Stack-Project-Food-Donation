import { Container, Title, Text, Card, Group, Badge, SimpleGrid, Stack, Loader, Center, Paper } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserData, getUserRole } from '../../redux/slices/User';
import http from '../../utils/http';
import { DONATION_URLS } from '../../utils/urls';

function HistoryPage() {
  const [donations, setDonations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(getUserData);
  const userRole = useSelector(getUserRole);

  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        if (userRole === 'Volunteer') {
          const response = await http.get(DONATION_URLS.GET_VOLUNTEER_HISTORY);
          setAssignments(response.data || []);
          setDonations([]);
        } else {
          const response = await http.get(DONATION_URLS.GET_MY_POSTS);
          setDonations(response.data || []);
          setAssignments([]);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyHistory();
  }, [user, userRole]);

  if (loading) {
    return (
      <Center h="50vh">
        <Loader color="teal" size="xl" />
      </Center>
    );
  }

  const isVolunteer = userRole === 'Volunteer';

  return (
    <Container size="lg" py="xl">
      <Stack mb="xl" align="center">
        <Title order={1} c="teal">
          {isVolunteer ? 'My Pickup History' : 'My Donation History'}
        </Title>
        <Text c="dimmed">Tracking your impact on NutriLoop</Text>
      </Stack>

      {isVolunteer ? (
        assignments.length === 0 ? (
          <Center h="30vh">
            <Paper withBorder p="xl" radius="md" align="center">
              <Text size="lg">You haven't picked up any donations yet.</Text>
              <Text size="sm" c="dimmed" mt="xs">Your pickup history will appear here after you accept requests.</Text>
            </Paper>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {assignments.map((assignment) => {
              const donation = assignment.donation || {};
              return (
                <Card key={assignment.assignmentId} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={700} size="lg">{donation.foodItem || 'Donation'}</Text>
                    <Badge color={donation.status === 'Fulfilled' ? 'green' : donation.status === 'Assigned' ? 'blue' : 'yellow'} variant="light">
                      {donation.status || 'Assigned'}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" mb="md">
                    Matched on: {assignment.matchedAt ? new Date(assignment.matchedAt).toLocaleDateString() : 'N/A'}
                  </Text>

                  <Stack gap="xs">
                    <Group gap={5}>
                      <Text fw={500} size="sm">Quantity:</Text>
                      <Text size="sm">{donation.quantity || 'N/A'}</Text>
                    </Group>
                    <Group gap={5}>
                      <Text fw={500} size="sm">Location:</Text>
                      <Text size="sm">{donation.address || donation.location || 'N/A'}</Text>
                    </Group>
                    <Group gap={5}>
                      <Text fw={500} size="sm">Donor:</Text>
                      <Text size="sm">{donation.donorId?.name || 'N/A'}</Text>
                    </Group>
                    <Group gap={5}>
                      <Text fw={500} size="sm">Urgency:</Text>
                      <Text size="sm">{assignment.urgency || 'Medium'}</Text>
                    </Group>
                    <Group gap={5}>
                      <Text fw={500} size="sm">Distance:</Text>
                      <Text size="sm">{Number.isFinite(assignment.distance) ? assignment.distance : 'N/A'}</Text>
                    </Group>
                    <Group gap={5}>
                      <Text fw={500} size="sm">Duration:</Text>
                      <Text size="sm">{Number.isFinite(assignment.duration) ? assignment.duration : 'N/A'}</Text>
                    </Group>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        )
      ) : (
        donations.length === 0 ? (
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
        )
      )}
    </Container>
  );
}

export default HistoryPage;
