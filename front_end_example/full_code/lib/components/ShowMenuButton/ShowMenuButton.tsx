import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonProps,
  Fade,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";

interface ShowMenuButtonProps {
  title: string;
  itemsTitle: string[];
  itemsAction: (() => void)[];
  tooltipTitle?: string;
}

const ShowMenuButton = ({
  title,
  itemsTitle,
  itemsAction,
  tooltipTitle,
  ...buttonProps
}: ShowMenuButtonProps & ButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (index: number) => {
    itemsAction[index]();
    handleClose();
  };

  return (
    <Box>
      <Tooltip
        title={tooltipTitle || "Show more"}
        TransitionProps={{ timeout: 800 }}
        placement="bottom"
        TransitionComponent={Fade}
        arrow
      >
        <Button
          style={{
            color: "rgb(23,43,77)",
            textTransform: "none",
            background: "#DDD",
          }}
          onClick={handleClick}
          {...buttonProps}
        >
          {title}
        </Button>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {itemsTitle.map((itemTitle, index) => (
          <MenuItem key={index} onClick={() => handleMenuItemClick(index)}>
            {itemTitle}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ShowMenuButton;
