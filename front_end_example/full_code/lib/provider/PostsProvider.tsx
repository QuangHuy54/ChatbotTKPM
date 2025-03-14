import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React, { createContext, useCallback, useContext, useState } from "react";
import PostData from "../../modules/post/interface/post-data";
import { db } from "../config/firebase-config";
import useAppSnackbar from "../hook/useAppSnackBar";
import { useUser } from "./UserProvider";

interface PostsContextProps {
  posts: PostData[];

  getPosts: (payload: {
    room_id: string;
    getStart?: number;
    getLimit?: number;
  }) => Promise<void>;
  loadingPosts: boolean;
  loadingMorePosts: boolean;
  loadedAllPosts: boolean;

  currentPost?: PostData;
  setCurrentPost: (post?: PostData) => void;

  createPost: (payload: {
    room_id: string;
    new_post: {
      content?: string;
      image?: string;
    };
  }) => Promise<void>;
  creatingPost: boolean;

  updatePost: (payload: {
    room_id: string;
    id: string;
    update_data: {
      content?: string;
      image?: string;
    };
  }) => Promise<void>;
  updatingPost: boolean;

  deletePost: (payload: { room_id: string; id: string }) => Promise<void>;
  deletingPost: boolean;
}

const PostsContext = createContext<PostsContextProps>({
  posts: [],

  getPosts: async () => {},
  loadingPosts: false,
  loadingMorePosts: false,
  loadedAllPosts: false,

  currentPost: {
    id: "",
    creator_id: "",
    created_at: "",
    content: "",
    last_edit: "",
  },
  setCurrentPost: () => {},

  createPost: async () => {},
  creatingPost: false,

  updatePost: async () => {},
  updatingPost: false,

  deletePost: async () => {},
  deletingPost: false,
});

interface PostsContextProviderProps {
  children: React.ReactNode;
}

const PostsProvider = ({ children }: PostsContextProviderProps) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [postDocs, setPostDocs] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [loadedAllPosts, setLoadedAllPosts] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [updatingPost, setUpdatingPost] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [currentPost, setCurrentPost] = useState<PostData>();
  const { showSnackbarError } = useAppSnackbar();
  const { user } = useUser();

  const LIMIT_LOAD_POST_PER_TIME = 5;
  const getPosts = useCallback(
    async ({
      room_id,
      getStart,
      getLimit,
    }: {
      room_id: string;
      getStart?: number;
      getLimit?: number;
    }) => {
      const _limit = getLimit ?? LIMIT_LOAD_POST_PER_TIME;
      const _skip = typeof getStart === "number" ? getStart : posts.length;
      if (_skip > 0) {
        setLoadingMorePosts(true);
      } else {
        setLoadingPosts(true);
      }
      try {
        let newPosts: any[] = [];

        if (_skip === 0) {
          const postDocsResponse = await getDocs(
            query(
              collection(db, "room", room_id, "post"),
              orderBy("created_at_value", "desc"),
              limit(_limit)
            )
          );
          setPostDocs([...postDocsResponse.docs]);
          newPosts = postDocsResponse.docs.map((doc) => doc.data());
        } else {
          const postDocsResponse = await getDocs(
            query(
              collection(db, "room", room_id, "post"),
              orderBy("created_at_value", "desc"),
              startAfter(postDocs[_skip - 1]),
              limit(_limit)
            )
          );
          setPostDocs([...postDocs, ...postDocsResponse.docs]);
          newPosts = postDocsResponse.docs.map((doc) => doc.data());
        }

        if (newPosts.length < _limit) {
          setLoadedAllPosts(true);
        } else {
          setLoadedAllPosts(false);
        }

        if (_skip > 0) {
          setPosts([...newPosts, ...posts]);
        } else {
          setPosts([...newPosts]);
        }
      } catch (error) {
        showSnackbarError(error);
      } finally {
        if (_skip > 0) {
          setLoadingMorePosts(false);
        } else {
          setLoadingPosts(false);
        }
      }
    },
    [postDocs, posts, showSnackbarError]
  );

  const createPost = useCallback(
    async ({
      room_id,
      new_post,
    }: {
      room_id: string;
      new_post: {
        content?: string;
        image?: string;
      };
    }) => {
      if (!user) return;
      try {
        setCreatingPost(true);
        const time = Timestamp.now();

        const docResponse = await addDoc(
          collection(db, "room", room_id, "post"),
          {
            created_at: time,
            created_at_value: time.seconds + 0.000000001 * time.nanoseconds,
            last_edit: time,
            creator_id: user.id,
            content: "",
            ...new_post,
          }
        );
        await updateDoc(doc(db, "room", room_id, "post", docResponse.id), {
          id: docResponse.id,
        });

        setPosts([
          {
            id: docResponse.id as string,
            created_at: time,
            last_edit: time,
            creator_id: user.id,
            content: "",
            ...new_post,
          },
          ...posts,
        ]);
        setPostDocs([...postDocs, docResponse]);
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setCreatingPost(false);
      }
    },
    [postDocs, posts, showSnackbarError, user]
  );

  const updatePost = useCallback(
    async ({
      room_id,
      id,
      update_data,
    }: {
      room_id: string;
      id: string;
      update_data: {
        content?: string;
        image?: string;
      };
    }) => {
      try {
        setUpdatingPost(true);

        await updateDoc(doc(db, "room", room_id, "post", id), {
          last_edit: Timestamp.now(),
          ...update_data,
        });

        setPosts(
          posts.map((post) => {
            if (post?.id === id) {
              return {
                ...post,
                ...update_data,
                last_edit: Timestamp.now(),
              };
            }

            return post;
          })
        );
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setUpdatingPost(false);
      }
    },
    [posts]
  );

  const deletePost = useCallback(
    async ({ room_id, id }: { room_id: string; id: string }) => {
      try {
        setDeletingPost(true);

        await deleteDoc(doc(db, "room", room_id, "post", id));
        setCurrentPost({} as PostData);
        setPosts(posts.filter((post) => post.id !== id));
        setPostDocs(postDocs.filter((postDoc) => postDoc?.data?.id !== id));
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setDeletingPost(false);
      }
    },
    [postDocs, posts, showSnackbarError]
  );

  return (
    <PostsContext.Provider
      value={{
        posts,

        getPosts,
        loadingPosts,
        loadingMorePosts,
        loadedAllPosts,

        currentPost,
        setCurrentPost,

        createPost,
        creatingPost,

        updatePost,
        updatingPost,

        deletePost,
        deletingPost,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const store = useContext(PostsContext);
  return store;
};

export default PostsProvider;
