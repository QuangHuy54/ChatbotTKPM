/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import "./LoginForm.css";
import InputRow from "../InputRow/InputRow";
import { Typography } from "@mui/material";
import EmailHelper from "../../../../lib/util/email-helper";
import { useAuth } from "../../../../lib/provider/AuthProvider";
import { useNavigate } from "react-router-dom";
import LoadingButton from "../../../../lib/components/LoadingButton/LoadingButton";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { showSnackbarError } = useAppSnackbar();
  const navigate = useNavigate();
  const { logIn, logging } = useAuth();

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div
          className="lg:shadow-2xl rounded px-8 pt-6 pb-8 mb-4 flex flex-col"
          style={{ background: "white" }}
        >
          <div className="mt-8 space-y-6">
            <h2 className="mt-6 text-left text-3xl font-medium tracking-tight text-gray-900">
              Đăng nhập vào tài khoản
            </h2>
            <InputRow
              name="email"
              id="email"
              type="text"
              placeholder="Nhập email..."
              haveError={emailError === "" ? false : true}
              errorText={emailError}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
            <InputRow
              name="password"
              id="password"
              type="password"
              placeholder="Nhập mật khẩu..."
              haveError={passwordError === "" ? false : true}
              errorText={passwordError}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  ghi nhớ đăng nhập
                </label>
              </div>
            </div>  */}
            <LoadingButton
              fullWidth
              variant="contained"
              color="primary"
              loading={logging}
              onClick={async () => {
                let hasError = false;
                if (email === "") {
                  setEmailError("Email không được để trống.");
                  hasError = true;
                } else if (!EmailHelper.checkEmailValidate(email)) {
                  setEmailError("Sai định dạng email.");
                  hasError = true;
                } else {
                  setEmailError("");
                }
                if (password === "") {
                  setPasswordError("Password không được để trống.");
                  hasError = true;
                } else {
                  setPasswordError("");
                }
                if (hasError) return;

                try {
                  await logIn({ email: email, password: password });
                  navigate("/room");
                } catch (error) {
                  showSnackbarError(error);
                }
              }}
            >
              <Typography variant="h6" style={{ fontWeight: 600 }}>
                Đăng nhập
              </Typography>
            </LoadingButton>
          </div>
          <div
            id="seperator_login_register"
            className="flex my-4 items-center justify-center"
          >
            <span className="mx-3">or</span>
          </div>
          <div className="flex items-center justify-center">
            <a
              onClick={() => {
                navigate("/register");
              }}
              id="createNewEmailButton"
              className="btn flex w-4/5 justify-center rounded-3xl border-4 border-solid py-2 px-4 text-xl font-bold font-normal text-center"
              style={{ cursor: "pointer" }}
            >
              Tạo tài khoản mới
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
