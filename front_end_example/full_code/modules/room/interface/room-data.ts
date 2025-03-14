import { Timestamp } from "firebase/firestore";

interface RoomData {
  id: string;
  avatar: string;
  name: string;
  created_at: Timestamp | Date | string;
  description?: string;
  manager_id: string;
  auto_accepted?: boolean;
  disabled_newsfeed?: boolean;
  locked?: boolean;
  exit_locked?: boolean;
}

export default RoomData;
