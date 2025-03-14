import React, { useState } from "react";
import { Box, Avatar, TextField } from "@mui/material";
import { useUser } from "../../../../lib/provider/UserProvider";
import { useParams } from "react-router-dom";
import PostData from "../../interface/post-data";
import {
  addDoc,
  collection,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../lib/config/firebase-config";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";

const CreatePostComment = ({ post }: { post: PostData }) => {
  const [postComment, setPostComment] = useState("");
  const [creatingPostComment, setCreatingPostComment] = useState(false);

  const { user } = useUser();
  const { roomId } = useParams();

  const { showSnackbarError } = useAppSnackbar();

  if (!user) return null;

  return (
    <Box style={{ display: "flex", alignItems: "center", marginLeft: 8 }}>
      <Avatar
        alt="avatar"
        src={user.avatar}
        style={{ marginRight: 8, width: 36, height: 36 }}
      />
      <TextField
        fullWidth
        size="small"
        variant="outlined"
        sx={{
          height: 40,
          fontSize: "1rem",
          fontWeight: 400,
          "*:focus": {
            boxShadow: "none",
            WebkitBoxShadow: "none",
          },
        }}
        value={postComment}
        onChange={(event) => {
          setPostComment(event.target.value);
        }}
        placeholder={"Nhập bình luận..."}
        onKeyDown={async (event) => {
          if (event.key === "Enter") {
            if (!creatingPostComment && postComment.length > 0) {
              try {
                setCreatingPostComment(true);
                const time = Timestamp.now();

                const commentDocResponse = await addDoc(
                  collection(
                    db,
                    "room",
                    roomId || "",
                    "post",
                    post.id,
                    "comment"
                  ),
                  {
                    last_edit: time,
                    created_at: time,
                    creator_id: user?.id,
                    content: postComment,
                  }
                );

                await updateDoc(
                  doc(
                    db,
                    "room",
                    roomId || "",
                    "post",
                    post.id,
                    "comment",
                    commentDocResponse.id
                  ),
                  { id: commentDocResponse.id }
                );
                setPostComment("");
                event.preventDefault();
              } catch (error) {
                showSnackbarError(error);
              } finally {
                setCreatingPostComment(false);
              }
            }
          }
        }}
      />
    </Box>
  );
};

export default CreatePostComment;
