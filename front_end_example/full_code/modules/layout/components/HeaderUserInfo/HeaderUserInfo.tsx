import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  ListItemIcon,
  MenuItem,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import Settings from "@mui/icons-material/Settings";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import Logout from "@mui/icons-material/Logout";
import { useState } from "react";
import { useUser } from "../../../../lib/provider/UserProvider";
import { useAuth } from "../../../../lib/provider/AuthProvider";
import { useNavigate } from "react-router-dom";
import truncate from "../../../../lib/util/truncate";
import makeStyles from "@mui/styles/makeStyles";

const useStyle = makeStyles((theme) => ({
  button: {
    cursor: "pointer",
    background: "#ffffff",
    borderRadius: 90,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1px 2px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
    border: "none",
    verticalAlign: "middle",
    transition: "box-shadow 0.4s ease",
    "&:hover": {
      boxShadow: "0 1px 8px rgba(0, 0, 0, 0.3)",
    },
  },
  accountContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    padding: 8,
  },
  userName: {
    marginLeft: "8px",
    flexGrow: 2,
  },
}));

const HeaderUserInfo = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const classes = useStyle();
  const { user } = useUser();
  const { logOut, loggingOut } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Tooltip title="Account">
        <Box
          className={classes.button}
          onClick={(event: React.MouseEvent<HTMLDivElement>) =>
            setAnchorEl(event.currentTarget)
          }
        >
          <Typography style={{ marginLeft: 12 }}>
            {truncate(user?.name || "Username", 30)}
          </Typography>
          <IconButton
            size="small"
            id="user-info-button"
            aria-controls={!!anchorEl ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={!!anchorEl ? "true" : undefined}
          >
            <Avatar src={user?.avatar} alt="User avatar" />
          </IconButton>
        </Box>
      </Tooltip>

      <Popover
        id="user-info-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        aria-labelledby="user-info-button"
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        TransitionComponent={Fade}
        style={{ marginTop: 4 }}
      >
        <Box className={classes.accountContainer}>
          <Avatar
            src={user?.avatar}
            alt="User avatar"
            style={{ marginRight: "8px" }}
          />

          <Typography>{user?.name}</Typography>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => setAnchorEl(null)}
          style={{ display: "block", padding: 8 }}
        >
          <ListItemIcon>
            <ContactSupportIcon fontSize="small" />
          </ListItemIcon>
          Trợ giúp
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate("setting");
            setAnchorEl(null);
          }}
          style={{ display: "block", padding: 8 }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Cài đặt
        </MenuItem>

        <MenuItem
          onClick={async () => {
            await logOut();
            navigate("/login");
          }}
          disabled={loggingOut}
          style={{ display: "block", padding: 8 }}
        >
          <ListItemIcon>
            {loggingOut ? <CircularProgress /> : <Logout fontSize="small" />}
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Popover>
    </>
  );
};

export default HeaderUserInfo;
