import React, { useState } from "react";
import {
  Box,
  IconButton,
  Avatar,
  TextField,
  Button,
  BoxProps,
} from "@mui/material";
import { usePosts } from "../../../../lib/provider/PostsProvider";
import { useUser } from "../../../../lib/provider/UserProvider";
import LoadingButton from "../../../../lib/components/LoadingButton/LoadingButton";
import UploadFile from "../../../../lib/components/UploadFile/UploadFile";
import FileUploadSharpIcon from "@mui/icons-material/FileUploadSharp";
import ClearIcon from "@mui/icons-material/Clear";
import { useParams } from "react-router-dom";

const CreatePostCard = ({ ...boxProps }: BoxProps) => {
  const emptyPost = {
    content: "",
    image: "",
  };
  const [currentPost, setCurrentPost] = useState({ ...emptyPost });

  const { user } = useUser();
  const { createPost, creatingPost } = usePosts();
  const { roomId } = useParams();

  if (!user || !roomId) return null;

  return (
    <Box
      style={{
        minWidth: 620,
        background: "white",
        padding: 8,
        border: "1px solid #D8DCF0",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        ...boxProps.style,
      }}
    >
      <Box
        style={{
          display: "flex",
          maxWidth: "true",
          padding: 16,
          maxHeight: 83,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar alt="avatar" src={user.avatar} style={{ marginLeft: 8 }} />
        <TextField
          fullWidth
          multiline
          onChange={(event) => {
            setCurrentPost({ ...currentPost, content: event.target.value });
          }}
          value={currentPost.content}
          InputProps={{ disableUnderline: true }}
          sx={{
            border: "none",
            outline: "none",
            "& fieldset": { border: "none" },
            "*:focus": {
              boxShadow: "none",
              WebkitBoxShadow: "none",
            },
          }}
          maxRows={"3"}
          placeholder={"Nhập nội dung thảo luận..."}
        />
      </Box>
      {currentPost.image === "" ? (
        <></>
      ) : (
        <Box style={{ padding: 16, position: "relative" }}>
          <img
            alt={"ảnh"}
            src={currentPost.image}
            style={{
              marginTop: 8,
              maxHeight: 320,
              minHeight: 120,
              width: "100%",
              objectFit: "cover",
              height: "auto",
            }}
          />
          <IconButton
            style={{ top: 32, right: 24, position: "absolute" }}
            onClick={() => {
              setCurrentPost({ ...currentPost, image: "" });
            }}
          >
            <ClearIcon />
          </IconButton>
        </Box>
      )}
      <Box
        style={{
          display: "flex",
          justifyContent: "flex-end",
          borderTop: "1px solid rgb(216, 220, 240)",
          alignItems: "center",
          padding: 16,
        }}
      >
        <UploadFile
          onSuccess={async (file) => {
            setCurrentPost({ ...currentPost, image: file.url });
          }}
        >
          <Button variant="outlined" style={{ padding: 8 }}>
            <h1>
              <FileUploadSharpIcon />
              Thêm ảnh
            </h1>
            <input type="file" hidden />
          </Button>
        </UploadFile>
        <LoadingButton
          loading={creatingPost}
          disabled={currentPost.content === "" || creatingPost}
          variant="contained"
          style={{
            padding: 8,
            marginLeft: 12,
            paddingRight: 16,
            paddingLeft: 16,
          }}
          onClick={async () => {
            await createPost({
              room_id: roomId,
              new_post: {
                ...currentPost,
              },
            });
            setCurrentPost({ ...emptyPost });
          }}
        >
          Đăng tin
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default CreatePostCard;
