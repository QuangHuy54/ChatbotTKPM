import { Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import HomePage from "./pages/HomePage/HomePage";
import SettingPage from "./pages/SettingPage/SettingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import RoomPage from "./pages/RoomPage/RoomPage";
import MembersPage from "./pages/RoomPage/[roomId]Page/MembersPage/MembersPage";
import NewsfeedPage from "./pages/RoomPage/[roomId]Page/NewsfeedPage/NewsfeedPage";
import SettingRoomPage from "./pages/RoomPage/[roomId]Page/SettingRoomPage/SettingRoomPage";
import WorkPage from "./pages/RoomPage/[roomId]Page/WorkPage/WorkPage";
import EmptyPage from "./pages/EmptyPage/EmptyPage";
import SchedulePage from "./pages/SchedulePage/SchedulePage";
import Chatbot from "./modules/chatbot/ChatBot";
import { useEffect, useState } from "react";

const AppRoutes = () => {
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/" element={<HomePage />} />
      <Route path="home" element={<HomePage />} />
      <Route path="setting" element={<SettingPage />} />

      <Route path="room" element={<RoomPage />} />
      <Route path="room/:roomId" element={<NewsfeedPage />} />
      <Route path="room/:roomId/newsfeed" element={<NewsfeedPage />} />
      <Route path="room/:roomId/member" element={<MembersPage />} />
      <Route path="room/:roomId/work" element={<WorkPage />} />
      <Route path="room/:roomId/setting-room" element={<SettingRoomPage />} />
      <Route path="schedule" element={<SchedulePage />} />
      <Route path="*" element={<EmptyPage />} />
    </Routes>
  );
};

export default AppRoutes;
