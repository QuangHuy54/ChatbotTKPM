import React, { useEffect, useMemo, useState } from "react";
import LeftSideBar from "../../../../modules/room/components/LeftSideBar/LeftSideBar";
import { useRooms } from "../../../../lib/provider/RoomsProvider";
import { useParams } from "react-router-dom";
import TaskData from "../../../../modules/task/interface/task-data";
import TaskDetailDialog from "../../../../modules/task/components/TaskDetailDialog/TaskDetailDialog";
import TaskList from "../../../../modules/task/components/TaskList/TaskList";
import "react-perfect-scrollbar/dist/css/styles.css";
import { useTasks } from "../../../../lib/provider/TasksProvider";
import { Box, Button, IconButton, Typography } from "@mui/material";
import PerfectScrollbar from "react-perfect-scrollbar";
import { DragDropContext, DragStart, DropResult } from "react-beautiful-dnd";
import CreateTaskDialog from "../../../../modules/task/components/CreateTaskDialog/CreateTaskDialog";
import TaskHelper from "../../../../modules/task/util/task-helper";
import ShowMenuButton from "../../../../lib/components/ShowMenuButton/ShowMenuButton";
import ExportDocxDialog from "../../../../modules/task/components/ExportDocxDialog/ExportDocxDialog";
import exportTasksToWord from "../../../../modules/task/util/export-tasks-to-word";
import convertTimeToTimeString from "../../../../lib/util/convert-time-to-time-string";
import UserHelper from "../../../../modules/user/util/user-helper";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";
import { BiArrowFromLeft, BiArrowFromRight, BiPlus, BiX } from "react-icons/bi";
import TaskStatusData from "../../../../modules/task/interface/task-status-data";
import truncate from "../../../../lib/util/truncate";
import InputDialog from "../../../../lib/components/InputDialog/InputDialog";
import { useConfirmDialog } from "../../../../lib/provider/ConfirmDialogProvider";
import { CSVLink } from "react-csv";

