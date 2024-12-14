//AJAX form with error handling (client-side)

(function ($) {
  let errorMessage = $(".error-message");

  let usernameInput = $("#username");
  let passwordInput = $("#password");
  let confirmPasswordInput = $("#confirmPassword");

  let signInForm = $("#signin-form");
  let signUpForm = $("#signup-form");

  let searchForm = $("#search-form");
  let tagInput = $("#tag-input-1");

  signInForm.submit(function (event) {
    event.preventDefault();
    let username, password;

    try {
      username = checkString(usernameInput.val(), "Username");
      password = checkString(passwordInput.val(), "Password");
    } catch (e) {
      errorMessage.text(e).show();
      return;
    }

    if (username && password) {
      $.ajax({
        method: "POST",
        url: "/login",
        data: { username: username, password: password },
        success: function (response) {
          errorMessage.hide().text("");
          window.location.href = "/user/me";
        },
        error: function (xhr) {
          errorMessage.text(xhr.responseText).show();
        },
      });
    }
  });

  signUpForm.submit(function (event) {
    event.preventDefault();
    let username, password, confirmPassword;

    try {
      username = checkString(usernameInput.val(), "Username");
      password = checkString(passwordInput.val(), "Password");
      confirmPassword = checkString(
        confirmPasswordInput.val(),
        "Confirmed Password"
      );
    } catch (e) {
      errorMessage.text(e).show();
      return;
    }

    if (username && password && confirmPassword) {
      $.ajax({
        method: "POST",
        url: "/signup",
        data: {
          username: username,
          password: password,
          confirmPassword: confirmPassword,
        },
        success: function (response) {
          errorMessage.hide().text("");
          window.location.href = "/login";
        },
        error: function (xhr) {
          errorMessage.text(xhr.responseText).show();
        },
      });
    }
  });

  searchForm.submit(function (event) {
    event.preventDefault();

    try {
      let tag = checkString(tagInput.val());
    } catch (e) {
      errorMessage.text(e).show();
      return;
    }

    if (tag) {
      $.ajax({
        method: "POST",
        url: "/search",
        data: {
          tag: tag,
        },
        success: function (response) {
          errorMessage.hide().text("");
        //   window.location.href = "/searchResults"; //Search Results page!
        },
        error: function (xhr) {
          errorMessage.text(xhr.responseText).show();
        },
      });
    }
  });

  const checkString = (str, value) => {
    if (typeof str !== "string") throw `${value} must be a string!`;
    if (str.trim().length === 0 || !str) throw `You must provide a ${value}!`;
    return str.trim();
  };
})(window.jQuery);
