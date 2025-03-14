import React, {
  JSXElementConstructor,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import useAppSnackbar from "../../hook/useAppSnackBar";
import { Box, CircularProgress } from "@mui/material";
import generateId from "../../util/generate-id";

interface UploadFileProps {
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  onSuccess?: (file: { url: string; name: string }) => void;
}

const UploadFile = ({ children, onSuccess }: UploadFileProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number>();

  const { showSnackbarError } = useAppSnackbar();

  const onUpload = useCallback(
    (file: File | undefined) => {
      if (!file) return;

      const storage = getStorage();
      const storageRef = ref(storage, `/files/${generateId()}_${file?.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (snapshot.bytesTransferred !== snapshot.totalBytes) {
            setUploadPercent(percent);
          } else {
            setUploadPercent(undefined);
          }
        },
        (error) => {
          setUploadPercent(undefined);
          showSnackbarError(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) =>
            onSuccess?.({ url: url, name: file?.name })
          );
        }
      );
    },
    [onSuccess, showSnackbarError]
  );

  return (
    <>
      {typeof uploadPercent === "number" ? (
        <Box>
          <CircularProgress variant="determinate" value={uploadPercent} />
        </Box>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(event) => {
              onUpload(event.target.files?.[0]);
            }}
          />
          <Box
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            {children}
          </Box>
        </>
      )}
    </>
  );
};

export default UploadFile;
