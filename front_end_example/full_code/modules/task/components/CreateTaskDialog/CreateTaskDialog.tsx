import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Box, Button, Fade, Tooltip } from "@mui/material";
import React, { useState } from "react";
import LoadingButton from "../../../../lib/components/LoadingButton/LoadingButton";
import { useAuth } from "../../../../lib/provider/AuthProvider";
import { useUser } from "../../../../lib/provider/UserProvider";
import { useTasks } from "../../../../lib/provider/TasksProvider";
import { useParams } from "react-router-dom";
import UploadFile from "../../../../lib/components/UploadFile/UploadFile";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AssignMemberBox from "../AssignMemberBox/AssignMemberBox";
import TaskData from "../../interface/task-data";
import truncate from "../../../../lib/util/truncate";
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
}));

const CreateTaskDialog = ({ ...dialogProps }: DialogProps) => {
  const { roomId } = useParams();
  const { taskStatuses, createTask, creatingTask } = useTasks();
  const { logOut } = useAuth();
  const { user } = useUser();

  const emptyTask = {
    id: "",
    title: "",
    order_value: "",
    content: "",
    attach_files: [],
    status: "toDo" as "toDo" | "doing" | "reviewing" | "done",
    assignee_id: "",
    creator_id: "",
    created_at: "",
    deadline: "",
    comments: [],
  };
  const [newTask, setNewTask] = useState<TaskData>({ ...emptyTask });

  const classes = useStyle();

  if (!user) return null;

  return (
    <Dialog {...dialogProps}>
      <DialogTitle>Tạo công việc mới</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Bạn đang đăng nhập bằng tài khoản:
        </DialogContentText>

        <Box className={classes.container}>
          <img src={user.avatar} alt="avatar" className={classes.image} />

          <Box className={classes.userName}>{truncate(user.name)}</Box>

          <Button variant="outlined" onClick={async () => await logOut()}>
            Chuyển tài khoản
          </Button>
        </Box>

        <TextField
          autoFocus
          label="Tên công việc:"
          required
          fullWidth
          error={newTask.title.length > 100}
          helperText={!newTask.title.length ? "Không hợp lệ" : ""}
          value={newTask.title}
          onChange={(event) =>
            setNewTask({ ...newTask, title: event.target.value })
          }
        />

        <TextField
          label="Mô tả:"
          margin="dense"
          multiline
          maxRows={5}
          fullWidth
          variant="standard"
          onChange={(event) =>
            setNewTask({ ...newTask, content: event.target.value })
          }
        />

        <Box
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            margin: "4px 0px",
            gap: 16,
          }}
        >
          <UploadFile
            onSuccess={async (file) => {
              console.log(file.url);
              // chưa có hàm add file trong provider. (updateTask ko có attach_files)
            }}
          >
            <Tooltip
              TransitionProps={{ timeout: 800 }}
              title="Đính kèm tập tin"
              placement="bottom"
              TransitionComponent={Fade}
              arrow
            >
              <Button
                startIcon={<AttachFileIcon />}
                style={{
                  textTransform: "none",
                  background: "#DDD",
                  color: "rgb(23,43,77)",
                }}
              >
                Đính kèm
              </Button>
            </Tooltip>
          </UploadFile>

          <AssignMemberBox
            task={newTask}
            onChoose={(member) =>
              setNewTask({ ...newTask, assignee_id: member.id })
            }
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => {
            dialogProps.onClose?.({}, "backdropClick");
            setNewTask({ ...emptyTask });
          }}
          style={{ padding: 8 }}
        >
          HỦY
        </Button>

        <LoadingButton
          onClick={async () => {
            await createTask({
              room_id: roomId || "",
              new_task: {
                title: newTask.title,
                content: newTask.content,
                assignee_id: newTask.assignee_id,
                attach_files: newTask.attach_files,
                status: taskStatuses[0].name,
              },
            });
            dialogProps.onClose?.({}, "backdropClick");
            setNewTask({ ...emptyTask });
          }}
          variant="contained"
          color="primary"
          loading={creatingTask}
          style={{ padding: 8 }}
          disabled={
            newTask.title === "" || creatingTask || newTask.title.length >= 100
          }
        >
          TẠO
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog;
