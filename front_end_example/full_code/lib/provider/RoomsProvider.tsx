import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import ROOM_AVATAR_DEFAULT from "../../modules/room/constants/room-avatar-default";
import RoomData from "../../modules/room/interface/room-data";
import { db } from "../config/firebase-config";
import useAppSnackbar from "../hook/useAppSnackBar";
import { useUser } from "./UserProvider";

interface RoomsContextProps {
  rooms: RoomData[];

  currentRoom: RoomData;
  getCurrentRoom: (id: string) => Promise<void>;
  loadingCurrentRoom: boolean;

  getRooms: (payload: {
    getLimit?: number;
    getStart?: number;
  }) => Promise<void>;
  loadingRooms: boolean;
  loadingMoreRooms: boolean;
  loadedAllRooms: boolean;

  createRoom: (newRoom: {
    name: string;
    avatar: string;
    description?: string;
  }) => Promise<void>;
  creatingRoom: boolean;

  updateRoom: (payload: {
    id: string;
    updateData: {
      name?: string;
      avatar?: string;
      description?: string;
      manager_id?: string;
      auto_accepted?: boolean;
      disabled_newsfeed?: boolean;
      locked?: boolean;
      exit_locked?: boolean;
    };
  }) => Promise<void>;
  updatingRoom: boolean;

  joinRoom: (payload: { id: string }) => Promise<void>;
  joiningRoom: boolean;

  deleteRoom: (payload: { id: string }) => Promise<void>;
  deletingRoom: boolean;

  leaveRoom: (payload: { id: string }) => Promise<void>;
  leavingRoom: boolean;
}

const RoomsContext = createContext<RoomsContextProps>({
  rooms: [],

  currentRoom: {
    id: "",
    name: "",
    avatar: "",
    created_at: "",
    manager_id: "",
  },
  getCurrentRoom: async () => {},
  loadingCurrentRoom: false,

  getRooms: async () => {},
  loadingRooms: false,
  loadingMoreRooms: false,
  loadedAllRooms: false,

  createRoom: async () => {},
  creatingRoom: false,

  updateRoom: async () => {},
  updatingRoom: false,

  joinRoom: async () => {},
  joiningRoom: false,

  deleteRoom: async () => {},
  deletingRoom: false,

  leaveRoom: async () => {},
  leavingRoom: false,
});

interface RoomsContextProviderProps {
  children: React.ReactNode;
}

