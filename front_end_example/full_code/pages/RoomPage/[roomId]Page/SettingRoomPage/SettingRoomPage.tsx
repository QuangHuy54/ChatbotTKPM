import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import "./SettingRoomPage.css";
import { Container, Switch } from "@mui/material";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";
import AddIcon from "@mui/icons-material/Add";
import FileUploadSharpIcon from "@mui/icons-material/FileUploadSharp";
import ArrowBackSharpIcon from "@mui/icons-material/ArrowBackSharp";
import RoomData from "../../../../modules/room/interface/room-data";
import { BiTrash } from "react-icons/bi";
import { useRooms } from "../../../../lib/provider/RoomsProvider";
import { CircularProgress } from "@mui/material";
import LoadingButton from "../../../../lib/components/LoadingButton/LoadingButton";
import UploadFile from "../../../../lib/components/UploadFile/UploadFile";
import { useUser } from "../../../../lib/provider/UserProvider";
import { useConfirmDialog } from "../../../../lib/provider/ConfirmDialogProvider";

const SettingRoomPage = () => {
  const navigate = useNavigate();
  const [roomEditData, setRoomEditData] = useState<RoomData>({
    id: "",
    name: "",
    avatar: "",
    created_at: "",
    description: "",
    locked: false,
    auto_accepted: false,
    disabled_newsfeed: false,
    exit_locked: false,
    manager_id: "",
  });
  const { roomId } = useParams();
  const { showSnackbarError } = useAppSnackbar();
  const { user } = useUser();
  const { deleteRoom, deletingRoom } = useRooms();
  const { showConfirmDialog } = useConfirmDialog();

  const {
    currentRoom,
    getCurrentRoom,
    updateRoom,
    loadingCurrentRoom,
    updatingRoom,
  } = useRooms();

  useEffect(() => {
    getCurrentRoom(roomId || "");
  }, []);

  useEffect(() => {
    if (currentRoom) {
      setRoomEditData({ ...roomEditData, ...currentRoom });
    }
  }, [currentRoom]);

  return (
    <Box>
      <button
        onClick={() => {
          navigate("/room/" + roomId + "/work");
        }}
        className="back_to_workspace"
      >
        <ArrowBackSharpIcon /> Trở về nơi làm việc
      </button>
      {loadingCurrentRoom && (
        <CircularProgress
          style={{ bottom: "50%", right: "50%", position: "absolute" }}
          size="60px"
          color="inherit"
        />
      )}

      {!loadingCurrentRoom && (
        <Container
          maxWidth="sm"
          style={{
            border: "1px solid",
            marginTop: "1.25rem",
            marginBottom: "3rem",
            paddingBottom: "2.25rem",
            borderRadius: 8,
          }}
        >
          <h2>Cài đặt</h2>
          <Box className="setting_row">
            <Box className="setting_name">
              <AddIcon fontSize="medium" />
              <Box className="setting_description">
                <h3>Tên phòng ban</h3>
              </Box>
            </Box>
          </Box>

          <TextField
            className="room_name"
            type="text"
            error={roomEditData.name.length > 100}
            helperText={!roomEditData.name.length ? 'Không hợp lệ' : ''}
            onChange={(event) => {
              setRoomEditData({
                ...roomEditData,
                name: event.target.value,
              });
            }}
            fullWidth
            value={roomEditData.name}
          />
          <Box className="setting_row">
            <Box className="setting_name">
              <AddIcon fontSize="medium" />
              <Box className="setting_description">
                <h3>Mô tả</h3>
              </Box>
            </Box>
          </Box>

          <TextField
            className="room_name"
            type="text"
            onChange={(event) => {
              setRoomEditData({
                ...roomEditData,
                description: event.target.value,
              });
            }}
            fullWidth
            value={roomEditData ? roomEditData.description : ""}
          />
          {/* <Box className="setting_row">
            <Box className="setting_name">
              <AddIcon fontSize="medium" />
              <Box className="setting_description">
                <h3>Khóa phòng ban</h3>
              </Box>
            </Box>
            <Switch
              checked={roomEditData.locked}
              onChange={(event) => {
                setRoomEditData({
                  ...roomEditData,
                  locked: event.target.checked,
                });
              }}
            />
          </Box> */}

          {/* <Box className="setting_row">
            <Box className="setting_name">
              <AddIcon fontSize="medium" className="add_icon" />
              <Box className="setting_description">
                <h3>Phê duyệt nhân viên</h3>
              </Box>
            </Box>
            <Switch
              checked={roomEditData.auto_accepted}
              onChange={(event) => {
                setRoomEditData({
                  ...roomEditData,
                  auto_accepted: event.target.checked,
                });
              }}
            />
          </Box>

          <h5>
            Tránh tình trạng những nhân viên không có quyền vào phòng tham gia
            vào mà không có sự cho phép của quản lý
          </h5> */}

          <Box className="setting_row">
            <Box className="setting_name">
              <AddIcon fontSize="medium" />
              <Box className="setting_description">
                <h3>Tắt hoạt động bảng tin</h3>
              </Box>
            </Box>
            <Switch
              size="medium"
              checked={roomEditData.disabled_newsfeed}
              onChange={(event) => {
                setRoomEditData({
                  ...roomEditData,
                  disabled_newsfeed: event.target.checked,
                });
              }}
            />
          </Box>

          <h5>Tắt mọi hoạt động đăng bài và bình luận</h5>

          <Box className="setting_row">
            <Box className="setting_name">
              <AddIcon fontSize="medium" />
              <Box className="setting_description">
                <h3>Chặn nhân viên tự ý rời phòng ban</h3>
              </Box>
            </Box>
            <Switch
              size="medium"
              checked={roomEditData.exit_locked}
              onChange={(event) => {
                setRoomEditData({
                  ...roomEditData,
                  exit_locked: event.target.checked,
                });
              }}
            />
          </Box>

          <h5>
            Giúp dễ dàng quản lý nhân viên tốt hơn, tránh nhân viên tự ý thoát
            khỏi phòng
          </h5>

          <UploadFile
            onSuccess={(file) => {
              setRoomEditData({
                ...roomEditData,
                avatar: file.url,
              });
            }}
          >
            <Button variant="outlined" className="avatar_change">
              <img className="image" src={roomEditData.avatar} />
              <h1 className="change_image">
                <FileUploadSharpIcon sx={{ fontSize: 40 }} />
                Chọn file để đổi ảnh
              </h1>
              <input type="file" hidden />
            </Button>
          </UploadFile>
          <Box
            className="df"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "12px",
            }}
          >
            <Box>
              {deletingRoom && <CircularProgress />}

              {currentRoom.manager_id === user?.id && !deletingRoom && (
                <Button
                  style={{
                    display: "flex",
                    padding: "12px 16px 12px 16px",
                    marginBottom: 12,
                    textTransform: "none",
                  }}
                  color="error"
                  variant="contained"
                  onClick={() => {
                    showConfirmDialog({
                      title: (
                        <Typography
                          variant="h6"
                          style={{ fontWeight: 600, color: "#FFFFFF" }}
                        >
                          Xóa phòng {currentRoom.name}
                        </Typography>
                      ),
                      content: (
                        <Typography>
                          Bạn có chắc xóa <strong>{currentRoom.name}</strong>{" "}
                          khỏi danh sách phòng ban của bạn?
                        </Typography>
                      ),
                      onConfirm: async () =>
                        await deleteRoom({ id: currentRoom.id }),
                    });
                  }}
                >
                  <BiTrash fontSize="large" />{" "}
                  <Typography variant="inherit" noWrap width="12ch">
                    Xóa phòng
                  </Typography>
                </Button>
              )}
            </Box>

            <Box>
              <Button
                variant="outlined"
                onClick={() => {
                  setRoomEditData({ ...currentRoom });
                }}
                style={{
                  textTransform: "none",
                  padding: "12px 16px 12px 16px",
                  marginRight: 12,
                }}
              >
                Hủy thay đổi
              </Button>

              <LoadingButton
                variant="contained"
                color="primary"
                disabled={updatingRoom||roomEditData.name===""||roomEditData.name.length > 100}
                loading={updatingRoom}
                onClick={async () => {
                  try {
                    await updateRoom({
                      id: roomId || "",
                      updateData: roomEditData,
                    });
                  } catch (error) {
                    showSnackbarError(error);
                  }
                }}
              >
                Lưu lại
              </LoadingButton>
            </Box>
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default SettingRoomPage;
