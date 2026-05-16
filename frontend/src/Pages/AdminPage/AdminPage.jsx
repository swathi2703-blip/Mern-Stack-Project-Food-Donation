import { Container, Title, Text, Card, Group, Badge, SimpleGrid, Stack, Loader, Center, Paper, Button, Table, Avatar } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserRole } from '../../redux/slices/User';
import http from '../../utils/http';
import { ADMIN_URLS } from '../../utils/urls';
import { IconDots, IconUser, IconTrash, IconCheck, IconFilter, IconCalendar } from '@tabler/icons-react';

function AdminPage() {
  const userRole = useSelector(getUserRole);
  const [donations, setDonations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await http.get(ADMIN_URLS.TRACKER);
        setDonations(response.data?.donations || []);
        setAssignments(response.data?.assignments || []);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    if (userRole === 'Admin') fetchAllData();
  }, [userRole]);

  if (userRole !== 'Admin') {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder p="xl" radius="md" shadow="sm" align="center" style={{ backgroundColor: '#fff5f5' }}>
          <Title order={2} mb="md" c="red">Access Denied</Title>
          <Text mb="lg">
            This dashboard is restricted to NutriLoop Administrators only.
          </Text>
          <Button color="teal" component="a" href="/">
            Return Home
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Center h="50vh">
        <Loader color="teal" size="xl" type="bars" />
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      

      {/* Hero Stats Section */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
        <Card withBorder radius="md" p="xl" shadow="xs" style={{ borderBottom: '4px solid #38d9a9' }}>
          <Group justify="space-between">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase"> Donations</Text>
            <Badge color="teal" variant="light">Online</Badge>
          </Group>
          <Text size="xl" fw={800} style={{ fontSize: '42px' }} mt="xs">{donations.length}</Text>
          
        </Card>
        <Card withBorder radius="md" p="xl" shadow="xs" style={{ borderBottom: '4px solid #4dabf7' }}>
          <Group justify="space-between">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Assigned Requests</Text>
           
          </Group>
          <Text size="xl" fw={800} style={{ fontSize: '42px' }} mt="xs">
            {donations.filter(d => d.status === 'Assigned').length}
          </Text>
        </Card>
        <Card withBorder radius="md" p="xl" shadow="xs" style={{ borderBottom: '4px solid #ff922b' }}>
          <Group justify="space-between">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Fulfilled</Text>
            <Badge color="orange" variant="light">Success</Badge>
          </Group>
          <Text size="xl" fw={800} style={{ fontSize: '42px' }} mt="xs">
            {donations.filter(d => d.status === 'Fulfilled').length}
          </Text>
          <Text size="xs" c="dimmed"></Text>
        </Card>
      </SimpleGrid>

      {/* Main Request Tracker */}
      <Paper withBorder radius="lg" shadow="sm" style={{ overflow: 'hidden' }}>
        <Group p="xl" justify="space-between" style={{ borderBottom: '1px solid #eee' }}>
          <Group>
            <Title order={3}>Live Request Tracker</Title>
            <Badge size="lg" color="red" variant="filled" circle>
              {donations.filter(d => d.status === 'Pending').length}
            </Badge>
          </Group>
        </Group>
        
        <Table verticalSpacing="lg" horizontalSpacing="xl" highlightOnHover>
          <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
            <Table.Tr>
              <Table.Th>Donor Name</Table.Th>
              <Table.Th>Volunteer Name</Table.Th>
              <Table.Th>Food / Quantity</Table.Th>
              <Table.Th>Logistics Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {donations.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4} align="center">
                  <Text c="dimmed" py="xl">No donation records found in the system.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              donations.map((donation, index) => {
                const assignment = assignments.find((item) => item.donationId?._id === donation._id);
                const donorName = donation.donorId?.name || 'Unknown Donor';
                const volunteerName = assignment?.volunteerId?.name || (donation.status === 'Pending' ? 'Not Assigned' : 'Unknown Volunteer');
                const getStatusColor = (status) => {
                  switch(status) {
                    case 'Pending': return 'yellow';
                    case 'Assigned': return 'blue';
                    case 'Fulfilled': return 'green';
                    default: return 'gray';
                  }
                };
                
                return (
                  <Table.Tr key={donation._id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar color="teal" radius="xl" size="md">{donation.foodItem?.slice(0,1) || 'D'}</Avatar>
                        <Stack gap={0}>
                          <Text size="sm" fw={700}>{donorName}</Text>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>{volunteerName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm" fw={600}>{donation.foodItem}</Text>
                        <Text size="xs" c="dimmed">Qty: {donation.quantity}</Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        color={getStatusColor(donation.status)} 
                        variant="filled" 
                        radius="sm"
                        fullWidth
                      >
                        {donation.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>

      </Paper>

      <Paper withBorder radius="lg" shadow="sm" mt="xl" style={{ overflow: 'hidden' }}>
        <Group p="xl" justify="space-between" style={{ borderBottom: '1px solid #eee' }}>
          <Group>
            <Title order={3}>Assignments</Title>
            <Badge size="lg" color="blue" variant="filled" circle>
              {assignments.length}
            </Badge>
          </Group>
        </Group>

        <Table verticalSpacing="lg" horizontalSpacing="xl" highlightOnHover>
          <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
            <Table.Tr>
              <Table.Th>Volunteer</Table.Th>
              <Table.Th>Donation</Table.Th>
              <Table.Th>Urgency</Table.Th>
              <Table.Th>Distance</Table.Th>
              <Table.Th>Duration</Table.Th>
              <Table.Th>Matched At</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assignments.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} align="center">
                  <Text c="dimmed" py="xl">No assignment records yet.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              assignments.map((assignment) => {
                const donation = assignment.donationId || {};
                const volunteer = assignment.volunteerId || {};
                return (
                  <Table.Tr key={assignment._id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar color="teal" radius="xl" size="md">
                          {volunteer.name?.slice(0, 1) || 'V'}
                        </Avatar>
                        <Stack gap={0}>
                          <Text size="sm" fw={700}>{volunteer.name || 'Volunteer'}</Text>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm" fw={600}>{donation.foodItem || 'Donation'}</Text>
                        <Text size="xs" c="dimmed">Qty: {donation.quantity || 'N/A'}</Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="sm" color={assignment.urgency === 'High' ? 'red' : assignment.urgency === 'Low' ? 'teal' : 'yellow'}>
                        {assignment.urgency || 'Medium'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{assignment.distance || 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{assignment.duration || 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {assignment.matchedAt ? new Date(assignment.matchedAt).toLocaleString() : 'N/A'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default AdminPage;
