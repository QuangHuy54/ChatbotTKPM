import UserData from "../interface/user-data";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../lib/config/firebase-config";

const UserHelper = {
  getUserById: async (id: string): Promise<undefined | UserData> => {
    let result;
    const usersResponse = await getDocs(
      query(collection(db, "user"), where("id", "==", id))
    );
    usersResponse.forEach((userResponse) => {
      result = userResponse.data();
    });
    return result;
  },
};

export default UserHelper;
