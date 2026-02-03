

const validator = require("validator")
const validate = (data) => {
    const mandatoryFields = ["name", "email", "password"];

    const IsAllowed = mandatoryFields.every((k) => Object.keys(data).includes(k));

    if (!IsAllowed)
        throw new Error("All fields are mandatory");

    if (!validator.isEmail(data.email))
        throw new Error("Invalid email")

    if (!validator.isStrongPassword(data.password))
        throw new Error("Invalid Password")

}
module.exports = {
    validate
}