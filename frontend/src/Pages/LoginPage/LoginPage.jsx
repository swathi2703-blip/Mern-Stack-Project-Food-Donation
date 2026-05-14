import {
  Card,
  Center,
  Stack,
  Text,
  Title,
  Badge,
  Divider,
  Box,
  Container,
  Overlay
} from "@mantine/core";
import { GoogleLogin } from "@react-oauth/google";
import { showNotification } from "@mantine/notifications";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { getIsLoggedIn, setUser } from "../../redux/slices/User";
import Service from "../../utils/http";
import { GOOGLE_AUTH_LOGIN } from "../../utils/urls";

export default function LoginPage() {
  const service = new Service();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(getIsLoggedIn);

  const googleResponse = async (res) => {
    try {
      const token = res.credential;
      if (!token) {
        showNotification({ title: "Error", message: "Invalid Response", color: "red" });
        return;
      }

      const response = await service.post(GOOGLE_AUTH_LOGIN, { token });
      const data = response.data;

      dispatch(setUser({ ...data, isLoggedIn: true }));
      showNotification({ title: "Success", message: "Welcome to ShareMeal!", color: "green" });
      navigate("/");
    } catch (error) {
      showNotification({ title: "Error", message: "Login Failed", color: "red" });
    }
  };

  if (isLoggedIn) return <Navigate to="/" />;

  return (
    <Box
      style={{
        height: "100vh",
        position: "relative",
        // Mantine-friendly Green Gradient
        background: "linear-gradient(45deg, #1b5e20 0%, #4caf50 100%)",
      }}
    >
      {/* Subtle patterns/overlay if needed */}
      <Overlay opacity={0.1} zIndex={0} />

      <Center style={{ height: "100%", zIndex: 1, position: "relative" }}>
        <Container size="xs">
          <Card
            shadow="xl"
            p="xl"
            radius="lg"
            style={{
              // Glassmorphism logic using Mantine's transparency
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
            }}
          >
            <Stack align="center" gap="md">
              {/* Branding Section */}
              <Stack align="center" gap={4}>
                <Badge 
                  variant="white" 
                  color="green" 
                  size="sm" 
                  radius="xs"
                  tt="uppercase"
                  fw={700}
                >
                  AI Matching Live
                </Badge>
                <Title order={1} fw={900} style={{ letterSpacing: "-1px" }}>
                  ShareMeal
                </Title>
                <Text size="sm" fw={500} style={{ opacity: 0.8 }}>
                  Zero Waste. Zero Hunger.
                </Text>
              </Stack>

              <Divider 
                my="sm" 
                label="Volunteer or Donor Sign In" 
                labelPosition="center" 
                w="100%"
                styles={{ label: { color: "rgba(255,255,255,0.7)", fontSize: "10px" } }}
              />

              {/* Action Section */}
              <Box 
                style={{ 
                  backgroundColor: "rgba(255,255,255,1)", 
                  padding: "10px", 
                  borderRadius: "100px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
              >
                <GoogleLogin
                  onSuccess={googleResponse}
                  theme="filled_blue"
                  shape="pill"
                  width="250"
                  text="continue_with"
                />
              </Box>

              <Stack gap={2} mt="md">
                <Text size="xs" style={{ opacity: 0.6 }}>
                  By joining, you help optimize food logistics
                </Text>
                <Text size="xs" fw={700} td="underline" style={{ cursor: "pointer" }}>
                  Learn how our AI saves meals
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Container>
      </Center>
    </Box>
  );
}