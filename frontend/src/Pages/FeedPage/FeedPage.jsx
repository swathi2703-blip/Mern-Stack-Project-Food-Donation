import { Container, Title, Text, Card, Group, Badge, Button, SimpleGrid, Stack, Loader, Center, Paper, Box, TextInput } from '@mantine/core';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getUserRole, getUserData } from '../../redux/slices/User';
import http from '../../utils/http';
import { DONATION_URLS } from '../../utils/urls';
import { IconMapPin } from '@tabler/icons-react';

const GOOGLE_MAPS_API_KEY = "AIzaSyCKyAVQ1CW668IfAlC4bgDQVpkmz_ED9Rk";

function FeedPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [volunteerAddress, setVolunteerAddress] = useState('');
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const userRole = useSelector(getUserRole);
  const user = useSelector(getUserData);

  const fetchDonations = async (calculateDistance = false, overrideAddress = null) => {
    try {
      const activeAddress = overrideAddress || volunteerAddress;
      if (calculateDistance) {
        if (!activeAddress) {
          return;
        }
        setCalculating(true);
      }
      
      const response = await http.get(DONATION_URLS.GET_ALL);
      let data = response.data;

      // Filter only Pending donations for the feed
      data = data.filter(d => d.status === 'Pending');

      if (calculateDistance && window.google) {
        const service = new window.google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [activeAddress],
            destinations: data.map(d => d.address || d.location || 'India'),
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === 'OK') {
              const results = response.rows[0].elements;
              const donationsWithDistance = data.map((donation, index) => {
                const element = results[index];
                const distVal = element.status === 'OK' ? element.distance.value : Infinity;
                const durVal = element.status === 'OK' ? element.duration.value : Infinity;
                
                // Calculate dynamic urgency
                let calculatedUrgency = "Medium";
                if (donation.useByTime && durVal !== Infinity) {
                  const timeLeft = (new Date(donation.useByTime).getTime() - Date.now()) / 1000;
                  const buffer = timeLeft - durVal;
                  if (buffer < 1800) calculatedUrgency = "High";
                  else if (buffer > 7200) calculatedUrgency = "Low";
                }

                return {
                  ...donation,
                  distanceText: element.status === 'OK' ? element.distance.text : 'N/A',
                  distanceValue: distVal,
                  durationText: element.status === 'OK' ? element.duration.text : 'N/A',
                  durationValue: durVal,
                  urgency: calculatedUrgency
                };
              });
              
              // Sort by duration (estimated time)
              donationsWithDistance.sort((a, b) => a.durationValue - b.durationValue);
              setDonations(donationsWithDistance);
              setShowLocationPrompt(false); // Hide the prompt after successful calculation
            } else {
              setDonations(data);
            }
            setCalculating(false);
          }
        );
      } else {
        setDonations(data);
        setLoading(false);
        setCalculating(false);
      }
    } catch (err) {
      console.error('Failed to fetch donations', err);
      setLoading(false);
      setCalculating(false);
    }
  };

  const handleLocationSubmit = () => {
    if (volunteerAddress.trim()) {
      fetchDonations(true);
    }
  };

  const handleAcceptRequest = async (donationId) => {
    try {
      const donation = donations.find(d => d._id === donationId);
      await http.patch(`${DONATION_URLS.POST}claim/${donationId}`, { 
        status: 'Assigned',
        distanceValue: donation?.distanceValue,
        durationValue: donation?.durationValue,
        distanceText: donation?.distanceText,
        durationText: donation?.durationText,
        urgency: donation?.urgency
      });
      alert('Request Accepted Successfully!');
      fetchDonations(volunteerAddress ? true : false);
    } catch (err) {
      console.error('Failed to accept request', err);
      alert('Failed to update status');
    }
  };

  useEffect(() => {
    // Only fetch default list on mount, don't trigger AI calculation yet
    if (window.google) {
        fetchDonations(false);
    } else {
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.async = true;
          script.onload = () => fetchDonations(false);
          document.head.appendChild(script);
        }
    }
  }, [userRole]);

  if (userRole === 'Donor') {
    // ... rest of the file ...
    return (
      <Container size="sm" py="xl">
        <Paper withBorder p="xl" radius="md" shadow="sm" align="center">
          <Title order={2} mb="md" c="teal">Volunteer Access Only</Title>
          <Text mb="lg">
            This feed is reserved for Volunteers to view and claim available food donations. 
          </Text>
          <Button color="teal" component="a" href="/donate">
            Post a New Donation
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Center h="50vh">
        <Loader color="teal" size="xl" />
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack align="center" mb="xl">
        <Title order={1} c="teal">Available Donations</Title>
        <Text c="dimmed">Help bridge the gap between waste and hunger</Text>
      </Stack>

      {showLocationPrompt && (
        <Paper withBorder p="xl" radius="md" mb="xl" shadow="md" style={{ backgroundColor: '#f8f9fa' }}>
          <Stack>
            <Group justify="space-between">
              <Text fw={700} size="lg">Ready to Help?</Text>
              <Badge color="blue" variant="light">ACTION REQUIRED</Badge>
            </Group>
            <Text size="sm" c="dimmed">Enter your current location to see the best food rescue matches near you.</Text>
            <TextInput
              placeholder="e.g. KL University, Vijayawada"
              size="md"
              value={volunteerAddress}
              onChange={(e) => setVolunteerAddress(e.currentTarget.value)}
              leftSection={<IconMapPin size={18} color="teal" />}
              onKeyPress={(e) => e.key === 'Enter' && handleLocationSubmit()}
              autoFocus
            />
            <Button 
              color="teal" 
              onClick={handleLocationSubmit}
              loading={calculating}
              size="md"
            >
              Start AI Matching
            </Button>
          </Stack>
        </Paper>
      )}

      {!showLocationPrompt && volunteerAddress && (
        <Group justify="space-between" mb="lg">
          <Paper withBorder px="md" py="xs" radius="xl" shadow="xs">
            <Group gap="xs">
              <IconMapPin size={16} color="teal" />
              <Text size="xs" fw={600}>Matching from: {volunteerAddress}</Text>
              <Button variant="subtle" size="compact-xs" color="blue" onClick={() => setShowLocationPrompt(true)}>Change</Button>
            </Group>
          </Paper>
          <Badge color="teal" variant="light">AI MATCHING ACTIVE</Badge>
        </Group>
      )}

      {donations.length === 0 ? (
        <Center h="30vh">
          <Text size="lg">No donations available at the moment.</Text>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {donations.map((donation, index) => {
            const isBestMatch = index === 0 && donation.distanceValue !== undefined && donation.distanceValue !== Infinity;
            const urgencyColor = donation.urgency === 'High' ? 'red' : donation.urgency === 'Low' ? 'teal' : 'yellow';
            
            return (
              <Card key={donation._id} shadow="sm" padding="xl" radius="md" withBorder 
                style={{ 
                  backgroundColor: isBestMatch ? '#f0fff4' : 'white',
                  borderColor: isBestMatch ? '#38a169' : '#e2e8f0',
                  borderWidth: isBestMatch ? '2px' : '1px'
                }}>
                <Group mb="md" justify="space-between">
                  <Group gap="xs">
                    <Badge variant="filled" size="sm" radius="xl" color="blue">Food Request</Badge>
                    {donation.urgency && (
                      <Badge variant="light" size="sm" radius="xl" color={urgencyColor}>
                        {donation.urgency} Urgency
                      </Badge>
                    )}
                  </Group>
                  {isBestMatch && <Badge variant="filled" size="sm" radius="xl" color="green">Best Match</Badge>}
                </Group>

                <Stack gap={5} mb="md">
                  <Title order={4} c="dark">
                    {isBestMatch ? 'Best Volunteer Match (AI Calculated)' : 'Pending request'}
                  </Title>
                  <Text size="sm" fw={700} c="blue">
                    Estimated Travel Time: {donation.durationText || 'Enter location above'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Distance: {donation.distanceText || 'N/A'}
                  </Text>
                  <Text size="sm" fw={700}>Food: {donation.foodItem}</Text>
                  <Text size="sm" fw={700} c="red">
                    Expires: {donation.useByTime ? new Date(donation.useByTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Soon'}
                  </Text>
                  <Text size="xs" c="dimmed">Location: {donation.address || donation.location}</Text>
                </Stack>

                <Group grow mt="md">
                  <Button 
                    variant="light"
                    color="blue"
                    component="a"
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(volunteerAddress)}&destination=${encodeURIComponent(donation.address || donation.location)}`}
                    target="_blank"
                    disabled={!volunteerAddress}
                  >
                    View Map
                  </Button>
                  <Button 
                    color="green" 
                    style={{ backgroundColor: '#2f855a' }}
                    onClick={() => handleAcceptRequest(donation._id)}
                  >
                    Accept Request
                  </Button>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
}

export default FeedPage;
