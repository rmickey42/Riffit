//Client side validation

//So far: Client Side Login and Signup completed.

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

    // if (username && password) {
    //   $.ajax({
    //     method: "POST",
    //     url: "/login",
    //     data: { username: username, password: password },
    //     success: function (response) {
    //       errorMessage.hide().text("");
    //       window.location.href = "/users/me";
    //     },
    //     error: function () {
    //       errorMessage.text("Either Username or Password is Invalid.").show();

    //     },
    //   });
    // }
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

    // if (username && password && confirmPassword) {
    // $.ajax({
    //   method: "POST",
    //   url: "/signup",
    //   data: {
    //     username: username,
    //     password: password,
    //     confirmPassword: confirmPassword,
    //   },
    //   success: function (response) {
    //     errorMessage.hide().text("");
    //     window.location.href = "/login";
    //   },
    //   error: function (xhr) {
    //     errorMessage.text(xhr.responseText).show();
    //   },
    // });
    // }
  });

  

  // searchForm.submit(function (event) {
  //   event.preventDefault();
  //   let tag;

  //   try {
  //     tag = checkString(tagInput.val());
  //   } catch (e) {
  //     errorMessage.text(e).show();
  //     return;
  //   }

  //   if (tag) {
  //     $.ajax({
  //       method: "POST",
  //       url: "/search",
  //       data: {
  //         tag: tag,
  //       },
  //       success: function (response) {
  //         errorMessage.hide().text("");
  //       //   window.location.href = "/searchResults"; //Search Results page!
  //       },
  //       error: function (xhr) {
  //         errorMessage.text(xhr.responseText).show();
  //       },
  //     });
  //   }
  // });
})(window.jQuery);
