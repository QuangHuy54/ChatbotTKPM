/* eslint-disable no-restricted-globals */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Box,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const EmptyPage = () => {
  let navigate = useNavigate();
  return <Box>
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}>
        <img 
          src="https://niemvuilaptrinh.ams3.cdn.digitaloceanspaces.com/404-Page-Template/404%20Page%20Bootstrap.png" 
          alt=""
        />
      </Box>

      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}>
        <Button variant="contained" onClick={() => navigate("/room")}>
          Trở về Phòng ban
        </Button>
      </Box>
    </Box>;
};

export default EmptyPage;
