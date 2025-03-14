import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { db } from "../config/firebase-config";
import useAppSnackbar from "../hook/useAppSnackBar";
import UserData from "../../modules/user/interface/user-data";
import { useAuth } from "./AuthProvider";
import { useLocation } from "react-router-dom";

interface UserContextProps {
  user?: UserData;
  loadingUser: boolean;

  editUser: ({
    id,
    fields,
  }: {
    id: string;
    fields: { name?: string; avatar?: string };
  }) => Promise<void>;
  editingUser: boolean;
}

const UserContext = createContext<UserContextProps>({
  user: undefined,

  loadingUser: false,

  editUser: async () => {},
  editingUser: false,
});

interface UserContextProviderProps {
  children: React.ReactNode;
}

const UserProvider = ({ children }: UserContextProviderProps) => {
  const [user, setUser] = useState<UserData>();
  const [loadingUser, setLoadingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(false);

  const { showSnackbarError } = useAppSnackbar();
  const { userInfo, userInfoRegister } = useAuth();
  const location = useLocation();
  const needAuth = ![
    "/login",
    "/register",
    "/forgot-password",
    "/home",
    "/",
  ].some((route) => route === location.pathname);

  const getUser = useCallback(async () => {
    try {
      setLoadingUser(true);

      const usersResponse = await getDocs(
        query(collection(db, "user"), where("auth_id", "==", userInfo?.uid))
      );

      usersResponse.forEach((userResponse) => {
        setUser(userResponse.data() as UserData);
      });
    } catch (error) {
      showSnackbarError(error);
    } finally {
      setLoadingUser(false);
    }
  }, [showSnackbarError, userInfo, userInfoRegister]);

  const editUser = useCallback(
    async ({
      id,
      fields,
    }: {
      id: string;
      fields: { name?: string; avatar?: string };
    }) => {
      try {
        setEditingUser(true);

        const docsResponse = await getDocs(
          query(collection(db, "user"), where("id", "==", id))
        );
        docsResponse.forEach(async (doc) => {
          await updateDoc(doc.ref, fields);
        });

        setUser({ ...user, ...fields } as UserData);
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setEditingUser(false);
      }
    },
    [showSnackbarError, user]
  );

  useEffect(() => {
    if (userInfo) {
      getUser();
    } else {
      setUser(undefined);
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfoRegister) {
      setUser({ ...userInfoRegister });
    }
  }, [userInfoRegister]);

  return (
    <UserContext.Provider
      value={{
        user,
        loadingUser,

        editUser,
        editingUser,
      }}
    >
      {(!needAuth || user) && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const store = useContext(UserContext);
  return store;
};

export default UserProvider;
