import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  BoxProps,
  IconButton,
  Avatar,
  TextField,
  InputBase,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import UserHelper from "../../../user/util/user-helper";
import UserData from "../../../user/interface/user-data";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";
import USER_AVATAR_DEFAULT from "../../../user/contants/user-avatar-default";
import convertTimeToString from "../../../../lib/util/convert-time-to-string";
import { useParams } from "react-router-dom";
import PostData from "../../interface/post-data";
import PostCardMenu from "../PostCardMenu/PostCardMenu";
import Comment from "../Comment/Comment";
import CommentIcon from "@mui/icons-material/Comment";
import CreatePostComment from "../CreatePostComment/CreatePostComment";
import CommentData from "../../../../lib/interface/comment-data";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../../../../lib/config/firebase-config";

interface PostCardProps {
  post: PostData;
}

const PostCard = ({ post }: PostCardProps) => {
  const [user, setUser] = useState<undefined | UserData>(undefined);
  const [postComments, setPostComments] = useState<CommentData[]>([]);
  const [showComments, setShowComments] = useState(false);

  const { showSnackbarError } = useAppSnackbar();
  const { roomId } = useParams();

  const getUserData = async (id?: string) => {
    try {
      setUser(await UserHelper.getUserById(id || ""));
    } catch (error) {
      showSnackbarError(error);
    }
  };

  const getPostComments = useCallback(() => {
    if (!roomId) return;

    try {
      onSnapshot(
        collection(db, "room", roomId, "post", post.id, "comment"),
        (postCommentDocs) => {
          setPostComments(
            postCommentDocs.docs.map(
              (postCommentDoc) => postCommentDoc.data() as CommentData
            )
          );
        }
      );
    } catch (error) {
      showSnackbarError(error);
    }
  }, [post.id, roomId, showSnackbarError]);

  useEffect(() => {
    getUserData(post.creator_id);
    if (roomId) {
      getPostComments();
    }
  }, [roomId, post]);

  if (!roomId) return null;

  return (
    <Box
      style={{
        padding: 8,
        background: "white",
        border: "1px solid #D8DCF0",
        borderRadius: 8,
        display: "flex",
        margin: "8px 0px",
        width: 620,
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <Box
        style={{
          display: "flex",
          maxWidth: "true",
          padding: 16,
          maxHeight: 83,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box style={{ display: "inline-flex", alignItems: "center" }}>
          <Avatar
            alt="avatar"
            src={user ? user.avatar : USER_AVATAR_DEFAULT}
            style={{
              width: 40,
              height: 40,
              marginRight: 16,
              border: "0.5px solid blue",
            }}
          />
          <Box style={{ display: "flex", flexDirection: "column" }}>
            <Typography style={{ fontWeight: 600 }}>
              {user ? user.name : ""}
            </Typography>
            <Typography
              style={{ fontWeight: 400, fontSize: "0.75rem", lineHeight: 1.66 }}
            >
              {convertTimeToString(post.created_at)}
            </Typography>
          </Box>
        </Box>
        <PostCardMenu post={post} />
      </Box>
      <Typography
        style={{
          margin: "4px 0px 4px 16px",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {post.content}
      </Typography>

      {post.image === "" ? (
        <></>
      ) : (
        <Box style={{ padding: 16, position: "relative" }}>
          <img
            alt={"post"}
            src={post.image}
            style={{
              marginTop: 8,
              maxHeight: 320,
              minHeight: 120,
              width: "100%",
              objectFit: "cover",
              height: "auto",
            }}
          />
        </Box>
      )}
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingLeft: 16,
          paddingRight: 16,
          marginBottom: 16,
        }}
      >
        <Typography
          style={{ fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.43 }}
        >
          <CommentIcon style={{ width: 24, height: 24, marginRight: 4 }} />
          {postComments.length + " bình luận"}
        </Typography>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.875rem",
            lineHeight: 1.43,
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={() => {
            setShowComments(!showComments);
          }}
        >
          {showComments ? "Ẩn bình luận" : "Hiện bình luận"}
        </Typography>
      </Box>
      <CreatePostComment post={post} />

      {showComments &&
        postComments
          .sort((commentA, commentB) => {
            const createdTimeA = commentA.created_at as Timestamp;
            const createdTimeB = commentB.created_at as Timestamp;
            if (createdTimeA.seconds < createdTimeB.seconds) {
              return 1;
            }
            if (createdTimeA.seconds > createdTimeB.seconds) {
              return -1;
            }

            if (createdTimeA.seconds === createdTimeB.seconds) {
              if (createdTimeA.nanoseconds < createdTimeB.nanoseconds) {
                return 1;
              }

              if (createdTimeA.nanoseconds > createdTimeB.nanoseconds) {
                return -1;
              }
            }

            return 0;
          })
          .map((comment) => {
            return <Comment comment={comment} post={post} />;
          })}
    </Box>
  );
};

export default PostCard;
