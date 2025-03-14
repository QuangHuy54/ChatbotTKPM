import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Avatar,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  Typography,
} from "@mui/material";
import { usePosts } from "../../../../lib/provider/PostsProvider";
import { useUser } from "../../../../lib/provider/UserProvider";
import LoadingButton from "../../../../lib/components/LoadingButton/LoadingButton";
import UploadFile from "../../../../lib/components/UploadFile/UploadFile";
import FileUploadSharpIcon from "@mui/icons-material/FileUploadSharp";
import ClearIcon from "@mui/icons-material/Clear";
import { useParams } from "react-router-dom";
import PostData from "../../interface/post-data";
import { DialogProps } from "@mui/material";

interface EditPostCardProps {
  post?: PostData;
}

const EditPostDialog = ({
  post,
  ...dialogProps
}: EditPostCardProps & DialogProps) => {
  const emptyPost = {
    id: "",
    creator_id: "",
    created_at: "",
    content: "",
    last_edit: "",
  };
  const [currentPost, setCurrentPost] = useState<PostData>({ ...emptyPost });

  const { user } = useUser();
  const { updatePost, updatingPost } = usePosts();
  const { roomId } = useParams();
  useEffect(() => {
    post && setCurrentPost({ ...post });
  }, [post]);
  if (!user || !roomId) return null;
  return (
    <Dialog
      {...dialogProps}
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            width: "calc(100% - 64px)",
            maxWidth: "620px",
          },
        },
      }}
      style={{
        padding: 8,
        maxHeight: "calc(100% - 64px)",
        border: "1px solid #D8DCF0",
        borderRadius: 8,
        marginTop: 16,
      }}
    >
      <DialogTitle>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography style={{ fontWeight: 600 }}>
            Chỉnh sửa bài đăng
          </Typography>
          <IconButton
            onClick={() => {
              dialogProps.onClose?.({}, "backdropClick");
            }}
          >
            <ClearIcon />
          </IconButton>
        </Box>
      </DialogTitle>
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
            src={currentPost.image}
            style={{
              marginTop: 8,
              maxHeight: 320,
              minHeight: 120,
              width: "100%",
              objectFit: "cover",
              height: "auto",
            }}
            alt=""
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
          loading={updatingPost}
          disabled={currentPost.content === "" || updatingPost}
          variant="contained"
          style={{
            padding: 8,
            marginLeft: 12,
            paddingRight: 16,
            paddingLeft: 16,
          }}
          onClick={async () => {
            await updatePost({
              room_id: roomId,
              id: currentPost.id,
              update_data: {
                ...currentPost,
              },
            });
            dialogProps.onClose?.({}, "backdropClick");
          }}
        >
          Chỉnh sửa
        </LoadingButton>
      </Box>
    </Dialog>
  );
};

export default EditPostDialog;
