import { Box, BoxProps, IconButton, Typography } from "@mui/material";
import { BiCopyAlt } from "react-icons/bi";
import useAppSnackbar from "../../hook/useAppSnackBar";
import copyTextToClipboard from "../../util/copy-text-to-clipboard";
import { useState } from "react";

const CopyToClipboardBox = ({
  text,
  ...boxProps
}: {
  text: string;
} & BoxProps) => {
  const [copying, setCopying] = useState(false);
  const { showSnackbarError, showSnackbarSuccess } = useAppSnackbar();

  const onCopyClick = async () => {
    try {
      setCopying(true);
      await copyTextToClipboard(text);
      showSnackbarSuccess("Copy thành công");
    } catch (error) {
      showSnackbarError(error);
    } finally {
      setCopying(false);
    }
  };

  return (
    <Box
      style={{
        backgroundColor: "whitesmoke",
        borderRadius: 8,
        padding: "0 8px",
        border: `1px solid #666666`,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        ...boxProps.style,
      }}
    >
      <Typography
        noWrap
        style={{
          flex: 1,
          textOverflow: "ellipsis",
          color: !copying ? "#282A3A" : "#D6E4E5",
          fontSize: 14,
        }}
      >
        {text}
      </Typography>

      <IconButton
        disabled={copying}
        style={{ color: !copying ? "#282A3A" : "#D6E4E5" }}
        title="Sao chép"
        onClick={onCopyClick}
        size="large"
      >
        <BiCopyAlt style={{ width: 20, height: 20 }} />
      </IconButton>
    </Box>
  );
};

export default CopyToClipboardBox;
