import { Container, Title, TextInput, Textarea, Button, Paper, Stack, Select, NumberInput, Notification, Text } from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserRole } from '../../redux/slices/User';
import http from '../../utils/http';
import { DONATION_URLS } from '../../utils/urls';

function DonationPage() {
  const navigate = useNavigate();
  const userRole = useSelector(getUserRole);
  const [formData, setFormData] = useState({
    foodItem: '',
    quantity: 1,
    location: '',
    description: '',
    donorContact: '',
    useByTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (userRole === 'Volunteer') {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder p="xl" radius="md" shadow="sm" align="center">
          <Title order={2} mb="md" c="teal">Donor Access Only</Title>
          <Text mb="lg">
            As a Volunteer, you are here to pick up donations. If you want to post food, please register as a Donor.
          </Text>
          <Button color="teal" component="a" href="/feed">
            View Available Donations
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Ensure quality is handled as number and add quick validation
    const payload = {
      ...formData,
      quantity: Number(formData.quantity)
    };
    try {
      await http.post(DONATION_URLS.POST, payload);
      setSuccess(true);
      setTimeout(() => navigate('/history'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="md" p="xl" radius="md">
        <Title order={2} align="center" mb="xl" c="teal">Post a Food Donation</Title>
        
        {error && (
          <Notification color="red" mb="md" onClose={() => setError('')}>
            {error}
          </Notification>
        )}
        
        {success && (
          <Notification color="teal" title="Success!" mb="md">
            Donation posted successfully! Redirecting to feed...
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Food Item"
              placeholder="e.g. 50 Lunch Boxes, 10kg Rice"
              required
              value={formData.foodItem}
              onChange={(e) => setFormData({...formData, foodItem: e.target.value})}
            />
            
            <NumberInput
              label="Quantity (approx servings/kg)"
              placeholder="1"
              min={1}
              required
              value={formData.quantity}
              onChange={(val) => setFormData({...formData, quantity: val})}
            />

            <TextInput
              label="Pickup Location"
              placeholder="Full address"
              required
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />

            <Textarea
              label="Description / Special Instructions"
              placeholder="Mention expiry time, dietary info, or pickup window"
              minRows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />

            <TextInput
              label="Contact Number"
              placeholder="Phone number for volunteer to contact"
              required
              value={formData.donorContact}
              onChange={(e) => setFormData({...formData, donorContact: e.target.value})}
            />

            <TextInput
              label="Use By / Expiry Time"
              placeholder="e.g. 2026-05-20T10:00"
              type="datetime-local"
              required
              value={formData.useByTime}
              onChange={(e) => setFormData({...formData, useByTime: e.target.value})}
            />

            <Button type="submit" color="teal" fullWidth size="md" loading={loading}>
              Post Donation
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default DonationPage;
