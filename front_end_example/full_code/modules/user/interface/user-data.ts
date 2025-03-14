import { Timestamp } from "firebase/firestore";

interface UserData {
  auth_id: string;
  id: string;
  email: string;
  avatar: string;
  name: string;
  created_at: Timestamp | string | Date;
}

export default UserData;
