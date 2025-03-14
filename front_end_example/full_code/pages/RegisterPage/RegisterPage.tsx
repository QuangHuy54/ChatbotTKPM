import React from "react";
import { Box } from "@mui/material";
import RegisterForm from "../../modules/register/components/RegisterForm/RegisterForm";

const RegisterPage = () => {
  return (
    <Box
      style={{
        height: "100vh",
        background: "url(login-background.png)",
        backgroundSize: "cover",
      }}
    >
      <RegisterForm />
    </Box>
  );
};

export default RegisterPage;
