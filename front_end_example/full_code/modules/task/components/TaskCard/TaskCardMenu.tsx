import React from "react";
import { Box, IconButton, Typography, ListItemIcon, Menu } from "@mui/material";
import { MenuItem } from "@mui/material";
import { BiEdit, BiTrash } from "react-icons/bi";
import { CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import TaskData from "../../interface/task-data";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTasks } from "../../../../lib/provider/TasksProvider";
import { useConfirmDialog } from "../../../../lib/provider/ConfirmDialogProvider";

const TaskCardMenu = ({ taskData }: { taskData: TaskData }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { showConfirmDialog } = useConfirmDialog();
  const { roomId } = useParams();
  const { deleteTask, deletingTask, setCurrentTask } = useTasks();

  return (
    <Box style={{ position: "absolute", right: 0 }}>
      <IconButton
        type="button"
        onClick={(event) => {
          if (event.target !== event.currentTarget) {
            event.stopPropagation();
            setAnchorEl(event.currentTarget);
          }
        }}
        style={{
          color: "black",
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          setAnchorEl(null);
        }}
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
      >
        <MenuItem
          style={{ display: "flex", padding: 8 }}
          onClick={() => {
            setCurrentTask(taskData);
          }}
        >
          <ListItemIcon>
            <BiEdit fontSize="large" />{" "}
          </ListItemIcon>
          <Typography variant="inherit" noWrap width="18ch">
            Chỉnh sửa công việc
          </Typography>
        </MenuItem>

        {deletingTask ? (
          <CircularProgress />
        ) : (
          <MenuItem
            style={{ display: "flex", padding: 8 }}
            onClick={() => {
              setAnchorEl(null);
              showConfirmDialog({
                title: (
                  <Typography variant="h6" style={{ fontWeight: 600 }}>
                    Xóa công việc
                  </Typography>
                ),
                content: (
                  <Typography>
                    Bạn có chắc xóa việc <strong>{taskData.title}</strong>
                    không?
                  </Typography>
                ),
                onConfirm: async () => {
                  await deleteTask({
                    room_id: roomId ? roomId : "",
                    id: taskData.id,
                  });

                  setCurrentTask(undefined);
                },
              });
            }}
          >
            <ListItemIcon>
              {" "}
              <BiTrash fontSize="large" />{" "}
            </ListItemIcon>
            <Typography variant="inherit" noWrap width="18ch">
              Xóa công việc
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default TaskCardMenu;
