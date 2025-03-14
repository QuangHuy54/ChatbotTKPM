import {
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fade,
  MenuItem,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import { useUser } from "../../lib/provider/UserProvider";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import LoadingButton from "../../lib/components/LoadingButton/LoadingButton";
import UserData from "../../modules/user/interface/user-data";
import UploadFile from "../../lib/components/UploadFile/UploadFile";
import makeStyles from "@mui/styles/makeStyles";

const useStyle = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    width: 820,
    position: "relative",
    left: "calc(50% - 410px)",
    marginTop: 8,
    marginBottom: 40,
    padding: "32px 24px",
    borderRadius: 4,
    border: "1px solid #E7E8EF",
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
  },
  sectionText: {
    margin: "16px 0px 8px 0px",
  },
  textFieldLabel: {
    marginTop: 12,
    textWeight: "bold",
  },
  avatarContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 240,
    height: 240,
  },
  avatarEditButton: {
    textTransform: "none",
    fontSize: 12,
    fontWeight: "bold",
    width: 112,
    borderRadius: 4,
    border: "1px solid #1E88E5",
    background: "#FFFFFF",
  },
}));

const SettingPage = () => {
  const classes = useStyle();
  const { user, loadingUser, editUser, editingUser } = useUser();

  const [userEditData, setUserEditData] = useState<UserData>({
    auth_id: "",
    id: "",
    email: "",
    avatar: "",
    name: "",
    created_at: "",
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorDialogEl, setAnchorDialogEl] = useState<null | HTMLElement>(
    null
  );

  useEffect(() => {
    if (user) {
      setUserEditData({ ...userEditData, ...user });
    }
  }, [user]);

  return (
    <>
      <Box className={classes.container}>
        <Typography variant="h4">Cài đặt</Typography>

        <Typography variant="h5" className={classes.sectionText}>
          Thông tin cá nhân
        </Typography>

        <Divider />

        <Box className={classes.avatarContainer}>
          <Typography className={classes.textFieldLabel}>
            Ảnh đại diện:
          </Typography>

          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Button
                startIcon={<EditIcon />}
                className={classes.avatarEditButton}
                id="edit-avatar-button"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                  setAnchorEl(event.currentTarget)
                }
                aria-controls={!!anchorEl ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={!!anchorEl ? "true" : undefined}
                sx={{
                  transition: "background-color 0.4s ease",
                  "&:hover": { backgroundColor: "#e7e9eb" },
                }}
              >
                Chỉnh sửa
              </Button>
            }
          >
            <Avatar
              src={userEditData.avatar}
              alt="User's avatar"
              className={classes.avatar}
            />
          </Badge>
        </Box>

        <Typography className={classes.textFieldLabel}>Họ và tên:</Typography>
        <TextField
          autoFocus
          variant="outlined"
          onChange={(event) => {
            setUserEditData({ ...userEditData, name: event.target.value });
          }}
          style={{ width: 320 }}
          size="small"
          value={userEditData.name}
          helperText="Tên của bạn xuất hiện trên trang cá nhân"
        />

        <Typography className={classes.textFieldLabel}>Email:</Typography>
        <TextField
          variant="outlined"
          disabled
          style={{ width: 320 }}
          size="small"
          value={userEditData.email}
        />

        <Typography className={classes.textFieldLabel}>Company:</Typography>
        <TextField variant="outlined" style={{ width: 320 }} size="small" />

        <Typography className={classes.textFieldLabel}>Bio:</Typography>
        <TextField
          multiline
          maxRows={5}
          variant="outlined"
          fullWidth
          helperText="Bio hiển thị trên trang cá nhân giúp mọi người hiểu bạn hơn"
        />

        <LoadingButton
          onClick={async () => {
            await editUser({
              id: user?.id || "",
              fields: {
                name: userEditData.name,
                avatar: userEditData.avatar,
              },
            });
          }}
          variant="contained"
          loading={editingUser || loadingUser}
          style={{
            padding: "8px 16px",
            marginTop: 16,
            alignSelf: "flex-end",
          }}
          disabled={loadingUser || editingUser}
        >
          Cập nhật
        </LoadingButton>

        <Popover
          id="edit-avatar-menu"
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
          aria-labelledby="edit-avatar-button"
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          TransitionComponent={Fade}
        >
          <UploadFile
            onSuccess={(file) => {
              setUserEditData({ ...userEditData, avatar: file.url });
              setAnchorEl(null);
            }}
          >
            <MenuItem>Tải ảnh lên</MenuItem>
          </UploadFile>

          <MenuItem
            id="delete-button"
            onClick={(event: React.MouseEvent<HTMLElement>) =>
              setAnchorDialogEl(event.currentTarget)
            }
            aria-controls={!!anchorDialogEl ? "confirm-dialog" : undefined}
            aria-haspopup="true"
            aria-expanded={!!anchorDialogEl ? "true" : undefined}
          >
            Xóa ảnh
          </MenuItem>
        </Popover>

        <Dialog
          open={!!anchorDialogEl}
          id="confirm-dialog"
          onClose={() => setAnchorDialogEl(null)}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          <DialogTitle id="confirm-dialog-title">
            Đồng ý xóa ảnh đại diện?
          </DialogTitle>

          <DialogContent>
            <DialogContentText id="confirm-dialog-description">
              Sau khi xóa, ảnh đại diện sẽ là ảnh mặc định, với các kí tự là
              viết tắt tên của bạn
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setAnchorDialogEl(null)}>Hủy</Button>
            <Button
              onClick={() => {
                setUserEditData({ ...userEditData, avatar: "" });
                setAnchorDialogEl(null);
              }}
              autoFocus
            >
              Đồng ý
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box style={{ height: 40 }} />
    </>
  );
};

export default SettingPage;
