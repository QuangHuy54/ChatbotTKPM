import CommentData from "../../../lib/interface/comment-data";
import FileData from "../../../lib/interface/file-data";
import TaskData from "./task-data";
interface TaskListData {
  id: string;
  taskList: TaskData[];
}

export default TaskListData;
