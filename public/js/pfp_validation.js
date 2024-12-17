
  let editProfileForm = $("#edit-profile-form");

  let profilePictureInput = $("#profilePicture");

  const MAX_PFP_SIZE = 1000000; // 1 MB

  const allowedFileTypes = ["image/jpeg", "image/png"]

  editProfileForm.submit(function (event) {
    let file = profilePictureInput[0].files[0];
    
    if (file) {
      if (! allowedFileTypes.includes(file.type) ) {
        console.log(file.type)
        alert("Please upload a JPEG or PNG file.");
        event.preventDefault();
      } else if (file.size > MAX_PFP_SIZE) {
        alert("Profile picture is too large! Must be a JPEG image < 1MB.");
        event.preventDefault();
      }
    }
  });

