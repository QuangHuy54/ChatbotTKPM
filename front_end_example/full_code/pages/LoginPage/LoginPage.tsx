import { Box } from "@mui/material";
import LoginForm from "../../modules/login/components/LoginForm/LoginForm";

const LoginPage = () => {
  return (
    <Box
      style={{
        height: "100vh",
        background: "url(login-background.png)",
        backgroundSize: "cover",
      }}
    >
      <LoginForm />
    </Box>
  );
};

export default LoginPage;
