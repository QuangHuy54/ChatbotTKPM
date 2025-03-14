import {
  Box,
  Avatar,
  Typography,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import MemberData from "../../interface/member-data";
import UserData from "../../../user/interface/user-data";
import convertTimeToString from "../../../../lib/util/convert-time-to-string";
import { BiArrowFromLeft, BiCrown, BiTrashAlt, BiUser } from "react-icons/bi";
import { useMembers } from "../../../../lib/provider/MembersProvider";
import { useRooms } from "../../../../lib/provider/RoomsProvider";
import { useConfirmDialog } from "../../../../lib/provider/ConfirmDialogProvider";
import { useUser } from "../../../../lib/provider/UserProvider";

interface MemberTableRowProps {
  member: MemberData & UserData;
}

const MemberTableRow = ({ member }: MemberTableRowProps) => {
  const { showConfirmDialog } = useConfirmDialog();
  const { roomId } = useParams();
  let navigate = useNavigate();

  const { removeMember } = useMembers();
  const { currentRoom } = useRooms();
  const { user } = useUser();

  return (
    <TableRow
      sx={{
        transition: "background-color 0.4s ease",
        "&:hover": { backgroundColor: "#e7e9eb" },
      }}
    >
      <TableCell style={{ padding: "4px 8px" }}>
        <Typography>{member?.room_index}</Typography>
      </TableCell>
      <TableCell style={{ padding: "4px 8px" }}>
        <Avatar src={member?.avatar} />
      </TableCell>
      <TableCell style={{ padding: "4px 8px" }}>
        <Typography>{member?.name}</Typography>
      </TableCell>
      <TableCell style={{ padding: "4px 8px" }}>
        <Typography>{member?.email}</Typography>
      </TableCell>
      <TableCell style={{ padding: "4px 8px" }}>
        <Typography>{convertTimeToString(member?.joined_at || "")}</Typography>
      </TableCell>
      <TableCell style={{ padding: "4px 8px" }}>
        {currentRoom.manager_id === user?.id &&
          currentRoom.manager_id !== member?.id && (
            <IconButton
              onClick={() =>
                showConfirmDialog({
                  title: (
                    <Typography variant="h6">
                      "Xóa thành viên khỏi phòng ban"
                    </Typography>
                  ),
                  content: (
                    <Typography>
                      Bạn có chắc xóa <strong>{member?.name}</strong> ra khỏi
                      phòng ban?
                    </Typography>
                  ),
                  onConfirm: async () =>
                    await removeMember({
                      room_id: roomId || "",
                      member_id: member?.id || "",
                    }),
                })
              }
            >
              <BiTrashAlt />
            </IconButton>
          )}
        {currentRoom.manager_id !== user?.id &&
          currentRoom.manager_id !== member?.id && (
            <Tooltip title="Thành viên">
              <BiUser size={28} />
            </Tooltip>
          )}
        {currentRoom.manager_id === member?.id && (
          <Tooltip title="Quản lí">
            <BiCrown size={28} style={{ color: "orange" }} />
          </Tooltip>
        )}
      </TableCell>
      <TableCell>
        <IconButton
          onClick={() => navigate(`/room/${roomId}/member/${member?.id}`)}
        >
          <BiArrowFromLeft />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default MemberTableRow;
