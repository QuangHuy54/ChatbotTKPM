import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useAuth } from "../../../../lib/provider/AuthProvider";
import { useRooms } from "../../../../lib/provider/RoomsProvider";
import SendIcon from "@mui/icons-material/Send";
import LoadingButton from "../../../../lib/components/LoadingButton/LoadingButton";
import { useUser } from "../../../../lib/provider/UserProvider";
import makeStyles from "@mui/styles/makeStyles";

const useStyle = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  image: {
    width: "40px",
    height: "40px",
    borderRadius: "100%",
    marginRight: "8px",
    padding: "2px",
    border: "solid 1px #1876f2",
  },
  userName: {
    flexGrow: 2,
  },
  helpTitle: {
    marginTop: "16px",
  },
  helpText: {
    color: "#999",
    fontSize: "12px",
  },
}));

const JoinRoomDialog = ({ ...dialogProps }: DialogProps) => {
  const [collapse, setCollapse] = useState(true);
  const [id, setId] = useState("");

  const { joinRoom, joiningRoom } = useRooms();
  const { logOut } = useAuth();
  const { user } = useUser();

  const classes = useStyle();

  return (
    <Box>
      <Dialog {...dialogProps}>
        <DialogTitle>Tham gia phòng</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Bạn đang đăng nhập bằng tài khoản:
          </DialogContentText>

          <Box className={classes.container}>
            <img src={user?.avatar} alt="avatar" className={classes.image} />
            <Box className={classes.userName}>{user?.name}</Box>

            <Button variant="outlined" onClick={async () => await logOut()}>
              Chuyển tài khoản
            </Button>
          </Box>

          <TextField
            autoFocus
            margin="dense"
            label="Mã phòng:"
            type="text"
            required
            fullWidth
            helperText="Mã phòng gồm 20 kí tự 0-9, a-z, A-Z"
            variant="standard"
            onChange={(event) => {
              setId(event.target.value);
            }}
          />

          <Typography
            onClick={() => setCollapse(!collapse)}
            className={classes.helpTitle}
          >
            Hướng dẫn
          </Typography>

          <Collapse in={!collapse}>
            <Typography className={classes.helpText}>
              Nếu chưa có mã phòng, hãy liên hệ trưởng phòng của bạn
            </Typography>

            <Typography className={classes.helpText}>
              Hãy dùng tài khoản hợp lệ để tham gia vào phòng
            </Typography>

            <Typography className={classes.helpText}>
              Sau khi bạn điền đầy đủ thông tin và nhấn nút <b>Tham gia</b>, bạn
              sẽ đưa vào phòng nếu thông tin hợp lệ.
            </Typography>
          </Collapse>
        </DialogContent>

        <DialogActions>
          <Button
            style={{ padding: "8px 12px" }}
            variant="outlined"
            onClick={() => {
              setId("");
              dialogProps.onClose?.({}, "backdropClick");
            }}
          >
            <Typography>HỦY</Typography>
          </Button>

          <LoadingButton
            loading={joiningRoom}
            disabled={id === "" || joiningRoom}
            size="small"
            variant="contained"
            color="primary"
            style={{ padding: "8px 12px" }}
            onClick={async () => {
              await joinRoom({ id: id });
              dialogProps.onClose?.({}, "backdropClick");
              setId("");
            }}
          >
            <Typography>THAM GIA</Typography>&nbsp;&nbsp;
            <SendIcon style={{ width: 20, height: 20 }} />
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JoinRoomDialog;
