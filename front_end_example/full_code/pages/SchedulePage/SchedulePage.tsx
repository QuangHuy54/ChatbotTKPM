import React, {
  Fragment,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";

import {
  Box,
  Button,
  Menu,
  MenuItem,
  TextField,
  Divider,
  IconButton,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { Navigate } from "react-router";
import TaskData from "../../modules/task/interface/task-data";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { BiFilterAlt } from "react-icons/bi";
import { ImSortAlphaAsc, ImSortAlphaDesc } from "react-icons/im";
import SearchIcon from "@mui/icons-material/Search";
import RoomData from "../../modules/room/interface/room-data";
import { useRooms } from "../../lib/provider/RoomsProvider";
import RoomItem from "../../modules/room/components/RoomItem/RoomItem";
import AddRoomButton from "../../modules/room/components/AddRoomButton/AddRoomButton";
import TaskDataDeadline from "../../modules/task/interface/task-data-deadline";
import {
  Calendar,
  momentLocalizer,
  DateLocalizer,
  Views,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { useTasks } from "../../lib/provider/TasksProvider";
import { unionTypeAnnotation } from "@babel/types";
import { Timestamp } from "@firebase/firestore";
import { useSchedule } from "../../lib/provider/ScheduleProvider";
interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

type SomeAreRequired<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;
type TaskWithDeadline = SomeAreRequired<TaskData, "deadline">;
const localizer = momentLocalizer(moment); 
const DragAndDropCalendar = withDragAndDrop(Calendar);
const SchedulePage = () => {
  const [myEvents, setMyEvents] = useState<any[]>([]);
  let navigate = useNavigate();
  const handleSelectEvent = useCallback(
    (event) => navigate("/room/" + event.roomid + "/work"),
    []
  );
  const { rooms, getRooms, loadingRooms, loadingMoreRooms, loadedAllRooms } =
    useRooms();
  const {userTasks,getUserTasks}=useSchedule();
  const [TotalTasks, setTotalTasks] = useState<TaskData[]>([]);
  const { tasks, getTasks } = useTasks();
  useEffect(() => {
    getRooms({ getStart: 0 });
  }, []);
  useEffect(() => {
    setTotalTasks([...TotalTasks, ...tasks]);
  }, [tasks]);
  useEffect(() => {
    if (rooms) {
      getTasks({ room_id:"",rooms_id: rooms.map(x=>x.id) });
    }//
  }, [rooms]);
  useEffect(() => {
    console.log(tasks)
    const ids = tasks.map(({ id }) => id);
    setMyEvents(
      tasks.filter((task): task is TaskDataDeadline => !!task.deadline)
        //.filter(({ id }, index) => !ids.includes(id, index + 1))
        .map((task) => ({
          id: task.id,
          roomid: task.roomid,
          title: task.title,
          start: task.deadline.toDate(),
          allDay: true,
          end: task.deadline.toDate(),
        }))
    );
  }, [tasks]);
  useEffect(() => {
    console.log(myEvents)
  }, [myEvents]);
  return (
    <Fragment>
      <Calendar
        localizer={localizer}
        events={myEvents}
        onSelectEvent={handleSelectEvent}
        views={['month']}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, padding: 5 }}
      />
    </Fragment>
  );
};

export default SchedulePage;
