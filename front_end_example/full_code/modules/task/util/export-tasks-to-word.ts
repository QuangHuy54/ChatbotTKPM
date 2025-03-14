import { saveAs } from "file-saver";
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const PATH_TO_TASK_REPORT_TEMPLATE = "documents/docx/tasks_report.docx";

const exportTasksToWord = async (data, output_name = 'output.docx') => {
  const response = await fetch(PATH_TO_TASK_REPORT_TEMPLATE);
  const content = await response.arrayBuffer();
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(data);

  const buf = doc.getZip().generate({
    type: "blob",
    compression: "DEFLATE",
  });

  saveAs(buf, output_name);
};

export default exportTasksToWord;
