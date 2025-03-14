import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  Dialog,
  DialogProps,
  Divider,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRooms } from "../../../../lib/provider/RoomsProvider";
import TaskData from "../../interface/task-data";
import ClearIcon from "@mui/icons-material/Clear";
import ShareIcon from "@mui/icons-material/Share";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AddLinkIcon from "@mui/icons-material/AddLink";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEffect, useState } from "react";
import { useTasks } from "../../../../lib/provider/TasksProvider";
import { useUser } from "../../../../lib/provider/UserProvider";
import truncate from "../../../../lib/util/truncate";
import UploadFile from "../../../../lib/components/UploadFile/UploadFile";
import AssignMemberBox from "../AssignMemberBox/AssignMemberBox";
import { useNavigate } from "react-router-dom";
import convertTimeToString from "../../../../lib/util/convert-time-to-string";
import { useMembers } from "../../../../lib/provider/MembersProvider";
import { Timestamp } from "firebase/firestore";
import TaskHelper from "../../util/task-helper";
import makeStyles from "@mui/styles/makeStyles";
import { useConfirmDialog } from "../../../../lib/provider/ConfirmDialogProvider";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";

interface TaskDetailDialogProps {
  task?: TaskData;
  open: boolean;
  onClose?: () => void;
}

const useStyle = makeStyles((theme) => ({
  dialog: {
    padding: "8px 24px 16px",
  },
  dialog_header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  dialog_header_actions: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  dialog_body: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 48,
  },
  dialog_body_left: {
    maxWidth: 600,
    flexGrow: 24,
  },
  dialog_body_right: {
    flexGrow: 7,
  },
  body_actions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
    margin: "8px 0px 20px",
  },
  body_action: {
    color: "rgb(23,43,77)",
    textTransform: "none",
    background: "#DDD",
  },
  edit_field: {
    transition: "background 0.4s ease",
    "&:hover": {
      background: "#EBECF0",
    },
  },
  field_title: {
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: "24px",
    color: "#666666",
  },
}));

