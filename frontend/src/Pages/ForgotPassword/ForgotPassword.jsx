import { Container, Paper, Title, Text, TextInput, Button, Stack, Center, Notification } from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../utils/http';
import { AUTH_URLS } from '../../utils/urls';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      await http.post(AUTH_URLS.FORGOT_PASSWORD, { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="90vh">
      <Paper radius="lg" p="xl" withBorder shadow="xl" w={420}>
        <Stack align="center" gap={5} mb="xl">
          <Title order={2} c="black">Forgot Password</Title>
          <Text c="dimmed" size="sm">Enter your email to receive reset instructions.</Text>
        </Stack>

        {submitted && (
          <Notification color="teal" mb="md" onClose={() => setSubmitted(false)}>
            If an account exists for this email, we will send reset instructions.
          </Notification>
        )}

        {error && (
          <Notification color="red" mb="md" onClose={() => setError('')}>
            {error}
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              size="md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button fullWidth size="lg" mt="md" color="teal" type="submit" loading={loading}>
              Send Reset Link
            </Button>
            <Button variant="subtle" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}

export default ForgotPassword;
