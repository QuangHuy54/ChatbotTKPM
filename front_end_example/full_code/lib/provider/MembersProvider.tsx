import React, { createContext, useCallback, useContext, useState } from "react";
import useAppSnackbar from "../hook/useAppSnackBar";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase-config";
import MemberData from "../../modules/member/interface/member-data";
import UserData from "../../modules/user/interface/user-data";

interface MembersContextProps {
  members: MemberData[];

  getMembers: (payload: {
    room_id: string;
    getStart?: number;
    getLimit?: number;
  }) => Promise<void>;
  loadingMembers: boolean;
  loadingMoreMembers: boolean;
  loadedAllMembers: boolean;

  member: MemberData & UserData;
  getMember: (payload: { room_id: string; member_id: string }) => Promise<void>;
  loadingMember: boolean;

  removeMember: (payload: {
    room_id: string;
    member_id: string;
  }) => Promise<void>;
  removingMember: boolean;
}

const MembersContext = createContext<MembersContextProps>({
  members: [],

  getMembers: async () => {},
  loadingMembers: false,
  loadingMoreMembers: false,
  loadedAllMembers: false,

  member: {
    id: "",
    name: "",
    avatar: "",
    joined_at: "",
    email: "",
    created_at: "",
    auth_id: "",
  },
  getMember: async () => {},
  loadingMember: false,

  removeMember: async () => {},
  removingMember: false,
});

interface MembersContextProviderProps {
  children: React.ReactNode;
}

const MembersProvider = ({ children }: MembersContextProviderProps) => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [member, setMember] = useState<MemberData & UserData>({
    id: "",
    name: "",
    avatar: "",
    joined_at: "",
    auth_id: "",
    email: "",
    created_at: "",
  });

  const [memberDocs, setMemberDocs] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingMoreMembers, setLoadingMoreMembers] = useState(false);
  const [loadedAllMembers, setLoadedAllMembers] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);

  const { showSnackbarError } = useAppSnackbar();

  const LIMIT_LOAD_MEMBERS_PER_TIME = 10;
  const getMembers = useCallback(
    async ({
      room_id,
      getLimit,
      getStart,
    }: {
      room_id: string;
      getLimit?: number;
      getStart?: number;
    }) => {
      const _limit = getLimit ?? LIMIT_LOAD_MEMBERS_PER_TIME;
      const _skip = typeof getStart === "number" ? getStart : members.length;
      if (_skip > 0) {
        setLoadingMoreMembers(true);
      } else {
        setLoadingMembers(true);
      }
      try {
        let newMembers: any[] = [];

        if (_skip === 0) {
          const memberDocsResponse = await getDocs(
            query(
              collection(db, "room", room_id, "member"),
              orderBy("joined_at_value", "desc"),
              limit(_limit)
            )
          );
          setMemberDocs([...memberDocsResponse.docs]);
          const joinMembers = memberDocsResponse.docs.map((doc) => {
            return {
              id: doc.data().id,
              joined_at: doc.data().joined_at,
            };
          });
          if (joinMembers.length) {
            const memberDocsResponse = await getDocs(
              query(
                collection(db, "user"),
                where(
                  "id",
                  "in",
                  joinMembers.map((member) => member.id)
                )
              )
            );
            newMembers = [
              ...memberDocsResponse.docs.map((doc) => {
                return {
                  name: doc.data().name,
                  avatar: doc.data().avatar,
                  email: doc.data().email,
                  ...joinMembers.find((member) => member.id === doc.data().id),
                };
              }),
            ];
          }
        } else {
          const memberDocsResponse = await getDocs(
            query(
              collection(db, "room", room_id, "member"),
              orderBy("joined_at_value", "desc"),
              startAfter(memberDocs[_skip - 1]),
              limit(_limit)
            )
          );
          setMemberDocs([...memberDocs, ...memberDocsResponse.docs]);
          const joinMembers = memberDocsResponse.docs.map((doc) => {
            return {
              id: doc.data().id,
              joined_at: doc.data().joined_at,
            };
          });
          if (joinMembers.length) {
            const memberDocsResponse = await getDocs(
              query(
                collection(db, "user"),
                where(
                  "id",
                  "in",
                  joinMembers.map((member) => member.id)
                )
              )
            );
            newMembers = [
              ...memberDocsResponse.docs.map((doc) => {
                return {
                  name: doc.data().name,
                  avatar: doc.data().avatar,
                  email: doc.data().email,
                  ...joinMembers.find((member) => member.id === doc.data().id),
                };
              }),
            ];
          }
        }

        if (newMembers.length < _limit) {
          setLoadedAllMembers(true);
        } else {
          setLoadedAllMembers(false);
        }

        if (_skip > 0) {
          setMembers([...newMembers, ...members]);
        } else {
          setMembers([...newMembers]);
        }
      } catch (error) {
        showSnackbarError(error);
      } finally {
        if (_skip > 0) {
          setLoadingMoreMembers(false);
        } else {
          setLoadingMembers(false);
        }
      }
    },
    [memberDocs, members, showSnackbarError]
  );

  const getMember = useCallback(
    async ({ room_id, member_id }: { room_id: string; member_id: string }) => {
      try {
        setLoadingMember(true);

        const joinMembersDocs = await getDocs(
          query(
            collection(db, "room", room_id, "member"),
            where("id", "==", member_id)
          )
        );
        const memberInfoDoc = await getDoc(doc(db, "user", member_id));

        setMember({
          ...joinMembersDocs.docs[0].data(),
          ...memberInfoDoc.data(),
        } as MemberData & UserData);
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setLoadingMember(false);
      }
    },
    [showSnackbarError]
  );

  const removeMember = useCallback(
    async ({ member_id, room_id }: { member_id: string; room_id: string }) => {
      try {
        setRemovingMember(true);
        const docsResponse = await getDocs(
          query(
            collection(db, "user", member_id, "room"),
            where("id", "==", room_id)
          )
        );
        await deleteDoc(
          doc(db, "user", member_id, "room", docsResponse.docs[0].id)
        );

        const memberDocsResponse = await getDocs(
          query(
            collection(db, "room", room_id, "member"),
            where("id", "==", member_id)
          )
        );
        await deleteDoc(
          doc(db, "room", room_id, "member", memberDocsResponse.docs[0].id)
        );

        setMembers(members.filter((member) => member.id !== member_id));
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setRemovingMember(false);
      }
    },
    [members, showSnackbarError]
  );

  return (
    <MembersContext.Provider
      value={{
        members,

        getMembers,
        loadingMembers,
        loadingMoreMembers,
        loadedAllMembers,

        member,
        getMember,
        loadingMember,

        removeMember,
        removingMember,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => {
  const store = useContext(MembersContext);
  return store;
};

export default MembersProvider;
