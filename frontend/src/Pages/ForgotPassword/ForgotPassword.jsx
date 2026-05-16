import { Container, Paper, Title, Text, TextInput, Button, Stack, Center, Notification } from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
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
            <Button fullWidth size="lg" mt="md" color="teal" type="submit">
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
