const validator = require("validator");
const validateUser = (data) => {
  const mandatoryFields = ["password", "name", "email"];
  if (!mandatoryFields.every((field) => Object.keys(data).includes(field))) {
    throw new Error("All the mandatory fields not included!");
  }
  const { password, name, email } = data;
  if (!validator.isStrongPassword(password))
    throw new Error(
      "Strong password required : { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }"
    );
  if (!validator.isEmail(email)) throw new Error("email Invalid");
};
module.exports = validateUser;
