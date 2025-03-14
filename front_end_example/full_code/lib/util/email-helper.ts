var regex =
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
const EmailHelper = {
  checkEmailValidate: (email: string) => {
    var parts = email.split("@");
    if (parts.length !== 2) {
      return false;
    }
    if (!regex.test(email)) {
      return false;
    }
    return true;
  },
};

export default EmailHelper;
