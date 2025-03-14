/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Avatar, Box, BoxProps } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RoomItemMenu from "./RoomItemMenu";
import RoomData from "../../../room/interface/room-data";
import { Typography } from "@mui/material";
import UserData from "../../../user/interface/user-data";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";
import UserHelper from "../../../user/util/user-helper";
import USER_AVATAR_DEFAULT from "../../../user/contants/user-avatar-default";
import truncate from "../../../../lib/util/truncate";

interface RoomItemProps {
  roomData: RoomData;
}

const RoomItem = ({ roomData, ...boxProps }: RoomItemProps & BoxProps) => {
  let navigate = useNavigate();
  const [manager, setManager] = useState<UserData>();
  const { showSnackbarError } = useAppSnackbar();
  const getUserData = async (id?: string) => {
    try {
      setManager(await UserHelper.getUserById(id || ""));
    } catch (error) {
      showSnackbarError(error);
    }
  };

  useEffect(() => {
    getUserData(roomData.manager_id);
  }, [roomData]);

  return (
    <Box
      style={{
        backgroundColor: "#c0feff",
        color: "white",
        borderRadius: 8,
        overflow: "hidden",
        ...boxProps.style,
      }}
      sx={{ boxShadow: 2 }}
      onDoubleClick={() => {
        navigate(`/room/${roomData.id}/newsfeed`);
      }}
    >
      <Box
        style={{
          position: "relative",
          marginBottom: 30,
        }}
      >
        <img
          src={roomData.avatar}
          alt=""
          style={{
            width: "100%",
            height: 160,
          }}
        />

        <Avatar
          sx={{ width: 60, height: 60 }}
          src={manager?.avatar || USER_AVATAR_DEFAULT}
          alt="Avatar room's manager"
          style={{ position: "absolute", bottom: "-30px", right: "20px" }}
        />
      </Box>

      <Box
        style={{
          display: "flex",
          padding: 16,
          color: "black",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            style={{ fontWeight: 700, fontSize: 20, overflow: "hidden" }}
          >
            {truncate(roomData?.name || "", 30)}
          </Typography>

          <Typography>
            Trưởng phòng: {truncate(manager?.name || "", 16)}
          </Typography>

          <Typography variant="body2">Mã phòng: {roomData.id}</Typography>
        </Box>

        <RoomItemMenu roomData={roomData} />
      </Box>
    </Box>
  );
};

export default RoomItem;
