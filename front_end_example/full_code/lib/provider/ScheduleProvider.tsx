import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useAppSnackbar from "../hook/useAppSnackBar";
import TaskData from "../../modules/task/interface/task-data";
import { useUser } from "./UserProvider";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { db } from "../config/firebase-config";

interface ScheduleContextProps {
  userTasks: TaskData[];
  getUserTasks: () => Promise<void>;
  loadingUserTasks: boolean;
}

const ScheduleContext = createContext<ScheduleContextProps>({
  //init value
  userTasks: [],
  getUserTasks: async () => {},
  loadingUserTasks: false,
});

interface ScheduleContextProviderProps {
  children: React.ReactNode;
}

const ScheduleProvider = ({ children }: ScheduleContextProviderProps) => {
  //state
  const [userTasks, setUserTasks] = useState<TaskData[]>([]);
  const [loadingUserTasks, setLoadingUserTasks] = useState(false);

  //
  const { showSnackbarError } = useAppSnackbar();
  const { user } = useUser();

  //function
  const getUserTasks = useCallback(async () => {
    try {
      setLoadingUserTasks(true);
      const roomDocsResponse = await getDocs(
        collection(db, "user", user?.id || "", "room")
      );

      await Promise.all(
        roomDocsResponse.docs
          .map((roomDoc) => async () => {
            const tasksResponse = await getDocs(
              query(
                collection(db, "room", roomDoc.data().id, "task"),
                where("assignee_id", "==", user?.id)
              )
            );
            setUserTasks([
              ...userTasks,
              ...tasksResponse.docs.map(
                (taskDoc) => taskDoc.data() as TaskData
              ),
            ]);
          })
          .map((promiseFunction) => promiseFunction())
      );
    } catch (error) {
      showSnackbarError(error);
    } finally {
      setLoadingUserTasks(false);
    }
  }, [showSnackbarError, user?.id, userTasks]);

  return (
    <ScheduleContext.Provider
      value={{
        userTasks,
        getUserTasks,
        loadingUserTasks,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const store = useContext(ScheduleContext);
  return store;
};

export default ScheduleProvider;
