//Client side validation

// Login and Signup

let errorMessage = $(".error-message");

let usernameInput = $("#username");
let passwordInput = $("#password");
let confirmPasswordInput = $("#confirmPassword");

let signInForm = $("#signin-form");
let signUpForm = $("#signup-form");

let searchForm = $("#search-form");

let togglePasswordInput = $("#togglePassword");
let toggleConfirmPasswordInput = $("#toggleConfirmPassword");

togglePasswordInput.click(function () {
  if (passwordInput.attr("type") === "password") {
    passwordInput.attr("type", "text");
  } else {
    passwordInput.attr("type", "password");
  }
});

toggleConfirmPasswordInput.click(function () {
  if (confirmPasswordInput.attr("type") === "password") {
    confirmPasswordInput.attr("type", "text");
  } else {
    confirmPasswordInput.attr("type", "password");
  }
});

signInForm.submit(function (event) {
  let username, password;
  try {
    username = validation.checkString(usernameInput.val(), "Username");
    password = validation.checkString(passwordInput.val(), "Password");
  } catch (e) {
    errorMessage.text(e).show();
    event.preventDefault();
    return;
  }

  errorMessage.hide().text("");
});

signUpForm.submit(function (event) {
  let username, password, confirmPassword;

  try {
    username = validation.checkUsername(usernameInput.val(), "Username");
    password = validation.checkPassword(passwordInput.val(), "Password");
    confirmPassword = confirmPasswordInput.val();
    if (password !== confirmPassword) {
      throw "Passwords must match!";
    }
  } catch (e) {
    errorMessage.text(e).show();
    event.preventDefault();
    return;
  }

  errorMessage.hide().text("");
});
