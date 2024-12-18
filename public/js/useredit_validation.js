let editProfileForm = $("#edit-profile-form");
let profilePictureInput = $("#profilePicture");

const MAX_PFP_SIZE = 1000000; // 1 MB
const allowedFileTypes = ["image/jpeg", "image/png"];

let bioInput = $("#bio");
let instrumentsInput = $("#instruments");
let genresInput = $("#genres");

let currentPasswordInput = $("#currentPassword");
let newPasswordInput = $("#newPassword");
let confirmNewPasswordInput = $("#confirmNewPassword");

let toggleCurrentPasswordInput = $("#toggleCurrentPassword");
let toggleNewPasswordInput = $("#toggleNewPassword");
let toggleConfirmNewPasswordInput = $("#toggleConfirmNewPassword");

toggleCurrentPasswordInput.click(function () {
  if (currentPasswordInput.attr("type") === "password") {
    currentPasswordInput.attr("type", "text");
  } else {
    currentPasswordInput.attr("type", "password");
  }
});
  toggleNewPasswordInput.click(function () {
    if (newPasswordInput.attr("type") === "password") {
      newPasswordInput.attr("type", "text");
    } else {
      newPasswordInput.attr("type", "password");
    }
  });
  toggleConfirmNewPasswordInput.click(function () {
    if (confirmNewPasswordInput.attr("type") === "password") {
      confirmNewPasswordInput.attr("type", "text");
    } else {
      confirmNewPasswordInput.attr("type", "password");
    }
  });
  editProfileForm.submit(function (event) {
    try {
      let bio = bioInput.val().trim();
      let instruments = instrumentsInput.val();
      let genres = genresInput.val();

      let file = profilePictureInput[0].files[0];

      console.log(bio, instruments, genres, file);

      if (file) {
        if (!allowedFileTypes.includes(file.type)) {
          console.log(file.type);
          alert("Please upload a JPEG or PNG file.");
          event.preventDefault();
        } else if (file.size > MAX_PFP_SIZE) {
          alert("Profile picture is too large! Must be a JPEG image < 1MB.");
          event.preventDefault();
        }
      }

      if (bio.length > 500) {
        alert("Bio must be less than 500 characters.");
        event.preventDefault();
      }

      for (let i = 0; i < instruments.length; i++) {
        if (instruments[i].length > 50) {
          alert("Instrument names must be less than 50 characters.");
          event.preventDefault();
          break;
        }
      }
      for (let i = 0; i < genres.length; i++) {
        if (genres[i].length > 50) {
          alert("Genre names must be less than 50 characters.");
          event.preventDefault();
          break;
        }
      }

      if (
        currentPasswordInput.val() ||
        newPasswordInput.val() ||
        confirmNewPasswordInput.val()
      ) {
        if (
          !currentPasswordInput.val() ||
          !newPasswordInput.val() ||
          !confirmNewPasswordInput.val()
        ) {
          throw "All password fields must be provided.";
        }
        validation.checkPassword(newPasswordInput.val(), "New Password");
        validation.checkConfirmedPassword(
          newPasswordInput.val(),
          confirmNewPasswordInput.val()
        );
      }
      errorMessage.hide().text("");
    } catch (e) {
      errorMessage.text(e).show();
      event.preventDefault();
    }
    
  });
