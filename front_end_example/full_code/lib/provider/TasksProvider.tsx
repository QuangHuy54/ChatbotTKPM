import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  collectionGroup,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { createContext, useCallback, useContext, useState } from "react";
import TaskData from "../../modules/task/interface/task-data";
import { db } from "../config/firebase-config";
import useAppSnackbar from "../hook/useAppSnackBar";
import FileData from "../interface/file-data";
import CommentData from "../interface/comment-data";
import { useUser } from "./UserProvider";
import TaskHelper from "../../modules/task/util/task-helper";
import TaskStatusData from "../../modules/task/interface/task-status-data";
import { async } from "q";

interface TasksContextProps {
  taskStatuses: TaskStatusData[];
  getTaskStatuses: (payload: { room_id: string }) => Promise<void>;

  updateTaskStatus: (payload: {
    room_id: string;
    task_status_id: string;
    updateData: {
      name?: string;
      order?: number;
    };
  }) => Promise<void>;
  updatingTaskStatus: boolean;

  createTaskStatus: (payload: {
    room_id: string;
    new_task_status: {
      name: string;
      order: number;
    };
  }) => Promise<void>;
  creatingTaskStatus: boolean;

  deleteTaskStatus: (payload: {
    room_id: string;
    task_status_id: string;
  }) => Promise<void>;
  deletingTaskStatus: boolean;

  tasks: TaskData[];
  setTasks: (tasks: TaskData[]) => void;
  getTasks: (payload: { room_id: string; rooms_id?:string[] }) => Promise<void>;

  currentTask?: TaskData;
  setCurrentTask: (task?: TaskData) => void;

  createTask: (payload: {
    room_id: string;
    new_task: {
      title: string;
      assignee_id: string;
      content?: string;
      attach_files?: FileData[];
      comments?: CommentData[];
      status?: string;
      deadline?: Timestamp | Date | string;
    };
  }) => Promise<void>;
  creatingTask: boolean;

  updateTask: (payload: {
    room_id: string;
    id: string;
    updateData: {
      status: string;
      order_value?: string;
      assignee_id?: string;
      deadline?: Timestamp | Date | string;
      content?: string;
      title?: string;
    };
  }) => Promise<void>;
  updatingTask: boolean;

  deleteTask: (payload: { room_id: string; id: string }) => Promise<void>;
  deletingTask: boolean;
}

const TasksContext = createContext<TasksContextProps>({
  taskStatuses: [],
  getTaskStatuses: async () => {},

  updateTaskStatus: async () => {},
  updatingTaskStatus: false,

  createTaskStatus: async () => {},
  creatingTaskStatus: false,

  deleteTaskStatus: async () => {},
  deletingTaskStatus: false,

  tasks: [],
  setTasks: () => {},
  getTasks: async () => {},

  currentTask: {
    id: "",
    title: "",
    order_value: "",
    status: "",
    assignee_id: "",
    creator_id: "",
    created_at: "",
  },
  setCurrentTask: () => {},

  createTask: async () => {},
  creatingTask: false,

  updateTask: async () => {},
  updatingTask: false,

  deleteTask: async () => {},
  deletingTask: false,
});

interface TasksContextProviderProps {
  children: React.ReactNode;
}

