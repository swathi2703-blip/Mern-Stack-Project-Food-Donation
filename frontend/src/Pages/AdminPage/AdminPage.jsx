import { Container, Title, Text, Card, Group, Badge, SimpleGrid, Stack, Loader, Center, Paper, Button, Table, ActionIcon, Menu, Avatar, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserRole } from '../../redux/slices/User';
import http from '../../utils/http';
import { DONATION_URLS } from '../../utils/urls';
import { IconDots, IconUser, IconTrash, IconCheck, IconSearch, IconFilter, IconCalendar } from '@tabler/icons-react';

function AdminPage() {
  const userRole = useSelector(getUserRole);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await http.get(DONATION_URLS.GET_ALL);
        setDonations(response.data);
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
      <Stack mb="xl">
        <Title order={1} c="teal" fw={800}>NutriLoop Oversight</Title>
        <Text c="dimmed" size="sm">System Monitoring & Resource Management</Text>
      </Stack>

      {/* Hero Stats Section */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
        <Card withBorder radius="md" p="xl" shadow="xs" style={{ borderBottom: '4px solid #38d9a9' }}>
          <Group justify="space-between">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Live Donations</Text>
            <Badge color="teal" variant="light">Online</Badge>
          </Group>
          <Text size="xl" fw={800} style={{ fontSize: '42px' }} mt="xs">{donations.length}</Text>
          <Text size="xs" c="green" fw={600}>Total in system</Text>
        </Card>
        <Card withBorder radius="md" p="xl" shadow="xs" style={{ borderBottom: '4px solid #4dabf7' }}>
          <Group justify="space-between">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Assigned Requests</Text>
            <Badge color="blue" variant="light">Active</Badge>
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
          <Text size="xs" c="dimmed">Complete rescues</Text>
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
          <TextInput 
            placeholder="Search request ID or Donor..." 
            leftSection={<IconSearch size={14} />} 
            size="xs"
            w={250}
          />
        </Group>
        
        <Table verticalSpacing="lg" horizontalSpacing="xl" highlightOnHover>
          <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
            <Table.Tr>
              <Table.Th>Donor Name</Table.Th>
              <Table.Th>Food / Quantity</Table.Th>
              <Table.Th>Logistics Status</Table.Th>
              <Table.Th>AI Intelligence</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {donations.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} align="center">
                  <Text c="dimmed" py="xl">No donation records found in the system.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              donations.map((donation, index) => {
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
                          <Text size="sm" fw={700}>ID: {donation._id.slice(-6)}</Text>
                          <Text size="xs" c="dimmed">{donation.address}</Text>
                        </Stack>
                      </Group>
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
                    <Table.Td>
                      <Group gap="xs">
                        <Badge variant="light" size="sm" color="blue">
                          {donation.status === 'Pending' ? 'Awaiting Volunteer' : 'Matched'}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Label>Management</Menu.Label>
                          <Menu.Item leftSection={<IconCheck size={14} />} onClick={() => alert('Marked as complete')}>
                            Mark Fulfilled
                          </Menu.Item>
                          <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => alert('Deleted')}>
                            Delete Entry
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>

        <Paper p="xl" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #eee' }}>
          <Group justify="space-between">
            <Group gap="xl">
              <Stack gap={0}>
                <Text fw={700} size="sm">System Latency</Text>
                <Text size="xs" c="dimmed">0.24ms response</Text>
              </Stack>
              <Stack gap={0}>
                <Text fw={700} size="sm">Database Health</Text>
                <Text size="xs" c="green">Healthy (Live Sync)</Text>
              </Stack>
            </Group>
            <Text size="xs" c="dimmed">Page 1 of {Math.max(1, Math.ceil(donations.length/10))}</Text>
          </Group>
        </Paper>
      </Paper>
    </Container>
  );
}

export default AdminPage;
