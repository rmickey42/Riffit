let editProfileForm = $("#edit-profile-form");

let profilePictureInput = $("#profilePicture");

editProfileForm.submit(function (event) {
    let file = profilePictureInput.files[0];
    if (file && file.type !== "image/jpeg") {
      alert("Please upload a JPEG file.");
      event.preventDefault();
    }
  });