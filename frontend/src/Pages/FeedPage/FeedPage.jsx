import { Container, Title, Text, Card, Group, Badge, Button, SimpleGrid, Stack, Loader, Center } from '@mantine/core';
import { useEffect, useState } from 'react';
import http from '../../utils/http';
import { DONATION_URLS } from '../../utils/urls';

function FeedPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await http.get(DONATION_URLS.GET_ALL);
        setDonations(response.data);
      } catch (err) {
        console.error('Failed to fetch donations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

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
        <Title order={1} c="teal">Available Donations</Title>
        <Text c="dimmed">Help bridge the gap between waste and hunger</Text>
      </Stack>

      {donations.length === 0 ? (
        <Center h="30vh">
          <Text size="lg">No donations available at the moment.</Text>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {donations.map((donation) => (
            <Card key={donation._id} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={700} size="lg">{donation.foodItem}</Text>
                <Badge color="teal" variant="light">
                  {donation.quantity} units
                </Badge>
              </Group>

              <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
                {donation.description || 'No description provided.'}
              </Text>

              <Stack gap="xs" mb="lg">
                <Group gap={5}>
                  <Text fw={500} size="sm">Location:</Text>
                  <Text size="sm">{donation.location}</Text>
                </Group>
                <Group gap={5}>
                  <Text fw={500} size="sm">Donor Contact:</Text>
                  <Text size="sm">{donation.donorContact}</Text>
                </Group>
              </Stack>

              <Button fullWidth mt="auto" color="teal" variant="light" radius="md">
                Claim Donation
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

export default FeedPage;
