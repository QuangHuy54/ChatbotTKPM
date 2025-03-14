import React, { useEffect } from "react";
import LeftSideBar from "../../../../modules/room/components/LeftSideBar/LeftSideBar";
import { useMembers } from "../../../../lib/provider/MembersProvider";
import { useRooms } from "../../../../lib/provider/RoomsProvider";
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MemberTableRow from "../../../../modules/member/components/MemberTableRow/MemberTableRow";
import { useParams } from "react-router-dom";

const MembersPage = () => {
  const { roomId } = useParams();
  const { currentRoom, getCurrentRoom, loadingCurrentRoom } = useRooms();
  const {
    members,
    getMembers,
    loadingMembers,
    loadingMoreMembers,
    loadedAllMembers,
  } = useMembers();

  useEffect(() => {
    getCurrentRoom(roomId || "");
  }, []);

  useEffect(() => {
    if (currentRoom.manager_id) {
      getMembers({ room_id: currentRoom.id, getStart: 0 });
    }
  }, [currentRoom]);

  return (
    <LeftSideBar>
      {loadingCurrentRoom || loadingMembers ? (
        <Box
          style={{ marginTop: 16, display: "flex", justifyContent: "center" }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  style={{ padding: "4px 8px", backgroundColor: "whitesmoke" }}
                >
                  <Typography style={{ fontWeight: 600 }}>STT</Typography>
                </TableCell>
                {/* cell for avatar */}
                <TableCell
                  style={{ padding: "4px 8px", backgroundColor: "whitesmoke" }}
                />
                <TableCell
                  style={{ padding: "4px 8px", backgroundColor: "whitesmoke" }}
                >
                  <Typography style={{ fontWeight: 600 }}>Họ và tên</Typography>
                </TableCell>
                <TableCell
                  style={{ padding: "4px 8px", backgroundColor: "whitesmoke" }}
                >
                  <Typography style={{ fontWeight: 600 }}>Email</Typography>
                </TableCell>
                <TableCell
                  style={{ padding: "4px 8px", backgroundColor: "whitesmoke" }}
                >
                  <Typography style={{ fontWeight: 600 }}>Tham gia</Typography>
                </TableCell>

                {/* empty cell for remove button */}
                <TableCell
                  style={{ padding: "4px 8px", backgroundColor: "whitesmoke" }}
                />
                {/* empty cell for navigate detail member button */}
                <TableCell
                  style={{ padding: "4px 8px", backgroundColor: "whitesmoke" }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member, index) => (
                <MemberTableRow
                  member={{ ...member, room_index: index + 1 } as any}
                  key={member.id}
                />
              ))}
              {!loadedAllMembers && !loadingMoreMembers && (
                <Box style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    onClick={async () =>
                      await getMembers({ room_id: currentRoom.id })
                    }
                  >
                    Xem thêm
                  </Button>
                </Box>
              )}
              {loadingMoreMembers && (
                <Box style={{ display: "flex", justifyContent: "center" }}>
                  <CircularProgress />
                </Box>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </LeftSideBar>
  );
};

export default MembersPage;
