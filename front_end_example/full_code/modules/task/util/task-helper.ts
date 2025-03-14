/*
Lexorank
The idea of Atlassian JIRA
*/

import { Timestamp } from "@firebase/firestore";
import { Typography } from "@mui/material/styles/createTypography";
import { ReactNode } from "react";

const mid = (prev: number, next: number) => Math.floor((prev + next) / 2);

const getChar = (str: string, i: number, defaultChar: number) =>
  i >= str.length ? defaultChar : byte(str.charAt(i));

const byte = (char: string) => char.charCodeAt(0);

const string = (byte: number) => String.fromCharCode(byte);

const TaskHelper = {
  getOrderString: (prev: string, next: string) => {
    const MIN_CHAR = byte("!");
    const MAX_CHAR = byte("~");

    if (prev === "" || !prev) {
      prev = string(MIN_CHAR);
    }
    if (next === "" || !next) {
      next = string(MAX_CHAR);
    }

    let rank = "";
    let i = 0;

    while (true) {
      let prevChar = getChar(prev, i, MIN_CHAR);
      let nextChar = getChar(next, i, MAX_CHAR);

      if (prevChar === nextChar) {
        rank += string(prevChar);
        i++;
        continue;
      }

      let midChar = mid(prevChar, nextChar);
      if (midChar === prevChar || midChar === nextChar) {
        rank += string(prevChar);
        i++;
        continue;
      }

      rank += string(midChar);
      break;
    }

    return rank;
  },

  convertDeadline: (
    deadline: Timestamp | Date | string | undefined
  ): string => {
    if (deadline?.constructor === Date) {
      return (
        "Ngày " +
        deadline.getDate() +
        " tháng " +
        (deadline.getMonth() + 1) +
        " năm " +
        deadline.getFullYear()
      );
    }

    if (deadline?.constructor === Timestamp) {
      const seconds = deadline.seconds - Timestamp.now().seconds;
      if (seconds < 0) return "Quá hạn";

      if (seconds < 60) return String(seconds) + " giây";

      const minutes = seconds / 60;
      if (minutes < 60) return Math.floor(minutes) + " phút";

      const hours = seconds / 3600;
      if (hours < 24) return Math.floor(hours) + " giờ";

      const date = new Date(deadline.seconds * 1000);
      return (
        "Ngày " +
        date.getDate() +
        " tháng " +
        (date.getMonth() + 1) +
        " năm " +
        date.getFullYear()
      );
    }

    return "Không";
  },
};

export default TaskHelper;
