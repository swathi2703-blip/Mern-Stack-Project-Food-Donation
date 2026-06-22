import { Paper, TextInput, PasswordInput, Button, Title, Text, Anchor, Stack, Badge, Group, Center, Notification, Divider } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/User';
import http from '../../utils/http';
import { AUTH_URLS } from '../../utils/urls';
import { GoogleLogin } from '@react-oauth/google';

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await http.post(AUTH_URLS.LOGIN, { email, password });
      
      dispatch(setUser({
        token: response.data.token,
        user: response.data.user
      }));
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await http.post(AUTH_URLS.GOOGLE_LOGIN, {
        token: credentialResponse.credential
      });

      dispatch(setUser({
        token: response.data.token,
        user: response.data.user
      }));

      navigate('/');
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/signup');
        return;
      }
      setError(err.response?.data?.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="90vh">
      <Paper radius="lg" p="xl" withBorder shadow="xl" w={400}>
        {/* Header Section */}
        <Stack align="center" gap={5} mb="xl">
          <Group gap={5}>
            <Text fw={500}>NutriLoop</Text>
            <Badge color="teal" variant="filled" size="sm">Auth</Badge>
          </Group>
          <Title order={1} size="h2" c="black">Welcome back</Title>
        </Stack>

        {error && (
          <Notification color="red" title="Error" mb="md" onClose={() => setError('')}>
            {error}
          </Notification>
        )}

        {/* Form Section */}
        <Stack gap="sm">
          <TextInput 
            label="Email Address" 
            placeholder="Enter your email" 
            size="md" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput 
            label="Password" 
            placeholder="Enter your password" 
            size="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Text size="sm" align="right">
            <Anchor component="button" size="sm" onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </Anchor>
          </Text>
          <Button 
            fullWidth 
            size="lg" 
            mt="md" 
            color="teal" 
            onClick={handleLogin}
            loading={loading}
          >
            Sign In
          </Button>

          <Divider label="Or continue with" labelPosition="center" my="lg" />

          <Center>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              useOneTap
            />
          </Center>

          <Text size="sm" align="center" mt="md">
            Don't have an account?{' '}
            <Anchor component="button" size="sm" onClick={() => navigate('/signup')}>
              Sign Up
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}

export default LoginPage;
