import React from "react";
import ReactDOM from "react-dom/client";
import AppSnackbarProvider from "./lib/provider/AppSnackBarProvider";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./lib/provider/AuthProvider";
import RoomsProvider from "./lib/provider/RoomsProvider";
import Header from "./modules/layout/components/Header/Header";
import UserProvider from "./lib/provider/UserProvider";
import AppRoutes from "./AppRoutes";
import MembersProvider from "./lib/provider/MembersProvider";
import TasksProvider from "./lib/provider/TasksProvider";
import PostsProvider from "./lib/provider/PostsProvider";
import ConfirmDialogProvider from "./lib/provider/ConfirmDialogProvider";
import ScheduleProvider from "./lib/provider/ScheduleProvider";
import { ChatbotProvider } from "./lib/provider/ChatbotProvider";
import Chatbot from "./modules/chatbot/ChatBot";
import FloatingButton from "./modules/chatbot/FloatingButton";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AppSnackbarProvider>
    <BrowserRouter>
      <ConfirmDialogProvider>
        <AuthProvider>
          <UserProvider>
            <Header>
              <ChatbotProvider>
                {/* add provider here */}
                <ScheduleProvider>
                  <RoomsProvider>
                    <MembersProvider>
                      <TasksProvider>
                        <PostsProvider>
                          <Chatbot />
                          <FloatingButton />
                          {/* ----------------- */}
                          <AppRoutes />

                          {/* add provider here */}
                        </PostsProvider>
                      </TasksProvider>
                    </MembersProvider>
                  </RoomsProvider>
                </ScheduleProvider>
              </ChatbotProvider>
              {/* ----------------- */}
            </Header>
          </UserProvider>
        </AuthProvider>
      </ConfirmDialogProvider>
    </BrowserRouter>
  </AppSnackbarProvider>
);
