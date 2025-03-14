import { Timestamp } from "firebase/firestore";
import CommentData from "../../../lib/interface/comment-data";
import FileData from "../../../lib/interface/file-data";

interface TaskDataDeadline {
  id: string;
  title: string;
  content?: string;
  attach_files?: FileData[];
  status: string;
  order_value: string;
  assignee_id: string;
  creator_id: string;
  created_at: Timestamp | Date | string;
  deadline: Timestamp;
  last_edit?: Timestamp;
  roomid?: string;
  comments?: CommentData[];
}

export default TaskDataDeadline;
