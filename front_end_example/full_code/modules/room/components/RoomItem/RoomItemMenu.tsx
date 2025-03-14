/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Box, IconButton, Typography, ListItemIcon, Menu } from "@mui/material";
import { MenuItem } from "@mui/material";
import { BiLogIn, BiEdit, BiTrash, BiCopy, BiLogOut } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import RoomData from "../../../room/interface/room-data";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRooms } from "../../../../lib/provider/RoomsProvider";
import copyTextToClipboard from "../../../../lib/util/copy-text-to-clipboard";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";
import { useConfirmDialog } from "../../../../lib/provider/ConfirmDialogProvider";
import { useUser } from "../../../../lib/provider/UserProvider";
const ITEM_HEIGHT = 48;

const RoomItemMenu = ({ roomData }: { roomData: RoomData }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const { showConfirmDialog } = useConfirmDialog();
  const { showSnackbarError, showSnackbarSuccess } = useAppSnackbar();
  let navigate = useNavigate();

  const { deleteRoom, deletingRoom, leaveRoom, leavingRoom } = useRooms();
  const { user } = useUser();

  return (
    <Box>
      <IconButton
        type="button"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
        style={{
          color: "black",
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => {
          setAnchorEl(null);
        }}
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
      >
        <MenuItem
          id="joinRoomButton"
          style={{ display: "flex", padding: 8 }}
          onClick={() => {
            setAnchorEl(null);
            navigate("/room/" + roomData.id + "/newsfeed");
          }}
        >
          <ListItemIcon>
            <BiLogIn fontSize="large" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap width="12ch">
            Vào phòng
          </Typography>
        </MenuItem>

        {roomData.manager_id === user?.id && (
          <MenuItem
            id="editRoomButton"
            style={{ display: "flex", padding: 8 }}
            onClick={() => {
              setAnchorEl(null);
              navigate("/room/" + roomData.id + "/setting-room");
            }}
          >
            <ListItemIcon>
              <BiEdit fontSize="large" />{" "}
            </ListItemIcon>
            <Typography variant="inherit" noWrap width="12ch">
              Chỉnh sửa
            </Typography>
          </MenuItem>
        )}
        <MenuItem
          id="copyIDRoomButton"
          style={{ display: "flex", padding: 8 }}
          onClick={async () => {
            try {
              await copyTextToClipboard(roomData.id);
              showSnackbarSuccess("Copy mã phòng thành công");
              setAnchorEl(null);
            } catch (error) {
              showSnackbarError(error);
            }
          }}
        >
          <ListItemIcon>
            <BiCopy fontSize="large" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap width="12ch">
            Copy ID
          </Typography>
        </MenuItem>

        {roomData.manager_id !== user?.id && leavingRoom && (
          <CircularProgress />
        )}
        {roomData.manager_id !== user?.id && !leavingRoom && (
          <MenuItem
            style={{ display: "flex", padding: 8 }}
            onClick={() => {
              setAnchorEl(null);
              showConfirmDialog({
                title: (
                  <Typography variant="h6" style={{ fontWeight: 600 }}>
                    Rời phòng {roomData.name}
                  </Typography>
                ),
                content: (
                  <Typography>
                    Bạn có chắc muốn rời phòng <strong>{roomData.name}</strong>
                    hay không?
                  </Typography>
                ),
                onConfirm: async () => {
                  if (roomData.exit_locked) {
                    showSnackbarError("Quản lí đã chặn tự rời khỏi phòng");
                    return;
                  }
                  await leaveRoom({ id: roomData.id });
                },
              });
            }}
          >
            <ListItemIcon>
              <BiLogOut fontSize="large" />{" "}
            </ListItemIcon>
            <Typography variant="inherit" noWrap width="12ch">
              Rời phòng
            </Typography>
          </MenuItem>
        )}

        {roomData.manager_id === user?.id && deletingRoom && (
          <CircularProgress />
        )}
        {roomData.manager_id === user?.id && !deletingRoom && (
          <MenuItem
            style={{ display: "flex", padding: 8 }}
            onClick={() => {
              setAnchorEl(null);
              showConfirmDialog({
                title: (
                  <Typography variant="h6" style={{ fontWeight: 600 }}>
                    Xóa phòng {roomData.name}
                  </Typography>
                ),
                content: (
                  <Typography>
                    Bạn có chắc xóa <strong>{roomData.name}</strong> khỏi danh
                    sách phòng ban của bạn?
                  </Typography>
                ),
                onConfirm: async () => await deleteRoom({ id: roomData.id }),
              });
            }}
          >
            <ListItemIcon>
              <BiTrash fontSize="large" />{" "}
            </ListItemIcon>
            <Typography variant="inherit" noWrap width="12ch">
              Xóa phòng
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default RoomItemMenu;
