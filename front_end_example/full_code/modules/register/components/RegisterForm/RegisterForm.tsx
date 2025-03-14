/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useState } from "react";
import "./RegisterForm.css";
import InputRow from "../../../login/components/InputRow/InputRow";
import EmailHelper from "../../../../lib/util/email-helper";
import useAppSnackbar from "../../../../lib/hook/useAppSnackBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../lib/provider/AuthProvider";
import LoadingButton from "../../../../lib/components/LoadingButton/LoadingButton";
import { Typography } from "@mui/material";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [EmailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [registering, setRegistering] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { showSnackbarError, showSnackbarSuccess } = useAppSnackbar();

  const checkRegisterValid = useCallback(() => {
    if (email === "") {
      return false;
    } else if (!EmailHelper.checkEmailValidate(email)) {
      return false;
    }
    if (password === "") {
      return false;
    }
    if (confirmpassword === "") {
      return false;
    }
    if (password !== confirmpassword) {
      return false;
    }

    return true;
  }, [confirmpassword, email, password]);

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div
          className="lg:shadow-2xl rounded px-8 pt-6 pb-8 mb-4 flex flex-col"
          style={{ background: "white" }}
        >
          <div className="mt-8 space-y-6">
            <h2 className="mt-6 text-left text-3xl font-medium tracking-tight text-gray-900">
              Đăng ký
            </h2>
            <InputRow
              name="email"
              id="email"
              type="text"
              placeholder="Nhập email để tạo tài khoản..."
              haveError={EmailError === "" ? false : true}
              errorText={EmailError}
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
            <InputRow
              name="confirmpassword"
              id="confirmpassword"
              type="password"
              placeholder="Xác nhận mật khẩu..."
              haveError={confirmPasswordError === "" ? false : true}
              errorText={confirmPasswordError}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
            />

            <LoadingButton
              fullWidth
              disabled={registering}
              loading={registering}
              variant="contained"
              color="primary"
              style={{ borderRadius: 16 }}
              onClick={async (event) => {
                if (!checkRegisterValid()) {
                  if (email === "") {
                    setEmailError("Email không được để trống");
                  } else if (!EmailHelper.checkEmailValidate(email)) {
                    setEmailError("Sai định dạng email");
                  }
                  if (password === "") {
                    setPasswordError("Mật khẩu không được để trống");
                  }
                  if (confirmpassword === "") {
                    setConfirmPasswordError(
                      "Xác nhận mật khẩu không được để trống"
                    );
                  }
                  if (password !== confirmpassword) {
                    setConfirmPasswordError(
                      "Xác nhận mật khẩu không trùng khớp với mật khẩu"
                    );
                  }
                  return;
                }

                setRegistering(true);
                try {
                  await register({ email: email, password: password });

                  showSnackbarSuccess("Tạo tài khoản thành công");

                  navigate("/room");
                } catch (error) {
                  showSnackbarError(error);
                } finally {
                  setRegistering(false);
                }
              }}
            >
              <Typography variant="h6" style={{ fontWeight: 600 }}>
                Đăng ký
              </Typography>
            </LoadingButton>
          </div>
          <div
            id="seperator_login_register"
            className="flex my-4 items-center justify-center"
          >
            <span className="mx-3">hoặc</span>
          </div>
          <div className="flex items-center justify-center">
            <div
              onClick={() => navigate("/login")}
              id="loginButton"
              className="btn flex w-4/5 justify-center rounded-3xl border-4 border-solid py-2 px-4 text-xl font-bold font-normal text-center"
              style={{ cursor: "pointer" }}
            >
              Quay lại đăng nhập
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
