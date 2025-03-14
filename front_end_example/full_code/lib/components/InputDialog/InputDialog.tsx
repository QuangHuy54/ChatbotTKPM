import {
  Box,
  Button,
  Dialog,
  DialogProps,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface InputDialogProps {
  title: string;
  inputSize?: "small" | "medium";
  initInputText?: string;
  placeholder?: string;
  confirmText?: string;
  onConfirm?: (inputText: string) => void;
  cancelText?: string;
  inputErrorText?: string;
  showError?: (inputText: string) => boolean;
}

const InputDialog = ({
  title,
  inputSize,
  initInputText,
  placeholder,
  confirmText,
  onConfirm,
  cancelText,
  inputErrorText,
  showError,
  ...dialogProps
}: InputDialogProps & DialogProps) => {
  const [text, setText] = useState(initInputText || "");
  const [isError, setIsError] = useState(false);

  return (
    <Dialog {...dialogProps}>
      <Box style={{ padding: 16, ...dialogProps.style }}>
        <Box
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography variant={"h6"} fontWeight={"bold"}>
            {title}
          </Typography>
        </Box>

        <TextField
          value={text}
          fullWidth
          placeholder={placeholder}
          error={isError}
          helperText={isError && inputErrorText}
          size={inputSize ?? "small"}
          onChange={(event) => setText(event.target.value)}
        />

        <Box style={{ marginTop: 16, display: "flex", justifyContent: "end" }}>
          <Button
            color={"inherit"}
            style={{ textTransform: "none", marginRight: 16 }}
            variant="contained"
            onClick={() => dialogProps.onClose?.({}, "backdropClick")}
          >
            <Typography fontWeight={"bold"}>
              {cancelText ?? "Hủy bỏ"}
            </Typography>
          </Button>

          <Button
            style={{ textTransform: "none" }}
            variant="contained"
            onClick={() => {
              if (!showError?.(text)) {
                setIsError(false);
                onConfirm?.(text);
                dialogProps.onClose?.({}, "backdropClick");
              } else {
                setIsError(true);
              }
            }}
          >
            <Typography fontWeight={"bold"}>
              {confirmText ?? "Đồng ý"}
            </Typography>
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default InputDialog;
