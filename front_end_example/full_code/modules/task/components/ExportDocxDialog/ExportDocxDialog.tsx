import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogProps,
  Typography,
  useMediaQuery,
  useTheme,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  SelectChangeEvent,
} from "@mui/material";
import docxPageCoverTemplate1 from "../../../../assets/images/docx-page-cover-template1.jpg";
import docxPageCoverTemplate2 from "../../../../assets/images/docx-page-cover-template2.jpg";
import docxPageCoverTemplate3 from "../../../../assets/images/docx-page-cover-template3.jpg";
import docxPageCoverTemplate4 from "../../../../assets/images/docx-page-cover-template4.jpg";
import docxPageCoverTemplate5 from "../../../../assets/images/docx-page-cover-template5.jpg";
import docxPageCoverTemplate6 from "../../../../assets/images/docx-page-cover-template6.jpg";

interface ExportDocxDialogProps {
  onConfirm: (any) => void;
}

const ExportDocxDialog = ({
  onConfirm,
  ...dialogProps
}: ExportDocxDialogProps & DialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [fileName, setFileName] = useState("output");
  const [language, setLanguage] = useState("EN");
  const [headerChecked, setHeaderChecked] = useState(false);
  const [left_header, set_left_header] = useState("");
  const [right_header, set_right_header] = useState("");
  const [footerChecked, setFooterChecked] = useState(false);
  const [left_footer, set_left_footer] = useState("");
  const [center_footer, set_center_footer] = useState("");
  const [right_footer, set_right_footer] = useState("");
  const [coverChecked, setCoverChecked] = useState(false);
  const [company_name, set_company_name] = useState("");
  const [report_title, set_report_title] = useState("");
  const [lorem_text, set_lorem_text] = useState("");
  const [coverType, setCoverType] = useState("001");

  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as string);
  };

  const handleHeaderCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderChecked(event.target.checked);
  };

  const handle_left_header_change = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_left_header(event.target.value);
  };

  const handle_right_header_change = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_right_header(event.target.value);
  };

  const handleFooterCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFooterChecked(event.target.checked);
  };

  const handle_left_footer_change = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_left_footer(event.target.value);
  };

  const handle_center_footer_change = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_center_footer(event.target.value);
  };

  const handle_right_footer_change = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_right_footer(event.target.value);
  };

  const handleCoverCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCoverChecked(event.target.checked);
  };

  const handle_company_name_change = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_company_name(event.target.value);
  };

  const handle_report_title_change = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_report_title(event.target.value);
  };

  const handle_lorem_textChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_lorem_text(event.target.value);
  };

  const handleCoverTypeChange = (event: SelectChangeEvent) => {
    setCoverType(event.target.value as string);
  };

  const isFileNameValid = /^[\w\d]+(\.[\w\d]+)?$/.test(fileName);

  const handleConfirm = () => {
    const data = {
      fileName,
      en: language === "EN",
      vi: language === "VI",
      headerChecked,
      left_header,
      right_header,
      footerChecked,
      left_footer,
      center_footer,
      right_footer,
      company_name,
      report_title,
      lorem_text,
      cover_page_001: coverChecked && coverType === "001",
      cover_page_002: coverChecked && coverType === "002",
      cover_page_003: coverChecked && coverType === "003",
      cover_page_004: coverChecked && coverType === "004",
      cover_page_005: coverChecked && coverType === "005",
      cover_page_006: coverChecked && coverType === "006",
    };
    onConfirm(data);
    dialogProps.onClose?.({}, "backdropClick");
  };

  const coverOptions = [
    { value: "001", label: "Loại 1", image: docxPageCoverTemplate1 },
    { value: "002", label: "Loại 2", image: docxPageCoverTemplate2 },
    { value: "003", label: "Loại 3", image: docxPageCoverTemplate3 },
    { value: "004", label: "Loại 4", image: docxPageCoverTemplate4 },
    { value: "005", label: "Loại 5", image: docxPageCoverTemplate5 },
    { value: "006", label: "Loại 6", image: docxPageCoverTemplate6 },
  ];

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth={true}
      maxWidth="md"
      {...dialogProps}
    >
      <Box p={2}>
        <Typography variant="h5" component="div">
          Xuất danh sách công việc sang file docx
        </Typography>
        <TextField
          label="Tên file"
          variant="outlined"
          fullWidth
          margin="normal"
          value={fileName}
          onChange={handleFileNameChange}
          error={!isFileNameValid}
          helperText={
            !isFileNameValid &&
            "Tên file không hợp lệ. Chỉ chấp nhận các ký tự chữ cái, số, và dấu chấm. Tên file không được rỗng."
          }
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Ngôn ngữ</InputLabel>
          <Select
            value={language}
            onChange={handleLanguageChange}
            variant="outlined"
            label="Ngôn ngữ"
            fullWidth
          >
            <MenuItem value="VI">Tiếng Việt</MenuItem>
            <MenuItem value="EN">Tiếng Anh</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={headerChecked}
              onChange={handleHeaderCheck}
              color="primary"
            />
          }
          label="Header"
        />
        <Box display="flex" gap={1}>
          <TextField
            label="Left header"
            variant="outlined"
            fullWidth
            margin="normal"
            disabled={!headerChecked}
            value={left_header}
            onChange={handle_left_header_change}
          />
          <TextField
            label="Right header"
            variant="outlined"
            fullWidth
            margin="normal"
            disabled={!headerChecked}
            value={right_header}
            onChange={handle_right_header_change}
          />
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={footerChecked}
              onChange={handleFooterCheck}
              color="primary"
            />
          }
          label="Footer"
        />
        <Box display="flex" gap={1}>
          <TextField
            label="Left footer"
            variant="outlined"
            fullWidth
            margin="normal"
            disabled={!footerChecked}
            value={left_footer}
            onChange={handle_left_footer_change}
          />
          <TextField
            label="Center footer"
            variant="outlined"
            fullWidth
            margin="normal"
            disabled={!footerChecked}
            value={center_footer}
            onChange={handle_center_footer_change}
          />
          <TextField
            label="Right footer"
            variant="outlined"
            fullWidth
            margin="normal"
            disabled={!footerChecked}
            value={right_footer}
            onChange={handle_right_footer_change}
          />
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={coverChecked}
              onChange={handleCoverCheck}
              color="primary"
            />
          }
          label="Bìa"
        />
        <Box display="flex" gap={1}>
          <TextField
            label="Company's name"
            variant="outlined"
            fullWidth
            margin="normal"
            disabled={!coverChecked}
            value={company_name}
            onChange={handle_company_name_change}
          />
          <TextField
            label="Report title"
            variant="outlined"
            fullWidth
            margin="normal"
            disabled={!coverChecked}
            value={report_title}
            onChange={handle_report_title_change}
          />
        </Box>
        <TextField
          label="Caption text"
          variant="outlined"
          fullWidth
          margin="normal"
          disabled={!coverChecked}
          value={lorem_text}
          onChange={handle_lorem_textChange}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Loại bìa</InputLabel>
          <Select
            value={coverType}
            onChange={handleCoverTypeChange}
            variant="outlined"
            label="Loại bìa"
            fullWidth
            disabled={!coverChecked}
            renderValue={(selected) => (
              <Box display="flex" alignItems="center" gap={1}>
                <img
                  src={
                    coverOptions.find((option) => option.value === selected)
                      ?.image
                  }
                  alt={selected}
                  style={{ width: "100px", height: "auto" }}
                />
                <Typography>
                  {
                    coverOptions.find((option) => option.value === selected)
                      ?.label
                  }
                </Typography>
              </Box>
            )}
          >
            {coverOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box display="flex" alignItems="center" gap={2} padding={1}>
                  <img
                    src={option.image}
                    alt={option.value}
                    style={{ width: "100px", height: "auto" }}
                  />
                  <Typography>{option.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            onClick={() => {
              dialogProps.onClose?.({}, "backdropClick");
            }}
          >
            Thoát
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!isFileNameValid}
            onClick={handleConfirm}
          >
            Đồng ý
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ExportDocxDialog;
