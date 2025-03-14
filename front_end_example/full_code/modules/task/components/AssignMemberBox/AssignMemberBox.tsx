import { MenuItem } from "@mui/material";
import { Avatar, Box, Menu, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMembers } from "../../../../lib/provider/MembersProvider";
import MemberData from "../../../member/interface/member-data";
import USER_AVATAR_DEFAULT from "../../../user/contants/user-avatar-default";
import UserData from "../../../user/interface/user-data";
import UserHelper from "../../../user/util/user-helper";
import TaskData from "../../interface/task-data";

interface AssignMemberBoxProps {
  task: TaskData;
  onChoose: (member: MemberData | UserData) => void;
}

const AssignMemberBox = ({ task, onChoose }: AssignMemberBoxProps) => {
  const [textFieldValue, setTextFieldValue] = useState("");
  const [showTextField, setShowTextField] = useState(false);
  const [hintPeopleAnchorEl, setHintPeopleAnchorEl] =
    useState<HTMLElement | null>(null);
  const [assignee, setAssignee] = useState<MemberData | UserData>();

  const { roomId } = useParams();
  const { getMembers, members } = useMembers();

  const getAssigneeInfo = async () => {
    const assigneeInfo = await UserHelper.getUserById(task.assignee_id);
    if (assigneeInfo) {
      setAssignee(assigneeInfo);
    }
  };

  useEffect(() => {
    getAssigneeInfo();
  }, [task]);

  useEffect(() => {
    const getHintPeople = async () => {
      await getMembers({
        room_id: roomId || "",
        getStart: 0,
        getLimit: 100,
      });
    };

    getHintPeople();
  }, [roomId]);

  return (
    <>
      {showTextField ? (
        <TextField
          value={textFieldValue}
          placeholder="Nhập @ để gán"
          size="small"
          onBlur={() => {
            setShowTextField(false);
            setHintPeopleAnchorEl(null);
          }}
          autoFocus
          onChange={(event) => {
            setTextFieldValue(event.target.value);
            if (event.target.value.includes("@")) {
              if (!hintPeopleAnchorEl) {
                setHintPeopleAnchorEl(event.currentTarget);
              }
            } else {
              setHintPeopleAnchorEl(null);
            }
          }}
        />
      ) : (
        <Box
          style={{ display: "flex", alignItems: "center" }}
          onClick={() => setShowTextField(!showTextField)}
        >
          <Avatar
            sizes="small"
            src={assignee?.avatar || USER_AVATAR_DEFAULT}
            style={{ marginRight: 8 }}
          />
          <Typography>{assignee?.name || "Chưa xác định"}</Typography>
        </Box>
      )}

      <Menu
        open={!!hintPeopleAnchorEl}
        anchorEl={hintPeopleAnchorEl}
        disableAutoFocus
      >
        <Box>
          {members
            .filter((member) =>
              member.name.includes(
                textFieldValue.substring(textFieldValue.indexOf("@") + 1)
              )
            )
            .concat([
              {
                id: "1",
                name: "Chưa xác định",
                avatar: "",
                joined_at: "",
              },
            ])
            .map((member) => (
              <MenuItem
                onClick={() => {
                  onChoose(member);
                  setAssignee(member);
                  setShowTextField(false);
                  setHintPeopleAnchorEl(null);
                }}
              >
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar src={member.avatar} style={{ marginRight: 8 }} />
                  <Typography>{member.name}</Typography>
                </Box>
              </MenuItem>
            ))}
        </Box>
      </Menu>
    </>
  );
};

export default AssignMemberBox;
