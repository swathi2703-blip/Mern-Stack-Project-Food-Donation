import {
  Button,
  Container,
  Text,
  Title,
  Box,
  Stack,
  Group,
  Badge,
  Paper,
} from "@mantine/core";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getIsLoggedIn, getUserRole } from "../../redux/slices/User";
import { IconLink } from "@tabler/icons-react";

export const Home = () => {
  const isLoggedIn = useSelector(getIsLoggedIn);
  const userRole = useSelector(getUserRole);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else if (userRole === 'Volunteer') {
      navigate('/feed');
    } else {
      navigate('/donate');
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box 
        style={{ 
          paddingBottom: '100px',
          paddingTop: '100px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: '1px solid #dee2e6'
        }}
      >
        <Container size="lg">
          <Stack align="center" spacing="xl" textAlign="center">
            <Badge size="lg" variant="filled" color="teal" radius="sm">
              COMMUNITY DRIVEN
            </Badge>
            
            <Title 
              style={{ 
                fontSize: '3.5rem', 
                fontWeight: 900, 
                color: '#1a1b1e',
                lineHeight: 1.1,
                maxWidth: '800px',
                textAlign: 'center'
              }}
            >
              Building a World with <Text span inherit c="teal">NutriLoop</Text>
            </Title>
            
            <Text 
              size="xl" 
              color="dimmed" 
              style={{ maxWidth: '600px', fontSize: '1.25rem' }}
            >
              Connect surplus food with those who need it most. Join our platform to donate, volunteer, or support the movement toward a more sustainable future.
            </Text>

            <Group spacing="md">
              <Button 
                size="xl" 
                color="teal" 
                radius="md"
                onClick={handleGetStarted}
              >
                Get Started Now
              </Button>
              <Button 
                size="xl" 
                variant="outline" 
                color="teal" 
                radius="md"
                component="a"
                href="#how-it-works"
              >
                How it Works
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Features/Stats Section */}
      <Container size="lg" py={80} id="how-it-works">
        <Stack spacing={50}>
          <Title align="center" order={2} style={{ fontSize: '2.5rem', color: '#1a1b1e' }}>
            Why Choose NutriLoop?
          </Title>
          
          <Group grow spacing={40}>
            <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
              <Title order={3} mb="sm" c="teal">Reduce Waste</Title>
              <Text color="dimmed">Help divert perfectly good food from landfills and reduce methane emissions.</Text>
            </Paper>
            <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
              <Title order={3} mb="sm" c="teal">Feed Many</Title>
              <Text color="dimmed">Your surplus can provide nutritious meals to local shelters and families in need.</Text>
            </Paper>
            <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
              <Title order={3} mb="sm" c="teal">Easy Logistics</Title>
              <Text color="dimmed">Our platform connects you with verified volunteers for quick and easy pickups.</Text>
            </Paper>
          </Group>
        </Stack>
      </Container>
    </div>
  );
};

export default Home;