const WorkPage = () => {
  const { showSnackbarError } = useAppSnackbar();
  const { getCurrentRoom, currentRoom } = useRooms();
  const { roomId } = useParams();
  const {
    taskStatuses,
    getTaskStatuses,
    createTaskStatus,
    deleteTaskStatus,
    deletingTaskStatus,
    updateTaskStatus,
    updatingTaskStatus,

    tasks,
    setTasks,
    getTasks,
    updateTask,
    deleteTask,
    currentTask,
    setCurrentTask,
  } = useTasks();

  const [openCreateTaskDialog, setOpenCreateTaskDialog] = useState(false);
  const [openExportDocxDialog, setOpenExportDocxDialog] = useState(false);
  const [hoverTitleTaskList, setHoverTitleTaskList] = useState("");
  const [showInputDialog, setShowInputDialog] = useState("");
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatusData>();
  const [isDraggingId, setIsDraggingId] = useState("-1");
  const { showConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    getCurrentRoom(roomId || "");
  }, [roomId]);

  useEffect(() => {
    if (currentRoom) {
      getTasks({ room_id: roomId || "" });
      getTaskStatuses({ room_id: roomId || "" });
    }
  }, [currentRoom]);

  const compareTasks = (TaskA: TaskData, TaskB: TaskData) => {
    if (TaskA.order_value >= TaskB.order_value) {
      return 1;
    }
    return -1;
  };

  function handleOnDragStart(result: DragStart) {
    setIsDraggingId(tasks[result.source.index].id);
  }

  const handleOnDragEnd = async (result: DropResult) => {
    setIsDraggingId("-1");
    if (!result.destination) return;

    const taskDestinitionList = tasks
      .filter(
        (task) =>
          task.status ===
          taskStatuses.find(
            (status) =>
              status.task_status_id === result.destination?.droppableId
          )?.name
      )
      .sort(compareTasks);

    const updateData = {
      status:
        taskStatuses.find(
          (status) => status.task_status_id === result.destination?.droppableId
        )?.name || "",
      order_value: TaskHelper.getOrderString(
        taskDestinitionList[result.destination.index - 1]?.order_value ?? "",
        taskDestinitionList[result.destination.index + 1]?.order_value ?? ""
      ),
    };

    // setTasks(tasks.filter((task) => task.id !== result.draggableId));

    await updateTask({
      room_id: roomId ? roomId : "",
      id: result.draggableId,
      updateData: updateData,
    });

    // if (result.source.droppableId === "toDo") {
    //   dragTask = tasksToDo.at(result.source.index);
    //   tasksToDo.splice(result.source.index, 1);
    //   setTasksToDo(tasksToDo);
    // } else if (result.source.droppableId === "doing") {
    //   dragTask = tasksDoing.at(result.source.index);
    //   tasksDoing.splice(result.source.index, 1);
    //   setTasksDoing(tasksDoing);
    // } else if (result.source.droppableId === "reviewing") {
    //   dragTask = tasksReviewing.at(result.source.index);
    //   tasksReviewing.splice(result.source.index, 1);
    //   setTasksReviewing(tasksReviewing);
    // } else {
    //   dragTask = tasksDone.at(result.source.index);
    //   tasksDone.splice(result.source.index, 1);
    //   setTasksDone(tasksDone);
    // }

    // if (result.destination.droppableId === "toDo") {
    //   if (dragTask) {
    //     tasksToDo.splice(result.destination.index, 0, dragTask);
    //     setTasksToDo(tasksToDo);
    //     await updateTask({
    //       room_id: roomId ? roomId : "",
    //       id: result.draggableId,
    //       updateData: {
    //         status: "toDo",
    //         order_value: TaskHelper.getOrderString(
    //           tasksToDo[tasksToDo.indexOf(dragTask) - 1]?.order_value ?? "",
    //           tasksToDo[tasksToDo.indexOf(dragTask) + 1]?.order_value ?? ""
    //         ),
    //       },
    //     });
    //   }
    // } else if (result.destination.droppableId === "doing") {
    //   if (dragTask) {
    //     tasksDoing.splice(result.destination.index, 0, dragTask);
    //     setTasksDoing(tasksDoing);
    //     await updateTask({
    //       room_id: roomId ? roomId : "",
    //       id: result.draggableId,
    //       updateData: {
    //         status: "doing",
    //         order_value: TaskHelper.getOrderString(
    //           tasksDoing[tasksDoing.indexOf(dragTask) - 1]?.order_value ?? "",
    //           tasksDoing[tasksDoing.indexOf(dragTask) + 1]?.order_value ?? ""
    //         ),
    //       },
    //     });
    //   }
    // } else if (result.destination.droppableId === "reviewing") {
    //   if (dragTask) {
    //     tasksReviewing.splice(result.destination.index, 0, dragTask);
    //     setTasksReviewing(tasksReviewing);
    //     await updateTask({
    //       room_id: roomId ? roomId : "",
    //       id: result.draggableId,
    //       updateData: {
    //         status: "reviewing",
    //         order_value: TaskHelper.getOrderString(
    //           tasksReviewing[tasksReviewing.indexOf(dragTask) - 1]
    //             ?.order_value ?? "",
    //           tasksReviewing[tasksReviewing.indexOf(dragTask) + 1]
    //             ?.order_value ?? ""
    //         ),
    //       },
    //     });
    //   }
    // } else if (result.destination.droppableId === "done") {
    //   if (dragTask) {
    //     tasksDone.splice(result.destination.index, 0, dragTask);
    //     setTasksDone(tasksDone);
    //     await updateTask({
    //       room_id: roomId ? roomId : "",
    //       id: result.draggableId,
    //       updateData: {
    //         status: "done",
    //         order_value: TaskHelper.getOrderString(
    //           tasksDone[tasksDone.indexOf(dragTask) - 1]?.order_value ?? "",
    //           tasksDone[tasksDone.indexOf(dragTask) + 1]?.order_value ?? ""
    //         ),
    //       },
    //     });
    //   }
    // }
  };

  const [tasksDataCSV, setTasksDataCSV] = useState<string[][]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const rows = await Promise.all(
        tasks.map(async (task) => {
          const assignee = await UserHelper.getUserById(task.assignee_id);
          const creator = await UserHelper.getUserById(task.creator_id);
          return [
            task.id || "",
            task.title,
            task.content || "",
            task.status,
            task.creator_id || "",
            creator?.name || "",
            convertTimeToTimeString(task.created_at || ""),
            task.assignee_id || "",
            assignee?.name || "",
            convertTimeToTimeString(task.deadline || ""),
          ];
        })
      );

      const data = [
        [
          "ID",
          "Title",
          "Content",
          "Status",
          "Creator's ID",
          "Creator",
          "Created at",
          "Assignee's ID",
          "Assignee",
          "Deadline",
        ],
        ...rows,
      ];

      setTasksDataCSV(data);
    };

    fetchData();
  }, [tasks]);

  return (
    <>
      <LeftSideBar>
        <Box
          style={{
            display: "flex",
            height: "calc(100vh - 66px)",
            flexDirection: "column",
          }}
        >
          <Box style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              disabled={!taskStatuses.length}
              variant="contained"
              color="primary"
              style={{
                margin: "0.625rem",
                width: "200px",
                textTransform: "none",
              }}
              onClick={() => {
                setOpenCreateTaskDialog(true);
              }}
            >
              <Typography style={{ fontWeight: 600 }}>Tạo công việc</Typography>
            </Button>
            <CreateTaskDialog
              open={openCreateTaskDialog}
              onClose={() => {
                setOpenCreateTaskDialog(false);
              }}
            />

            {/* Actions Button */}
            <Box
              style={{
                marginRight: "1rem",
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <Button
                style={{
                  color: "rgb(23,43,77)",
                  textTransform: "none",
                  background: "#DDD",
                }}
                onClick={() => {
                  setOpenExportDocxDialog(true);
                }}
              >
                Xuất docx
              </Button>

              <CSVLink
                data={tasksDataCSV}
                filename={"e-workroom.csv"}
                style={{
                  textDecoration: "none",
                  padding: "6px",
                  display: "block",
                  color: "rgb(23,43,77)",
                  textTransform: "none",
                  background: "#DDD",
                  borderRadius: "4px",
                }}
              >
                Xuất CSV
              </CSVLink>
            </Box>
          </Box>

          <PerfectScrollbar
            style={{
              marginTop: 16,
              marginLeft: 8,
              display: "flex",
            }}
          >
            <Box
              style={{
                maxHeight: 560,
                display: "flex",
              }}
            >
              <DragDropContext
                onDragEnd={handleOnDragEnd}
                onDragStart={handleOnDragStart}
              >
                {taskStatuses
                  .sort((statusA: TaskStatusData, statusB: TaskStatusData) =>
                    statusA.order < statusB.order ? -1 : 1
                  )
                  .map((taskStatus, index) => (
                    <PerfectScrollbar
                      style={{
                        background: "#f1f3f9",
                        marginRight: 12,
                        width: 300,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        onMouseEnter={() =>
                          setHoverTitleTaskList(taskStatus.task_status_id)
                        }
                        onMouseLeave={() => setHoverTitleTaskList("")}
                        style={{
                          width: "100%",
                          height: 52,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {hoverTitleTaskList === taskStatus.task_status_id && (
                          <Box
                            style={{
                              position: "absolute",
                              left: 0,
                              display: "flex",
                            }}
                          >
                            <IconButton
                              disabled={index === 0}
                              onClick={async () =>
                                await Promise.all([
                                  updateTaskStatus({
                                    room_id: roomId ?? "",
                                    task_status_id: taskStatus.task_status_id,
                                    updateData: { order: taskStatus.order - 1 },
                                  }),
                                  updateTaskStatus({
                                    room_id: roomId ?? "",
                                    task_status_id:
                                      taskStatuses[index - 1].task_status_id,
                                    updateData: {
                                      order: taskStatuses[index - 1].order + 1,
                                    },
                                  }),
                                ])
                              }
                            >
                              <BiArrowFromRight />
                            </IconButton>

                            <IconButton
                              disabled={index === taskStatuses?.length - 1}
                              onClick={async () =>
                                await Promise.all([
                                  updateTaskStatus({
                                    room_id: roomId ?? "",
                                    task_status_id: taskStatus.task_status_id,
                                    updateData: { order: taskStatus.order + 1 },
                                  }),
                                  updateTaskStatus({
                                    room_id: roomId ?? "",
                                    task_status_id:
                                      taskStatuses[index + 1].task_status_id,
                                    updateData: {
                                      order: taskStatuses[index + 1].order - 1,
                                    },
                                  }),
                                ])
                              }
                            >
                              <BiArrowFromLeft />
                            </IconButton>
                          </Box>
                        )}
                        <Box
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 52,
                          }}
                        >
                          <Typography
                            style={{
                              fontSize: 18,
                              textDecoration: "underline",
                              cursor:
                                hoverTitleTaskList === taskStatus.task_status_id
                                  ? "pointer"
                                  : "default",
                            }}
                            onClick={() => {
                              setShowInputDialog("change_title_status");
                              setEditTaskStatus(taskStatus);
                            }}
                          >
                            {truncate(taskStatus.name, 15)}
                          </Typography>
                        </Box>

                        {hoverTitleTaskList === taskStatus.task_status_id && (
                          <IconButton
                            style={{ position: "absolute", right: 0 }}
                            onClick={async () =>
                              showConfirmDialog({
                                title: "Xóa trạng thái",
                                content:
                                  "Bạn có thực sự muốn xóa trạng thái công việc này không?",
                                onConfirm: async () => {
                                  await Promise.all([
                                    deleteTaskStatus({
                                      room_id: roomId ?? "",
                                      task_status_id: taskStatus.task_status_id,
                                    }),
                                    ...tasks
                                      .filter(
                                        (task) =>
                                          task.status === taskStatus.name
                                      )
                                      .map((task) =>
                                        deleteTask({
                                          room_id: roomId ?? "",
                                          id: task.id,
                                        })
                                      ),
                                  ]);
                                },
                              })
                            }
                          >
                            <BiX />
                          </IconButton>
                        )}
                      </Box>
                      <TaskList
                        curTaskList={tasks
                          .filter((task) => task.status === taskStatus.name)
                          .sort(compareTasks)}
                        status={taskStatus.task_status_id}
                        type={"card"}
                        isDragging={isDraggingId}
                      />
                    </PerfectScrollbar>
                  ))}
                <Box
                  style={{
                    height: 24,
                    width: 24,
                    borderRadius: 8,
                    background: "#d8f9ff",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onClick={async () => setShowInputDialog("create_status")}
                >
                  <BiPlus />
                </Box>
                <Box style={{ width: 12 }} />
              </DragDropContext>
            </Box>
          </PerfectScrollbar>
        </Box>
      </LeftSideBar>

      {!!currentTask && (
        <TaskDetailDialog
          task={currentTask}
          open={!!currentTask}
          onClose={() => setCurrentTask(undefined)}
        />
      )}

      {!!showInputDialog && (
        <InputDialog
          open={!!showInputDialog}
          style={{ minWidth: 400 }}
          title={
            showInputDialog === "create_status"
              ? "Tạo trạng thái công việc"
              : "Thay đổi tên trạng thái công việc"
          }
          initInputText={editTaskStatus?.name}
          placeholder="Nhập tên trạng thái..."
          inputErrorText="Tên trạng thái không được trùng"
          onClose={() => setShowInputDialog("")}
          showError={(text) =>
            taskStatuses.map((status) => status.name).includes(text)
          }
          onConfirm={async (text) => {
            if (showInputDialog === "create_status") {
              await createTaskStatus({
                room_id: roomId ?? "",
                new_task_status: {
                  name: !!text
                    ? text
                    : Math.random().toString(36).substring(2, 12),
                  order: taskStatuses?.length,
                },
              });
            } else {
              await Promise.all([
                updateTaskStatus({
                  room_id: roomId ?? "",
                  task_status_id: editTaskStatus?.task_status_id || "",
                  updateData: {
                    name: text,
                  },
                }),
                ...tasks.map((task) =>
                  updateTask({
                    room_id: roomId ?? "",
                    id: task.id,
                    updateData: { status: text },
                  })
                ),
              ]);
            }
          }}
        />
      )}

      <ExportDocxDialog
        open={openExportDocxDialog}
        onClose={() => setOpenExportDocxDialog(false)}
        onConfirm={async (config_data) => {
          const tasksData = await Promise.all(
            tasks.map(async (task) => {
              const assignee = await UserHelper.getUserById(task.assignee_id);
              const creator = await UserHelper.getUserById(task.creator_id);
              return {
                title: task.title,
                content: task.content || "",
                status: task.status,
                assignee: assignee?.name || "",
                creator: creator?.name || "",
                created_at: convertTimeToTimeString(task.created_at || ""),
                deadline: convertTimeToTimeString(task.deadline || ""),
                last_edit: task.last_edit || "",
                description: task.content || "",
                room: currentRoom.name || "",
              };
            })
          );

          await exportTasksToWord(
            {
              ...config_data,
              tasks: tasksData,
            },
            (config_data.fileName || "output") + ".docx"
          );
        }}
      />
    </>
  );
};

export default WorkPage;
