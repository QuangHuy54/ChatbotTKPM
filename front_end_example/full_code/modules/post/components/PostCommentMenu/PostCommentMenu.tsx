import React from "react";
import { Box, IconButton, Typography, ListItemIcon, Menu } from "@mui/material";
import { MenuItem } from "@mui/material";
import { BiTrash } from "react-icons/bi";
import { CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import PostData from "../../interface/post-data";
import { useState } from "react";
import CommentData from "../../../../lib/interface/comment-data";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../lib/config/firebase-config";
import { useConfirmDialog } from "../../../../lib/provider/ConfirmDialogProvider";

const PostCommentMenu = ({
  comment,
  post,
}: {
  comment: CommentData;
  post: PostData;
}) => {
  const [deletingPostComment, setDeletingPostComment] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { showConfirmDialog } = useConfirmDialog();

  const { showSnackbarError } = useAppSnackbar();
  const { roomId } = useParams();

  return (
    <Box
      onMouseOver={() => setIsHovering(true)}
      onMouseOut={() => setIsHovering(false)}
      style={{ width: 36, height: 36 }}
    >
      {isHovering && (
        <Box>
          <IconButton
            type="button"
            onClick={(event) => {
              if (event.target !== event.currentTarget) {
                event.stopPropagation();
                setAnchorEl(event.currentTarget);
              }
            }}
            style={{
              color: "black",
            }}
          >
            <MoreHorizIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={() => {
              setAnchorEl(null);
            }}
            anchorOrigin={{ vertical: "center", horizontal: "center" }}
          >
            {/* {deletingComment ? ( */}
            {false ? (
              <CircularProgress />
            ) : (
              <MenuItem
                disabled={deletingPostComment}
                style={{ display: "flex", padding: 8 }}
                onClick={() =>
                  showConfirmDialog({
                    title: "Xóa bình luận",
                    content: "Bạn có thực sự muốn xóa bình luận này không?",
                    onConfirm: async () => {
                      try {
                        setDeletingPostComment(true);
                        await deleteDoc(
                          doc(
                            db,
                            "room",
                            roomId || "",
                            "post",
                            post.id,
                            "comment",
                            comment.id
                          )
                        );
                        setAnchorEl(null);
                      } catch (error) {
                        showSnackbarError(error);
                      } finally {
                        setDeletingPostComment(false);
                      }
                    },
                  })
                }
              >
                <ListItemIcon>
                  {deletingPostComment ? (
                    <CircularProgress />
                  ) : (
                    <BiTrash fontSize="large" />
                  )}
                </ListItemIcon>
                <Typography variant="inherit" noWrap width="18ch">
                  Xóa bình luận
                </Typography>
              </MenuItem>
            )}
          </Menu>
        </Box>
      )}
    </Box>
  );
};

export default PostCommentMenu;
