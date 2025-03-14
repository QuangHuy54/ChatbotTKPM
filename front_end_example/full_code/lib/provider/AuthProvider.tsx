import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import useAppSnackbar from "../hook/useAppSnackBar";
import {
  addDoc,
  collection,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase-config";
import USER_AVATAR_DEFAULT from "../../modules/user/contants/user-avatar-default";
import UserData from "../../modules/user/interface/user-data";

interface AuthContextProps {
  checkingAuth: boolean;

  userInfo: User | null;
  register: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<void>;
  logIn: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<void>;
  logging: boolean;
  logOut: () => Promise<void>;
  loggingOut: boolean;

  userInfoRegister?: UserData;
}

const AuthContext = createContext<AuthContextProps>({
  checkingAuth: true,

  userInfo: null,
  register: async () => {},
  logIn: async () => {},
  logging: false,
  logOut: async () => {},
  loggingOut: false,

  userInfoRegister: undefined,
});

interface AuthContextProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthContextProviderProps) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [logging, setLogging] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [userInfoRegister, setUserInfoRegister] = useState<UserData>();

  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const { showSnackbarError } = useAppSnackbar();

  const needAuth = ![
    "/login",
    "/register",
    "/forgot-password",
    "/home",
    "/",
  ].some((route) => route === location.pathname);

  const register = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        const authReponse = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const time = Timestamp.now();

        const response = await addDoc(collection(db, "user"), {
          name: email,
          email: email,
          avatar: USER_AVATAR_DEFAULT,
          created_at: time,
        });

        await updateDoc(doc(db, "user", response.id), {
          id: response.id,
          auth_id: authReponse.user.uid,
        });
        setUserInfoRegister({
          id: response.id,
          auth_id: authReponse.user.uid,
          name: email,
          email: email,
          avatar: USER_AVATAR_DEFAULT,
          created_at: time,
        });
      } catch (error) {
        if (String(error).includes("email-already-in-use")) {
          throw "Email đã tồn tại";
        } else if (
          String(error).includes("Password should be at least 6 characters")
        ) {
          throw "Mật khẩu phải có ít nhất 6 kí tự";
        } else {
          throw error;
        }
      }
    },
    [auth, showSnackbarError]
  );

  const logIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        setLogging(true);
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        if (String(error).includes("user-not-found")) {
          throw "Tài khoản không tồn tại";
        } else if (String(error).includes("auth/wrong-password")) {
          throw "Sai mật khẩu";
        } else {
          throw error;
        }
      } finally {
        setLogging(false);
      }
    },
    [auth, showSnackbarError]
  );

  const logOut = useCallback(async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
    } catch (error) {
      showSnackbarError(error);
    } finally {
      setLoggingOut(false);
    }
  }, [auth, showSnackbarError]);

  useEffect(() => {
    const authCheck = onAuthStateChanged(auth, (user) => {
      setUserInfo(user);
      if (user) {
        setCheckingAuth(false);
        if (!needAuth) {
          navigate("/room");
        }
      } else {
        if (needAuth) {
          navigate("/login");
        }
      }
    });

    return authCheck;
  }, []);

  if (checkingAuth && needAuth)
    return (
      <Box className="w100 h100 df aic jcc">
        <Typography>Loading...</Typography>
      </Box>
    );

  return (
    <AuthContext.Provider
      value={{
        checkingAuth,

        userInfo,
        register,

        logIn,
        logging,

        logOut,
        loggingOut,

        userInfoRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const store = useContext(AuthContext);
  return store;
};

export default AuthProvider;
