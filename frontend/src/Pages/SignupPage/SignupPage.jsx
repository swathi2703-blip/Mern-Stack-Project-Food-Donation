import { Paper, TextInput, PasswordInput, Button, Title, Text, Anchor, Stack, Center, Notification } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import http from '../../utils/http';
import { AUTH_URLS } from '../../utils/urls';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      await http.post(AUTH_URLS.REGISTER, formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="90vh">
      <Paper radius="lg" p="xl" withBorder shadow="xl" w={450}>
        <Stack align="center" gap={5} mb="xl">
          <Title order={1} size="h2">Create Account</Title>
          <Text c="dimmed" size="sm">Join our food donation network</Text>
        </Stack>

        {error && (
          <Notification color="red" title="Error" mb="md" onClose={() => setError('')}>
            {error}
          </Notification>
        )}

        <Stack gap="sm">
          <TextInput 
            label="Full Name" 
            placeholder="John Doe" 
            size="md"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <TextInput 
            label="Email Address" 
            placeholder="john@example.com" 
            size="md"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <TextInput 
            label="Phone Number" 
            placeholder="1234567890" 
            size="md"
            required
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <PasswordInput 
            label="Password" 
            placeholder="Secure password" 
            size="md"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <Button 
            fullWidth 
            size="lg" 
            mt="md" 
            color="teal" 
            onClick={handleSignup}
            loading={loading}
          >
            Start Donating
          </Button>

          <Text size="sm" align="center" mt="md">
            Already have an account?{' '}
            <Anchor component="button" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}

export default SignupPage;