const TaskDetailDialog = ({
  task,
  ...dialogProps
}: TaskDetailDialogProps & DialogProps) => {
  const emptyTask = {
    id: "",
    title: "",
    content: "",
    order_value: "",
    attach_files: [],
    status: "toDo" as "toDo" | "doing" | "reviewing" | "done",
    assignee_id: "",
    creator_id: "",
    created_at: "",
    deadline: "",
    comments: [],
  };

  const classes = useStyle();
  const navigate = useNavigate();
  const { showConfirmDialog } = useConfirmDialog();

  const { currentRoom, loadingCurrentRoom } = useRooms();
  const {
    taskStatuses,
    getTaskStatuses,
    updateTask,
    deleteTask,
    setCurrentTask,
  } = useTasks();
  const { member, getMember } = useMembers();
  const { user } = useUser();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [voted, setVoted] = useState(false);
  const [watches, setWatches] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [editTask, setEditTask] = useState<TaskData>({ ...emptyTask });
  const { showSnackbarError } = useAppSnackbar();

  const [moreActionsAnchorEl, setMoreActionsAnchorEl] =
    useState<null | HTMLElement>(null);

  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [statusSelected, setStatusSelected] = useState("");

  useEffect(() => {
    getTaskStatuses({ room_id: currentRoom.id });
    task && setEditTask({ ...task });
    setStatusSelected(task?.status || "");

    task && getMember({ room_id: currentRoom.id, member_id: task.creator_id });
  }, [task]);

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth={true}
      maxWidth="lg"
      {...dialogProps}
    >
      <Box className={classes.dialog}>
        {/* Header of the dialog */}
        <Box className={classes.dialog_header}>
          {/* Info about room */}
          <Box>
            {loadingCurrentRoom ? (
              <CircularProgress />
            ) : (
              <Typography onClick={() => {}} title={currentRoom.name}>
                {"Phòng: " + truncate(currentRoom.name, 40)}
              </Typography>
            )}
          </Box>

          {/* Header action buttons */}
          <Box className={classes.dialog_header_actions}>
            <Tooltip
              TransitionProps={{ timeout: 800 }}
              title="Theo dõi"
              placement="top"
              TransitionComponent={Fade}
              arrow
              onClick={() => {
                setWatches(!watches);
              }}
            >
              <IconButton>
                {watches ? <VisibilityIcon /> : <VisibilityOutlinedIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip
              TransitionProps={{ timeout: 800 }}
              title="Thích"
              placement="top"
              TransitionComponent={Fade}
              arrow
              onClick={() => {
                setVoted(!voted);
              }}
            >
              <IconButton>
                {voted ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip
              TransitionProps={{ timeout: 800 }}
              title="Chia sẻ"
              placement="top"
              TransitionComponent={Fade}
              arrow
              onClick={() => {}}
            >
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Tooltip>

            <Tooltip
              TransitionProps={{ timeout: 800 }}
              title="Khác"
              placement="top"
              TransitionComponent={Fade}
              arrow
            >
              <IconButton
                id="more-actions-button"
                aria-controls={
                  !!moreActionsAnchorEl ? "more-actions-menu" : undefined
                }
                aria-haspopup="true"
                aria-expanded={!!moreActionsAnchorEl ? "true" : undefined}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                  setMoreActionsAnchorEl(event.currentTarget)
                }
              >
                <MoreHorizIcon />
              </IconButton>
            </Tooltip>

            <Tooltip
              TransitionProps={{ timeout: 800 }}
              title="Thoát"
              placement="top"
              TransitionComponent={Fade}
              arrow
              onClick={() => {
                dialogProps.onClose?.();
                setEditTask({ ...emptyTask });
                setVoted(false);
                setWatches(false);
                setIsEditingTitle(false);
                setIsEditingContent(false);
                setIsEditingDeadline(false);
                setMoreActionsAnchorEl(null);
                setStatusAnchorEl(null);
                setStatusSelected("");
              }}
            >
              <IconButton>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Body of the dialog */}
        <Box className={classes.dialog_body}>
          {/* Left section of the dialog */}
          <Box className={classes.dialog_body_left}>
            <ClickAwayListener
              onClickAway={async () => {
                if (isEditingTitle && editTask.title.length <= 100) {
                  setIsEditingTitle(false);
                  await updateTask({
                    room_id: currentRoom.id,
                    id: editTask.id,
                    updateData: {
                      status: editTask.status,
                      title: editTask.title,
                    },
                  });
                  setCurrentTask({
                    ...task,
                    title: editTask.title,
                  } as TaskData);
                }
              }}
            >
              {isEditingTitle ? (
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={editTask.title.length > 100}
                  helperText={!editTask.title.length ? "Không hợp lệ" : ""}
                  onChange={(event) => {
                    setEditTask({ ...editTask, title: event.target.value });
                  }}
                  value={editTask.title}
                />
              ) : (
                <Typography
                  variant="h5"
                  onClick={() => setIsEditingTitle(true)}
                  className={classes.edit_field}
                  style={{ padding: "6px 4px", fontWeight: "bold" }}
                >
                  {truncate(editTask.title, 20)}
                </Typography>
              )}
            </ClickAwayListener>

            <Box className={classes.body_actions}>
              <UploadFile
                onSuccess={async (file) => {
                  console.log(file.url);
                  showSnackbarError("Tính năng chưa có sẵn");
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
                    className={classes.body_action}
                  >
                    Đính kèm
                  </Button>
                </Tooltip>
              </UploadFile>

              <Tooltip
                title="Thêm công việc con"
                TransitionProps={{ timeout: 800 }}
                placement="bottom"
                TransitionComponent={Fade}
                arrow
              >
                <Button
                  startIcon={<AccountTreeIcon />}
                  className={classes.body_action}
                  onClick={() => {
                    showSnackbarError("Tính năng chưa có sẵn");
                  }}
                >
                  Thêm việc con
                </Button>
              </Tooltip>

              <Tooltip
                TransitionProps={{ timeout: 800 }}
                title="Liên kết công việc khác"
                placement="bottom"
                TransitionComponent={Fade}
                arrow
              >
                <Button
                  startIcon={<AddLinkIcon />}
                  className={classes.body_action}
                  onClick={() => {
                    showSnackbarError("Tính năng chưa có sẵn");
                  }}
                >
                  Liên kết việc
                </Button>
              </Tooltip>

              <Tooltip
                TransitionProps={{ timeout: 800 }}
                title="Hành động khác"
                placement="bottom"
                TransitionComponent={Fade}
                arrow
              >
                <Button
                  startIcon={<MoreHorizIcon />}
                  className={classes.body_action}
                  onClick={() => {
                    showSnackbarError("Tính năng chưa có sẵn");
                  }}
                >
                  Khác
                </Button>
              </Tooltip>
            </Box>

            <Typography className={classes.field_title}>
              Mô tả công việc:
            </Typography>
            <ClickAwayListener
              onClickAway={async () => {
                if (isEditingContent) {
                  setIsEditingContent(false);
                  await updateTask({
                    room_id: currentRoom.id,
                    id: editTask.id,
                    updateData: {
                      status: editTask.status,
                      content: editTask.content,
                    },
                  });
                  setCurrentTask({
                    ...task,
                    content: editTask.content,
                  } as TaskData);
                }
              }}
            >
              {isEditingContent ? (
                <TextField
                  autoFocus
                  variant="outlined"
                  fullWidth
                  multiline
                  size="small"
                  onChange={(event) => {
                    setEditTask({ ...editTask, content: event.target.value });
                  }}
                  value={editTask.content}
                />
              ) : (
                <Typography
                  onClick={() => setIsEditingContent(true)}
                  className={classes.edit_field}
                  style={{ padding: "6px 0px" }}
                >
                  {editTask.content && editTask.content !== ""
                    ? editTask.content
                    : "Thêm mô tả ..."}
                </Typography>
              )}
            </ClickAwayListener>

            <Divider style={{ margin: "24px 0px 16px" }} />

            <Typography
              className={classes.field_title}
              style={{ marginBottom: "8px" }}
            >
              Bình luận
            </Typography>

            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
              }}
            >
              <Avatar src={user?.avatar} alt="User avatar" />

              <TextField
                type="text"
                placeholder="Thêm bình luận ..."
                fullWidth
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>

          {/* Right section of the dialog */}
          <Box className={classes.dialog_body_right}>
            {/* Status List */}
            <List component="nav">
              <ListItem
                button
                id="status-button"
                aria-haspopup="listbox"
                aria-controls="status-menu"
                aria-expanded={!!statusAnchorEl ? "true" : undefined}
                onClick={(event) => setStatusAnchorEl(event.currentTarget)}
              >
                <ListItemText primary="Trạng thái" secondary={statusSelected} />
                <ExpandMoreIcon />
              </ListItem>
            </List>

            {/* Detail table */}
            <TableContainer component={Paper}>
              <Table style={{ minWidth: 350 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Thông tin chi tiết</b>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  <TableRow>
                    <TableCell className={classes.field_title}>
                      Người đảm nhận:
                    </TableCell>
                    <TableCell>
                      <AssignMemberBox
                        task={editTask}
                        onChoose={async (member) => {
                          await updateTask({
                            room_id: currentRoom.id,
                            id: editTask.id,
                            updateData: {
                              status: editTask.status,
                              assignee_id: member.id,
                            },
                          });
                          setCurrentTask({
                            ...task,
                            assignee_id: member.id,
                          } as TaskData);
                        }}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className={classes.field_title}>
                      Người tạo:
                    </TableCell>
                    <TableCell
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <Avatar
                        src={member.avatar}
                        alt="Avatar of creator"
                        style={{ marginRight: 12 }}
                      />
                      <Typography>
                        {truncate(member.name || "N/A", 26)}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className={classes.field_title}>Nhãn:</TableCell>
                    <TableCell>
                      <TextField
                        type="text"
                        placeholder="Thêm nhãn"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className={classes.field_title}>
                      Ngày tạo:
                    </TableCell>
                    <TableCell>
                      {convertTimeToString(editTask.created_at)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className={classes.field_title}>
                      Ngày đến hạn:
                    </TableCell>
                    <TableCell>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={(task?.deadline as Timestamp) || null}
                          inputFormat={"DD/MM/YYYY"}
                          onChange={async (newValue: Timestamp | null) => {
                            if (
                              !newValue ||
                              String(newValue) === "Invalid Date"
                            ) {
                              return;
                            }
                            setEditTask({
                              ...editTask,
                              deadline: new Timestamp(
                                newValue.toDate().getTime() / 1000,
                                0
                              ),
                            });
                            await updateTask({
                              room_id: currentRoom.id,
                              id: editTask.id,
                              updateData: {
                                status: editTask.status,
                                deadline: new Timestamp(
                                  newValue.toDate().getTime() / 1000,
                                  0
                                ),
                              },
                            });
                          }}
                          onClose={async () => {}}
                          renderInput={({
                            inputRef,
                            inputProps,
                            InputProps,
                          }) => (
                            <ClickAwayListener
                              onClickAway={() => {
                                if (isEditingDeadline) {
                                  setIsEditingDeadline(false);
                                }
                              }}
                            >
                              {isEditingDeadline ? (
                                <Box
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <input ref={inputRef} {...inputProps} />
                                  {InputProps?.endAdornment}
                                </Box>
                              ) : (
                                <Typography
                                  onClick={() => setIsEditingDeadline(true)}
                                  className={classes.edit_field}
                                  style={{
                                    padding: "8px 4px",
                                    color:
                                      TaskHelper.convertDeadline(
                                        editTask.deadline
                                      ) === "Quá hạn"
                                        ? "red"
                                        : "black",
                                  }}
                                >
                                  {TaskHelper.convertDeadline(
                                    editTask.deadline
                                  )}
                                </Typography>
                              )}
                            </ClickAwayListener>
                          )}
                        />
                      </LocalizationProvider>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>

      {/* Menu of header-more-actions-list */}
      <Popover
        id="more-actions-menu"
        anchorEl={moreActionsAnchorEl}
        open={!!moreActionsAnchorEl}
        onClose={() => setMoreActionsAnchorEl(null)}
        aria-labelledby="more-action-button"
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        TransitionComponent={Fade}
        style={{ marginTop: 4 }}
      >
        <MenuItem
          onClick={() => {
            setMoreActionsAnchorEl(null);
            showConfirmDialog({
              title: (
                <Typography variant="h6" style={{ fontWeight: 600 }}>
                  Xóa công việc
                </Typography>
              ),
              content: (
                <Typography>Bạn có chắc xóa công việc này không?</Typography>
              ),
              onConfirm: async () => {
                await deleteTask({
                  room_id: currentRoom.id,
                  id: task?.id || "",
                });
                setCurrentTask(undefined);
                dialogProps.onClose?.();
              },
            });
          }}
          style={{ display: "block", padding: "8px 12px" }}
        >
          Xóa công việc
        </MenuItem>

        <MenuItem
          onClick={() => {
            setMoreActionsAnchorEl(null);
            showSnackbarError("Tính năng chưa có sẵn");
          }}
          style={{ display: "block", padding: "8px 12px" }}
        >
          Nhân bản công việc
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate(`/room/${currentRoom.id}/task/${task?.id || ""}`);
          }}
          style={{ display: "block", padding: "8px 12px" }}
        >
          Xem ở trang khác
        </MenuItem>

        <MenuItem
          onClick={() => {
            setMoreActionsAnchorEl(null);
            showSnackbarError("Tính năng chưa có sẵn");
          }}
          style={{ display: "block", padding: "8px 12px" }}
        >
          In
        </MenuItem>
      </Popover>

      {/* Menu of status-list */}
      <Menu
        id="status-menu"
        anchorEl={statusAnchorEl}
        open={!!statusAnchorEl}
        onClose={() => setStatusAnchorEl(null)}
        MenuListProps={{
          "aria-labelledby": "status-button",
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "center" }}
        TransitionComponent={Fade}
      >
        {taskStatuses
          .map((taskStatus) => taskStatus.name)
          .map((option) => (
            <MenuItem
              selected={option === statusSelected}
              onClick={async () => {
                setStatusSelected(option);
                setStatusAnchorEl(null);
                await updateTask({
                  room_id: currentRoom.id,
                  id: editTask.id,
                  updateData: {
                    status: option,
                  },
                });
              }}
            >
              {option}
            </MenuItem>
          ))}
      </Menu>
    </Dialog>
  );
};

export default TaskDetailDialog;
