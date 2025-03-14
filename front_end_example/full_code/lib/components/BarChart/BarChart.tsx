import { Box, BoxProps, Typography } from "@mui/material";
import { useEffect, useState } from "react";

interface BarChartProps {
  data: { value: number; title: string }[];
  chartWidth?: number;
}

const BarChart = ({
  data,
  chartWidth,
  ...boxProps
}: BarChartProps & BoxProps) => {
  const [maxValue, setMaxValue] = useState(-1);
  useEffect(() => {
    let max = -1;
    data.forEach((item) => (max = Math.max(max, item.value)));
    setMaxValue(max);
  }, [data]);

  return (
    <Box
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        padding: 24,
        ...boxProps.style,
      }}
    >
      {data.map((item) => (
        <Box
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            alignItems: "center",
          }}
        >
          <Typography>{item.title}</Typography>
          <Box
            style={{
              backgroundColor: "blue",
              height: 1,
              width: chartWidth ?? 40,
            }}
          />
          <Box
            style={{
              transition: "max-height 250ms ease-in",
              backgroundColor: "blue",
              width: chartWidth ?? 40,
              maxHeight:
                ((boxProps.style?.height
                  ? Number(boxProps.style?.height)
                  : 200) *
                  item.value) /
                maxValue,
              height:
                ((boxProps.style?.height
                  ? Number(boxProps.style?.height)
                  : 200) *
                  item.value) /
                maxValue,
            }}
          />
          <Typography variant="body2">{item.value}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default BarChart;
