import React, { useState, useEffect } from "react";

import {
  Box,
  Button,
  Menu,
  MenuItem,
  TextField,
  Divider,
  IconButton,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";

import { BiFilterAlt } from "react-icons/bi";
import { ImSortAlphaAsc, ImSortAlphaDesc } from "react-icons/im";
import SearchIcon from "@mui/icons-material/Search";
import RoomData from "../../modules/room/interface/room-data";
import { useRooms } from "../../lib/provider/RoomsProvider";
import RoomItem from "../../modules/room/components/RoomItem/RoomItem";
import AddRoomButton from "../../modules/room/components/AddRoomButton/AddRoomButton";

const RoomPage = () => {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [showRooms, setShowRooms] = useState<RoomData[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [sortType, setSortType] = useState("");

  const { rooms, getRooms, loadingRooms, loadingMoreRooms, loadedAllRooms } =
    useRooms();

  useEffect(() => {
    getRooms({ getStart: 0 });
  }, []);

  useEffect(() => {
    setShowRooms(
      rooms
        .filter((room) => room.name.includes(searchValue))
        .sort((roomA, roomB) => {
          if (sortType === "") {
            return 0;
          }
          if (sortType === "increase") {
            return roomA.name > roomB.name ? 1 : -1;
          }
          return roomA.name > roomB.name ? -1 : 1;
        })
    );
  }, [rooms, sortType, searchValue]);

  return (
    <Box style={{ padding: "0px 16px" }}>
      <Box style={{ display: "flex", alignItems: "center" }}>
        <AddRoomButton size="large" style={{ marginRight: 8 }} />

        <TextField
          fullWidth
          placeholder="Tìm kiếm..."
          size="small"
          onChange={(event) => {
            setSearchValue(event.target.value);
          }}
          InputProps={{
            endAdornment: <SearchIcon />,
          }}
        />

        <Divider sx={{ height: "100%" }} orientation="vertical" />

        <Box>
          <IconButton
            type="button"
            id="filter-button"
            sx={{ p: "10px", fontSize: "xx-large" }}
            onClick={(event) => {
              setFilterAnchorEl(event.currentTarget);
            }}
          >
            <BiFilterAlt />
          </IconButton>

          <Menu
            anchorEl={filterAnchorEl}
            open={!!filterAnchorEl}
            onClose={() => {
              setFilterAnchorEl(null);
            }}
          >
            <MenuItem
              style={{ display: "block", padding: 8 }}
              onClick={() => {
                setSortType("increase");
                setFilterAnchorEl(null);
              }}
            >
              <Box style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Sắp xếp theo tên tăng dần</Typography>
                <ImSortAlphaAsc fontSize="xx-large" color="#1a6eff" />
              </Box>
            </MenuItem>

            <MenuItem
              style={{ display: "block", padding: 8 }}
              onClick={() => {
                setSortType("descrease");
                setFilterAnchorEl(null);
              }}
            >
              <Box style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Sắp xếp theo tên giảm dần</Typography>
                <ImSortAlphaDesc fontSize="xx-large" color="#1a6eff" />
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box>
        {loadingRooms && (
          <Box
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: 16,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {!loadingRooms && (
          <Box>
            <Grid container>
              {showRooms.map((room, index) => (
                <Grid
                  key={`room-item-${index}`}
                  item={true}
                  xs={4}
                  sm={3}
                  md={3}
                >
                  <RoomItem
                    roomData={room}
                    style={{ marginTop: 16, marginRight: 16 }}
                  />
                </Grid>
              ))}
            </Grid>

            {!loadedAllRooms && !loadingMoreRooms && (
              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "16px 0px",
                }}
              >
                <Button
                  style={{ textTransform: "none" }}
                  onClick={async () => await getRooms({})}
                >
                  <Typography>Xem thêm</Typography>
                </Button>
              </Box>
            )}

            {loadingMoreRooms && (
              <Box
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RoomPage;
