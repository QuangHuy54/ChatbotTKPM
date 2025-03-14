import {
  Box,
  Button,
  ButtonProps,
  Fade,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CreateRoomDialog from "../CreateRoomDialog/CreateRoomDialog";
import JoinRoomDialog from "../JoinRoomDialog/JoinRoomDialog";
import React, { useState } from "react";

const AddRoomButton = ({ ...buttonProps }: ButtonProps) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [openJoinRoomDialog, setOpenJoinRoomDialog] = useState(false);
  const [openCreateRoomDialog, setOpenCreateRoomDialog] = useState(false);

  return (
    <Box>
      <Button
        onClick={(event) => setMenuAnchorEl(event.currentTarget)}
        style={{ textTransform: "none" }}
        variant="outlined"
        size="medium"
        {...buttonProps}
      >
        <AddIcon />
        <Typography style={{ textTransform: "none" }}>Thêm</Typography>
      </Button>

      <Menu
        anchorEl={menuAnchorEl}
        open={!!menuAnchorEl}
        onClose={() => setMenuAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        TransitionComponent={Fade}
      >
        <MenuItem
          style={{ display: "block", padding: 8 }}
          onClick={() => {
            setOpenJoinRoomDialog(true);
            setMenuAnchorEl(null);
          }}
        >
          <Typography>Tham gia phòng</Typography>
        </MenuItem>
        <MenuItem
          style={{ display: "block", padding: 8 }}
          onClick={() => {
            setMenuAnchorEl(null);
            setOpenCreateRoomDialog(true);
          }}
        >
          <Typography>Tạo phòng</Typography>
        </MenuItem>
      </Menu>

      <JoinRoomDialog
        open={openJoinRoomDialog}
        onClose={() => setOpenJoinRoomDialog(false)}
      />

      <CreateRoomDialog
        open={openCreateRoomDialog}
        onClose={() => setOpenCreateRoomDialog(false)}
      />
    </Box>
  );
};

export default AddRoomButton;