const RoomsProvider = ({ children }: RoomsContextProviderProps) => {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [roomIdDocs, setRoomIdDocs] = useState<any>();
  const [currentRoom, setCurrentRoom] = useState<RoomData>({
    id: "",
    name: "",
    avatar: "",
    created_at: "",
    manager_id: "",
  });
  const [loadingCurrentRoom, setLoadingCurrentRoom] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMoreRooms, setLoadingMoreRooms] = useState(false);
  const [loadedAllRooms, setLoadedAllRooms] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [updatingRoom, setUpdatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [leavingRoom, setLeavingRoom] = useState(false);

  const { showSnackbarError, showSnackbarSuccess } = useAppSnackbar();
  const navigate = useNavigate();
  const { user } = useUser();

  const LIMIT_LOAD_ROOMS_PER_TIME = 8;
  const getRooms = useCallback(
    async ({
      getLimit,
      getStart,
    }: {
      getLimit?: number;
      getStart?: number;
    }) => {
      if (!user) return;

      const _limit = getLimit ?? LIMIT_LOAD_ROOMS_PER_TIME;
      const _skip = typeof getStart === "number" ? getStart : rooms.length;
      if (_skip > 0) {
        setLoadingMoreRooms(true);
      } else {
        setLoadingRooms(true);
      }
      try {
        let newRooms: any[] = [];

        if (_skip === 0) {
          const roomIdDocsResponse = await getDocs(
            query(
              collection(db, "user", user.id, "room"),
              orderBy("joined_at_value", "desc"),
              limit(_limit)
            )
          );
          setRoomIdDocs([...roomIdDocsResponse.docs]);
          const roomsId = roomIdDocsResponse.docs.map((doc) => doc.data().id);
          if (roomsId.length) {
            const roomDocsResponse = await getDocs(
              query(collection(db, "room"), where("id", "in", roomsId))
            );
            newRooms = [
              ...roomsId.map((id) =>
                roomDocsResponse.docs
                  .filter((doc) => doc.data().id === id)[0]
                  .data()
              ),
            ];
          }
        } else {
          const roomIdDocsResponse = await getDocs(
            query(
              collection(db, "user", user.id, "room"),
              orderBy("joined_at_value", "desc"),
              startAfter(roomIdDocs[_skip - 1]),
              limit(_limit)
            )
          );
          setRoomIdDocs([...roomIdDocs, ...roomIdDocsResponse.docs]);
          const roomsId = roomIdDocsResponse.docs.map((doc) => doc.data().id);
          if (roomsId.length) {
            const roomDocsResponse = await getDocs(
              query(collection(db, "room"), where("id", "in", roomsId))
            );
            newRooms = [
              ...roomsId.map((id) =>
                roomDocsResponse.docs
                  .filter((doc) => doc.data().id === id)[0]
                  .data()
              ),
            ];
          }
        }

        if (newRooms.length < _limit) {
          setLoadedAllRooms(true);
        } else {
          setLoadedAllRooms(false);
        }

        if (_skip > 0) {
          setRooms([...rooms, ...newRooms]);
        } else {
          setRooms([...newRooms]);
        }
      } catch (error) {
        showSnackbarError(error);
      } finally {
        if (_skip > 0) {
          setLoadingMoreRooms(false);
        } else {
          setLoadingRooms(false);
        }
      }
    },
    [roomIdDocs, rooms, showSnackbarError, user]
  );

  const getCurrentRoom = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        setLoadingCurrentRoom(true);
        const checkDocsResponse = await getDocs(
          query(collection(db, "user", user.id, "room"), where("id", "==", id))
        );
        if (!checkDocsResponse.docs.length) {
          showSnackbarError("Bạn không thuộc phòng ban này");
          navigate("/room");
          setLoadingCurrentRoom(false);
          return;
        }

        const roomDocResponse = await getDoc(doc(db, "room", id));

        if (!roomDocResponse.data()) {
          const docsResponse = await getDocs(
            query(
              collection(db, "user", user.id, "room"),
              where("id", "==", id)
            )
          );
          await deleteDoc(
            doc(db, "user", user?.id, "room", docsResponse.docs[0].id)
          );

          setRooms(rooms.filter((room) => room.id !== id));
          showSnackbarError("Phòng ban đã bị xoá");
          navigate("/room");
          return;
        }

        setCurrentRoom(roomDocResponse.data() as RoomData);
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setLoadingCurrentRoom(false);
      }
    },
    [navigate, rooms, showSnackbarError, user]
  );

  const createRoom = useCallback(
    async (newRoom: {
      name?: string;
      description?: string;
      avatar?: string;
    }) => {
      if (!user) return;

      setCreatingRoom(true);
      try {
        const time = Timestamp.now();
        const docResponse = await addDoc(collection(db, "room"), {
          created_at: time,
          manager_id: user?.id,
          avatar: ROOM_AVATAR_DEFAULT,
          ...newRoom,
        });
        await updateDoc(doc(db, "room", docResponse.id), {
          id: docResponse.id,
        });
        await addDoc(collection(db, "user", user.id, "room"), {
          joined_at_value: time.toMillis(),
          joined_at: time,
          id: docResponse.id,
        });
        await addDoc(collection(db, "room", docResponse.id, "member"), {
          id: user.id,
          joined_at: time,
          joined_at_value: time.toMillis(),
        });

        setRooms([
          {
            created_at: time,
            manager_id: user.id,
            avatar: ROOM_AVATAR_DEFAULT,
            id: docResponse.id,
            ...newRoom,
          } as RoomData,
          ...rooms,
        ]);
        setRoomIdDocs([...roomIdDocs, docResponse]);
        showSnackbarSuccess("Tạo phòng ban thành công");
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setCreatingRoom(false);
      }
    },
    [roomIdDocs, rooms, showSnackbarError, showSnackbarSuccess, user]
  );

  const updateRoom = useCallback(
    async ({
      id,
      updateData,
    }: {
      id: string;
      updateData: {
        name?: string;
        avatar?: string;
        description?: string;
        manager_id?: string;
        auto_accepted?: boolean;
        disabled_newsfeed?: boolean;
        locked?: boolean;
        exit_locked?: boolean;
      };
    }) => {
      setUpdatingRoom(true);
      try {
        await updateDoc(doc(db, "room", id), updateData);

        setRooms(
          rooms.map((room) => {
            if (room.id === id) {
              return {
                ...room,
                ...updateData,
              };
            }
            return room;
          })
        );

        setCurrentRoom({ ...currentRoom, ...updateData });
        showSnackbarSuccess("Cập nhật tùy chỉnh phòng ban thành công.");
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setUpdatingRoom(false);
      }
    },
    [rooms, currentRoom, showSnackbarSuccess, showSnackbarError]
  );

  const joinRoom = useCallback(
    async ({ id }: { id: string }) => {
      if (!user) return;

      setJoiningRoom(true);
      try {
        const docResponse = await getDoc(doc(db, "room", id));

        const newRoom = docResponse.data() as RoomData;
        if (!newRoom) {
          throw "Phòng ban không tồn tại";
        }
        const roomDocsResponse = await getDocs(
          query(collection(db, "user", user.id, "room"), where("id", "==", id))
        );
        if (roomDocsResponse.docs.length > 0) {
          throw "Bạn đã tham gia phòng này rồi";
        }
        const time = Timestamp.now();
        await addDoc(collection(db, "user", user.id, "room"), {
          joined_at_value: time.toMillis(),
          joined_at: time,
          id: newRoom.id,
        });
        await addDoc(collection(db, "room", id, "member"), {
          id: user.id,
          joined_at: time,
          joined_at_value: time.toMillis(),
        });

        setRooms([{ ...newRoom, joined_at: time } as RoomData, ...rooms]);
        setRoomIdDocs([...roomIdDocs, docResponse]);
        showSnackbarSuccess("Tham gia phòng ban thành công");
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setJoiningRoom(false);
      }
    },
    [roomIdDocs, rooms, showSnackbarError, showSnackbarSuccess, user]
  );

  const deleteRoom = useCallback(
    async ({ id }: { id: string }) => {
      if (!user) return;

      setDeletingRoom(true);
      try {
        await deleteDoc(doc(db, "room", id));
        const docsResponse = await getDocs(
          query(collection(db, "user", user.id, "room"), where("id", "==", id))
        );
        await deleteDoc(
          doc(db, "user", user.id, "room", docsResponse.docs[0].id)
        );

        setRooms(rooms.filter((room) => room?.id !== id));
        setRoomIdDocs(roomIdDocs.filter((doc: any) => doc.data?.id !== id));
        navigate("/room");
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setDeletingRoom(false);
      }
    },
    [roomIdDocs, rooms, showSnackbarError, user]
  );

  const leaveRoom = useCallback(
    async ({ id }: { id: string }) => {
      if (!user?.id) return;

      try {
        setLeavingRoom(true);
        const docsResponse = await getDocs(
          query(collection(db, "user", user?.id, "room"), where("id", "==", id))
        );
        await deleteDoc(
          doc(db, "user", user?.id, "room", docsResponse.docs[0].id)
        );

        const memberDocsResponse = await getDocs(
          query(
            collection(db, "room", id, "member"),
            where("id", "==", user.id)
          )
        );
        await deleteDoc(
          doc(db, "room", id, "member", memberDocsResponse.docs[0].id)
        );

        setRooms(rooms.filter((room) => room.id !== id));
        setRoomIdDocs(roomIdDocs.filter((doc: any) => doc.data.id !== id));
        navigate("/room");
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setLeavingRoom(false);
      }
    },
    [roomIdDocs, rooms, showSnackbarError, user]
  );

  return (
    <RoomsContext.Provider
      value={{
        rooms,

        currentRoom,
        getCurrentRoom,
        loadingCurrentRoom,

        getRooms,
        loadingRooms,
        loadingMoreRooms,
        loadedAllRooms,

        createRoom,
        creatingRoom,

        updateRoom,
        updatingRoom,

        joinRoom,
        joiningRoom,

        deleteRoom,
        deletingRoom,

        leaveRoom,
        leavingRoom,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
};

export const useRooms = () => {
  const store = useContext(RoomsContext);
  return store;
};

export default RoomsProvider;
