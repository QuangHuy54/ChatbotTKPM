import React, { useState, useEffect } from "react";
import { Box, BoxProps, Card } from "@mui/material";
import TaskData from "../../../task/interface/task-data";
import { Typography } from "@mui/material";
import UserHelper from "../../../user/util/user-helper";
import UserData from "../../../user/interface/user-data";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";
import USER_AVATAR_DEFAULT from "../../../user/contants/user-avatar-default";
import TaskCardMenu from "./TaskCardMenu";
import { useTasks } from "../../../../lib/provider/TasksProvider";
import truncate from "../../../../lib/util/truncate";

interface TaskCardProps {
  task: TaskData;
  mode: "card" | "item";
  isDragging: string;
}

const TaskCard = ({
  task,
  mode,
  isDragging,
  ...boxProps
}: TaskCardProps & BoxProps) => {
  const [user, setUser] = useState<UserData>();
  const { showSnackbarError } = useAppSnackbar();
  const { setCurrentTask, currentTask } = useTasks();

  const getUserData = async (id?: string) => {
    try {
      const userInfo = await UserHelper.getUserById(id || "");
      if (JSON.stringify(userInfo) !== JSON.stringify(user)) {
        setUser(userInfo);
      }
    } catch (error) {
      showSnackbarError(error);
    }
  };
  useEffect(() => {
    getUserData(task.assignee_id);
  }, []);

  useEffect(() => {
    if (currentTask && currentTask.id === task.id) {
      getUserData(currentTask?.assignee_id);
    }
  }, [currentTask]);

  if (mode === "card") {
    return (
      <Card>
        <Box
          style={{
            width: 260,
            padding: 12,
            background: `${isDragging === task.id ? "#d8f9ff" : "white"}`,
          }}
          {...boxProps}
          onDoubleClick={() => setCurrentTask(task)}
          sx={{
            "&:hover": {
              cursor: "pointer",
            },
          }}
        >
          <Box
            style={{
              display: "flex",
              position: "relative",
              gap: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography style={{ fontSize: 18 }}>
              {truncate(task.title, 40)}
            </Typography>

            <Box
              sx={{
                height: 40,
                width: 40,
              }}
            >
              <TaskCardMenu taskData={task} />
            </Box>
          </Box>

          <Box
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Typography style={{ fontSize: 14, color: "#888888" }}>
              {truncate(task.content || "", 80)}
            </Typography>

            <Box
              component="img"
              sx={{
                height: 40,
                width: 40,
                borderRadius: "50%",
              }}
              src={user ? user.avatar : USER_AVATAR_DEFAULT}
            />
          </Box>
        </Box>
      </Card>
    );
  } else {
    return (
      <Card>
        <Box
          style={{
            width: 260,
            height: 35,
            padding: 10,
            border: "0.1px solid black",
            display: "flex",
            alignItems: "center",
          }}
          {...boxProps}
          sx={{
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={() => setCurrentTask(task)}
        >
          <Box
            component="img"
            sx={{
              height: 24,
              width: 24,
              borderRadius: "50%",
            }}
            src={user ? user.avatar : USER_AVATAR_DEFAULT}
          />
          <Typography align="center" style={{ fontSize: 14, marginLeft: 10 }}>
            {truncate(task.title, 40)}
          </Typography>
          <TaskCardMenu taskData={task} />
        </Box>
      </Card>
    );
  }
};

export default TaskCard;