const TasksProvider = ({ children }: TasksContextProviderProps) => {
  const [taskStatuses, setTaskStatuses] = useState<TaskStatusData[]>([]);
  const [updatingTaskStatus, setUpdatingTaskStatus] = useState(false);
  const [creatingTaskStatus, setCreatingTaskStatus] = useState(false);
  const [deletingTaskStatus, setDeletingTaskStatus] = useState(false);

  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskData>();
  const [updatingTask, setUpdatingTask] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);

  const { showSnackbarError } = useAppSnackbar();
  const { user } = useUser();

  const getTaskStatuses = useCallback(
    async ({ room_id }: { room_id: string }) => {
      try {
        onSnapshot(
          collection(db, "room", room_id, "task_status"),
          (taskStatusDocs) => {
            setTaskStatuses(
              taskStatusDocs.docs.map(
                (taskStatusDoc) => taskStatusDoc.data() as TaskStatusData
              )
            );
          }
        );
      } catch (error) {
        showSnackbarError(error);
      }
    },
    [showSnackbarError]
  );

  const updateTaskStatus = useCallback(
    async ({
      room_id,
      task_status_id,
      updateData,
    }: {
      room_id: string;
      task_status_id: string;
      updateData: {
        name?: string;
        order?: number;
      };
    }) => {
      try {
        setUpdatingTaskStatus(true);
        await updateDoc(
          doc(db, "room", room_id, "task_status", task_status_id),
          updateData
        );
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setUpdatingTaskStatus(false);
      }
    },
    [showSnackbarError]
  );

  const createTaskStatus = useCallback(
    async ({
      room_id,
      new_task_status,
    }: {
      room_id: string;
      new_task_status: { name: string; order: number };
    }) => {
      try {
        setCreatingTaskStatus(true);

        const docResponse = await addDoc(
          collection(db, "room", room_id, "task_status"),
          new_task_status
        );

        await updateDoc(
          doc(db, "room", room_id, "task_status", docResponse.id),
          {
            task_status_id: docResponse.id,
          }
        );
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setCreatingTaskStatus(false);
      }
    },
    [showSnackbarError]
  );

  const deleteTaskStatus = useCallback(
    async ({
      room_id,
      task_status_id,
    }: {
      room_id: string;
      task_status_id: string;
    }) => {
      try {
        setDeletingTaskStatus(true);

        await deleteDoc(
          doc(db, "room", room_id, "task_status", task_status_id)
        );
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setDeletingTaskStatus(false);
      }
    },
    [showSnackbarError]
  );
  const applyChanges = <S, K extends keyof S>(state : S, changes : Pick<S, K>) : S =>
  Object.assign({}, state, changes);
  const getTasks = useCallback(
    async ({ room_id,rooms_id }: { room_id: string;rooms_id?:string[] }) => {
      try {
        if(rooms_id){
            onSnapshot(query(collectionGroup(db, "task")), (taskDocs) => {
              console.log(taskDocs.docs[0].data())
              setTasks(taskDocs.docs.filter((task)=>rooms_id.includes(task.ref.path.split("/")[1])&&task.data().assignee_id===user?.id).map((taskDoc) => applyChanges(taskDoc.data(),{roomid:taskDoc.ref.path.split("/")[1]}) as TaskData))
            })
        }
        else{
          onSnapshot(collection(db, "room", room_id, "task"), (taskDocs) => {
            setTasks(taskDocs.docs.map((taskDoc) => taskDoc.data() as TaskData));
          });
        }
      } catch (error) {
        showSnackbarError(error);
      }
    },
    [showSnackbarError]
  );

  const createTask = useCallback(
    async ({
      room_id,
      new_task,
    }: {
      room_id: string;
      new_task: {
        title: string;
        assignee_id?: string;
        content?: string;
        deadline?: Timestamp | Date | string;
        attach_files?: FileData[];
        comments?: CommentData[];
        status?: string;
      };
    }) => {
      if (!user?.id) return;
      try {
        setCreatingTask(true);
        const time = Timestamp.now();
        const minOrderTask = tasks.sort((taskA, taskB) =>
          taskA.order_value >= taskB.order_value ? 1 : -1
        )[0];
        const docResponse = await addDoc(
          collection(db, "room", room_id, "task"),
          {
            creator_id: user?.id,
            order_value: TaskHelper.getOrderString(
              "",
              minOrderTask ? minOrderTask.order_value : ""
            ),
            created_at: time,
            last_edit: time,
            ...new_task,
          }
        );
        await updateDoc(doc(db, "room", room_id, "task", docResponse.id), {
          id: docResponse.id,
        });
        // const newTask = {
        //   status: "toDo",
        //   id: docResponse.id,
        //   order_value: TaskHelper.getOrderString(
        //     "",
        //     minOrderTask ? minOrderTask.order_value : ""
        //   ),
        //   creator_id: user?.id,
        //   created_at: time,
        //   last_edit: time,
        //   ...new_task,
        // };

        // if (newTask.assignee_id) {
        //   const memberDocs = await getDocs(
        //     query(
        //       collection(db, "room", room_id, "member"),
        //       where("id", "==", newTask.assignee_id)
        //     )
        //   );

        //   await runTransaction(db, async (transaction) => {
        //     transaction.update(
        //       doc(db, "room", room_id, "member", memberDocs.docs[0].id),
        //       {
        //         [newTask.status]: memberDocs.docs[0].data()[newTask.status] + 1,
        //       }
        //     );
        //   });
        // }

        // setTasks([newTask as TaskData, ...tasks]);
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setCreatingTask(false);
      }
    },
    [showSnackbarError, tasks, user?.id]
  );

  const updateTask = useCallback(
    async ({
      room_id,
      id,
      updateData,
    }: {
      room_id: string;
      id: string;
      updateData: {
        status: string;
        order_value?: string;
        assignee_id?: string;
        deadline?: Timestamp | Date | string;
        content?: string;
        title?: string;
      };
    }) => {
      try {
        const time = Timestamp.now();
        setUpdatingTask(true);

        // const taskBeforeDoc = await getDoc(
        //   doc(db, "room", room_id, "task", id)
        // );

        // if (taskBeforeDoc.data()?.assignee_id) {
        //   const memberHoldTaskDocs = await getDocs(
        //     query(
        //       collection(db, "room", room_id, "member"),
        //       where("id", "==", taskBeforeDoc.data()?.assignee_id)
        //     )
        //   );
        //   if (memberHoldTaskDocs.docs.length > 0) {
        //     await runTransaction(db, async (transaction) => {
        //       transaction.update(
        //         doc(
        //           db,
        //           "room",
        //           room_id,
        //           "member",
        //           memberHoldTaskDocs.docs[0].id
        //         ),
        //         {
        //           [taskBeforeDoc.data()?.status]:
        //             memberHoldTaskDocs.docs[0].data()[
        //               taskBeforeDoc.data()?.status
        //             ] - 1,
        //         }
        //       );
        //     });
        //   }
        // }

        await updateDoc(doc(db, "room", room_id, "task", id), {
          last_edit: time,
          order_value: TaskHelper.getOrderString(
            "",
            tasks
              .filter(
                (task) => task.status === updateData.status && task.id !== id
              )
              .sort((taskA, taskB) =>
                taskA.order_value > taskB.order_value ? -1 : 1
              )[0]?.order_value ?? ""
          ),
          ...updateData,
        });

        // const taskAfter = {
        //   ...taskBeforeDoc.data(),
        //   last_edit: time,
        //   ...updateData,
        // };

        // const memberAssigneeTaskDocs = await getDocs(
        //   query(
        //     collection(db, "room", room_id, "member"),
        //     where(
        //       "id",
        //       "==",
        //       updateData.assignee_id || taskBeforeDoc.data()?.assignee_id
        //     )
        //   )
        // );

        // if (memberAssigneeTaskDocs.docs.length > 0) {
        //   await runTransaction(db, async (transaction) => {
        //     transaction.update(
        //       doc(
        //         db,
        //         "room",
        //         room_id,
        //         "member",
        //         memberAssigneeTaskDocs.docs[0].id
        //       ),
        //       {
        //         [taskAfter.status || "error"]:
        //           memberAssigneeTaskDocs.docs[0].data()[
        //             taskAfter.status || "error"
        //           ] + 1,
        //       }
        //     );
        //   });
        // }
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setUpdatingTask(false);
      }
    },
    [showSnackbarError, tasks]
  );

  const deleteTask = useCallback(
    async ({ room_id, id }: { room_id: string; id: string }) => {
      try {
        setDeletingTask(true);

        // setTasks(tasks.filter((task) => task.id !== id));

        // const taskDoc = await getDoc(doc(db, "room", room_id, "task", id));
        // const memberHoldTaskDocs = await getDocs(
        //   query(
        //     collection(db, "room", room_id, "member"),
        //     where("id", "==", taskDoc.data()?.assignee_id)
        //   )
        // );
        // if (memberHoldTaskDocs.docs.length) {
        //   await runTransaction(db, async (transaction) => {
        //     transaction.update(
        //       doc(db, "room", room_id, "member", memberHoldTaskDocs.docs[0].id),
        //       {
        //         [taskDoc.data()?.status]:
        //           memberHoldTaskDocs.docs[0].data()[taskDoc.data()?.status] - 1,
        //       }
        //     );
        //   });
        // }

        await deleteDoc(doc(db, "room", room_id, "task", id));

        setCurrentTask(undefined);
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setDeletingTask(false);
      }
    },
    [showSnackbarError]
  );

  return (
    <TasksContext.Provider
      value={{
        taskStatuses,
        getTaskStatuses,

        updateTaskStatus,
        updatingTaskStatus,

        createTaskStatus,
        creatingTaskStatus,

        deleteTaskStatus,
        deletingTaskStatus,

        tasks,
        setTasks,
        getTasks,

        currentTask,
        setCurrentTask,

        createTask,
        creatingTask,

        updateTask,
        updatingTask,

        deleteTask,
        deletingTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const store = useContext(TasksContext);
  return store;
};

export default TasksProvider;
