import { Container, Title, Text, Card, Group, Badge, Button, SimpleGrid, Stack, Loader, Center, Paper, Box, TextInput } from '@mantine/core';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getUserRole, getUserData } from '../../redux/slices/User';
import http from '../../utils/http';
import { DONATION_URLS } from '../../utils/urls';
import { IconMapPin } from '@tabler/icons-react';

const GOOGLE_MAPS_API_KEY = "AIzaSyCKyAVQ1CW668IfAlC4bgDQVpkmz_ED9Rk";

function FeedPage() {
    const formatTimeLeft = (useByTime) => {
      if (!useByTime) return 'Soon';
      const diffMs = new Date(useByTime).getTime() - Date.now();
      if (!Number.isFinite(diffMs)) return 'Soon';

      const totalMinutes = Math.ceil(diffMs / 60000);
      if (totalMinutes <= 0) return 'Expired';

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours === 0) return `${minutes} min left`;
      if (minutes === 0) return `${hours} hr left`;
      return `${hours} hr ${minutes} min left`;
    };
  const [donations, setDonations] = useState([]);
  const [assignedDonations, setAssignedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [volunteerAddress, setVolunteerAddress] = useState('');
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [distanceError, setDistanceError] = useState('');
  const userRole = useSelector(getUserRole);
  const user = useSelector(getUserData);
  const debounceTimerRef = useRef(null);

  const formatDistance = (meters) => {
    if (!Number.isFinite(meters)) return 'N/A';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds)) return 'N/A';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return `${hours}h ${remaining}m`;
  };

  const calculateUrgency = (donation, travelSeconds) => {
    if (!donation.useByTime) return 'Medium';

    const timeLeft = (new Date(donation.useByTime).getTime() - Date.now()) / 1000;
    if (!Number.isFinite(timeLeft)) return 'Medium';

    // If travelSeconds is known, use buffer; otherwise use timeLeft only.
    if (Number.isFinite(travelSeconds)) {
      const buffer = timeLeft - travelSeconds;
      if (buffer < 1800) return 'High';
      if (buffer > 7200) return 'Low';
      return 'Medium';
    }

    if (timeLeft < 3 * 3600) return 'High';
    if (timeLeft > 12 * 3600) return 'Low';
    return 'Medium';
  };

  const computeWithGoogle = (data, activeAddress) => {
    return new Promise((resolve) => {
      if (!window.google) return resolve(null);

      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [activeAddress],
          destinations: data.map(d => d.address || d.location || 'India'),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status !== 'OK' || !response?.rows?.[0]?.elements) {
            return resolve(null);
          }

          const results = response.rows[0].elements;
          const donationsWithDistance = data.map((donation, index) => {
            const element = results[index];
            const distVal = element?.status === 'OK' ? element.distance.value : Infinity;
            const durVal = element?.status === 'OK' ? element.duration.value : Infinity;

            return {
              ...donation,
              distanceText: element?.status === 'OK' ? element.distance.text : 'N/A',
              distanceValue: distVal,
              durationText: element?.status === 'OK' ? element.duration.text : 'N/A',
              durationValue: durVal,
              urgency: calculateUrgency(donation, durVal)
            };
          });

          donationsWithDistance.sort((a, b) => a.durationValue - b.durationValue);
          return resolve(donationsWithDistance);
        }
      );
    });
  };

  const geocodeAddress = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    const results = await response.json();
    if (!results || results.length === 0) {
      throw new Error('No geocode results');
    }
    return {
      lat: parseFloat(results[0].lat),
      lon: parseFloat(results[0].lon)
    };
  };

  const routeDistance = async (origin, destination) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=false`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      throw new Error('Routing failed');
    }
    const data = await response.json();
    const route = data?.routes?.[0];
    if (!route) {
      throw new Error('No route found');
    }
    return {
      distance: route.distance,
      duration: route.duration
    };
  };

  const computeWithOsm = async (data, activeAddress) => {
    const origin = await geocodeAddress(activeAddress);
    const results = await Promise.all(data.map(async (donation) => {
      const destination = await geocodeAddress(donation.address || donation.location || 'India');
      const route = await routeDistance(origin, destination);
      const distVal = Number.isFinite(route.distance) ? route.distance : Infinity;
      const durVal = Number.isFinite(route.duration) ? route.duration : Infinity;

      return {
        ...donation,
        distanceText: formatDistance(distVal),
        distanceValue: distVal,
        durationText: formatDuration(durVal),
        durationValue: durVal,
        urgency: calculateUrgency(donation, durVal)
      };
    }));

    results.sort((a, b) => a.durationValue - b.durationValue);
    return results;
  };

  const fetchAssignedDonations = async () => {
    try {
      if (userRole !== 'Volunteer') return;
      const response = await http.get(DONATION_URLS.GET_ASSIGNED);
      setAssignedDonations(response.data || []);
    } catch (err) {
      console.error('Failed to fetch assigned donations', err);
    }
  };

  const fetchDonations = async (calculateDistance = false, overrideAddress = null) => {
    try {
      setDistanceError('');
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
      data = data.map((donation) => ({
        ...donation,
        urgency: calculateUrgency(donation, undefined)
      }));

      if (calculateDistance) {
        let donationsWithDistance = await computeWithGoogle(data, activeAddress);

        if (!donationsWithDistance) {
          try {
            donationsWithDistance = await computeWithOsm(data, activeAddress);
          } catch (fallbackError) {
            console.error('Fallback distance failed', fallbackError);
            setDistanceError('Unable to calculate distance right now. Please check the address and try again.');
          }
        }

        if (donationsWithDistance) {
          setDonations(donationsWithDistance);
          setShowLocationPrompt(false);
        } else {
          setDonations(data);
        }

        await fetchAssignedDonations();

        setLoading(false);
        setCalculating(false);
        return;
      }

      setDonations(data);
      await fetchAssignedDonations();
      setLoading(false);
      setCalculating(false);
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

  const handlePickupCompleted = async (donationId) => {
    try {
      await http.patch(DONATION_URLS.FULFILL(donationId));
      alert('Pickup completed successfully!');
      fetchDonations(volunteerAddress ? true : false);
    } catch (err) {
      console.error('Failed to complete pickup', err);
      alert('Failed to mark pickup completed');
    }
  };

  const getMapUrl = (destination) => {
    if (!destination) return '#';
    if (volunteerAddress) {
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(volunteerAddress)}&destination=${encodeURIComponent(destination)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
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

  useEffect(() => {
    if (userRole !== 'Volunteer') return;
    const trimmed = volunteerAddress.trim();
    if (!trimmed) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchDonations(true, trimmed);
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [volunteerAddress, userRole]);

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
            {distanceError && (
              <Text size="xs" c="red">
                {distanceError}
              </Text>
            )}
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

      {assignedDonations.length > 0 && (
        <Box mb="xl">
          <Stack align="center" mb="md">
            <Title order={2} c="teal">My Pickups</Title>
            <Text c="dimmed" size="sm">Complete pickups and mark them as fulfilled</Text>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {assignedDonations.map((donation) => (
              <Card key={donation._id} shadow="sm" padding="xl" radius="md" withBorder>
                <Group mb="md" justify="space-between">
                  <Group gap="xs">
                    <Badge variant="filled" size="sm" radius="xl" color="blue">Assigned</Badge>
                    {donation.urgency && (
                      <Badge variant="light" size="sm" radius="xl" color={donation.urgency === 'High' ? 'red' : donation.urgency === 'Low' ? 'teal' : 'yellow'}>
                        {donation.urgency} Urgency
                      </Badge>
                    )}
                  </Group>
                </Group>

                <Stack gap={5} mb="md">
                  <Title order={4} c="dark">Pickup Assigned</Title>
                  <Text size="sm" fw={700}>Food: {donation.foodItem}</Text>
                  
                  <Text size="xs" c="dimmed">Location: {donation.address || donation.location}</Text>
                </Stack>

                <Group grow mt="md">
                  <Button
                    variant="light"
                    color="blue"
                    component="a"
                    href={getMapUrl(donation.address || donation.location)}
                    target="_blank"
                    disabled={!donation.address && !donation.location}
                  >
                    View Map
                  </Button>
                  <Button color="teal" onClick={() => handlePickupCompleted(donation._id)}>
                    Pickup Completed
                  </Button>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
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
                    Expires: {formatTimeLeft(donation.useByTime)}
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
