import { Box, Button, Tooltip, Typography } from "@mui/material";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import APP_LOGO from "../../../../assets/images/app-logo.png";
import HeaderUserInfo from "../HeaderUserInfo/HeaderUserInfo";
import makeStyles from "@mui/styles/makeStyles";

interface HeaderProps {
  children?: React.ReactElement;
}

const useStyle = makeStyles((theme) => ({
  header: {
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    height: 64,
    background: "#FFFFFF",
    boxShadow: "0px 2px 4px rgba(30, 136, 229, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 16px",
    zIndex: 100,
  },
  logo: {
    padding: 8,
    height: "100%",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  },
  nav: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 0,
  },
  item: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 64,
    flex: "none",
    order: 0,
    flexGrow: 0,
    fontFamily: "Inter",
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: 16,
    lineHeight: "150%",
    letterSpacing: "0.15px",
  },
  navItem: {
    textTransform: "none",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 24px",
    width: "100%",
    margin: "0px 4px",
  },
  selection: {
    "&::before": {
      content: '""',
      position: "absolute",
      width: 28,
      height: 4,
      borderRadius: "16px 16px 0px 0px",
      bottom: 0,
      left: "calc(50% - 14px)",
      backgroundColor: "#1E88E5",
    },
  },
  textSelection: {
    color: "#1E88E5 !important",
  },
  rightContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    gap: 12,
  },
  children: { height: "calc(100vh - 66px)" },
}));

const Header = ({ children }: HeaderProps) => {
  const classes = useStyle();
  let location = useLocation();
  let navigate = useNavigate();

  const needAuth = ![
    "/login",
    "/register",
    "/forgot-password",
    "/home",
    "/",
  ].some((route) => route === location.pathname);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: needAuth ? 66 : 0,
      }}
    >
      {needAuth && (
        <Box className={classes.header}>
          <Tooltip title="tkpm-olive.vercel.app">
            <img
              className={classes.logo}
              src={APP_LOGO}
              alt="web logo"
              onClick={() =>
                !location.pathname.includes("/home") && navigate("/home")
              }
            />
          </Tooltip>

          <Box className={classes.nav}>
            <Box
              className={`${classes.item} ${
                location.pathname.includes("/resource") && classes.selection
              }`}
            >
              <Button
                className={`${classes.navItem} ${
                  location.pathname.includes("/resource") &&
                  classes.textSelection
                }`}
                onClick={() =>
                  !location.pathname.endsWith("/resource") &&
                  navigate("/resource")
                }
              >
                <Typography
                  style={{
                    color: location.pathname.includes("/resource")
                      ? "#1E88E5"
                      : "black",
                  }}
                >
                  Tài nguyên
                </Typography>
              </Button>
            </Box>

            <Box
              className={`${classes.item} ${
                location.pathname.includes("/room") && classes.selection
              }`}
            >
              <Button
                className={`${classes.navItem} ${
                  location.pathname.includes("/room") && classes.textSelection
                }`}
                onClick={() =>
                  !location.pathname.endsWith("/room") && navigate("/room")
                }
              >
                <Typography
                  style={{
                    color: location.pathname.includes("/room")
                      ? "#1E88E5"
                      : "black",
                  }}
                >
                  Phòng ban
                </Typography>
              </Button>
            </Box>

            <Box
              className={`${classes.item} ${
                location.pathname.includes("/schedule") && classes.selection
              }`}
            >
              <Button
                className={`${classes.navItem} ${
                  location.pathname.includes("/schedule") &&
                  classes.textSelection
                }`}
                onClick={() =>
                  !location.pathname.endsWith("/schedule") &&
                  navigate("/schedule")
                }
              >
                <Typography
                  style={{
                    color: location.pathname.includes("/schedule")
                      ? "#1E88E5"
                      : "black",
                  }}
                >
                  Lịch
                </Typography>
              </Button>
            </Box>
          </Box>

          <Box className={classes.rightContainer}>
            <HeaderUserInfo />
          </Box>
        </Box>
      )}

      <Box className={classes.children}>{children}</Box>
    </Box>
  );
};

export default Header;
