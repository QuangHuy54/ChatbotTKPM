import { Timestamp } from "firebase/firestore";
import CommentData from "../../../lib/interface/comment-data";

interface PostData{
  id: string;
  creator_id: string;
  created_at: Timestamp | string | Date;
  content: string;
  image?: string;
  last_edit: Timestamp | string | Date;
  comments?: CommentData[];
}

export default PostData;