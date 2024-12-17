// Tag input fields

const MAX_TAGS = 10;
let tagCount = parseInt($('#tagCount').val());

$('#add-tag-button').click(function () {
    tagCount++;
    const newTagInput = `
        <label id="tag-input-${tagCount - 1}-label" for="tag-input-${tagCount - 1}">Tag ${tagCount - 1}:</label>
        <input type="text" name="tags[]" placeholder="Tag" id="tag-input-${tagCount - 1}" required>
    `;
    $(newTagInput).insertBefore('#add-tag-button');
    $('#remove-tag-button').attr('disabled', false);

    if (tagCount >= MAX_TAGS) {
        $('#add-tag-button').attr('disabled', true);
    }
    $('#tagCount').val(tagCount);
});

$('#remove-tag-button').click(function () {
    if (tagCount > 1) {
        $(`#tag-input-${tagCount - 1}`).remove();
        $(`#tag-input-${tagCount - 1}-label`).remove();
        tagCount--;
        $('#add-tag-button').attr('disabled', false);

        if (tagCount === 1) {
            $('#remove-tag-button').attr('disabled', true);
        }
    }
    $('#tagCount').val(tagCount);
});

// Form validation

const MAX_AUDIO_SIZE = 5000000; // 5MB

$('#post-create-form').submit(function (event) {
    let isValid = true;
    const title = $('#title').val();
    const instrument = $('#instrument').val();
    const tags = $('input[name="tags[]"]').map(function () { return $(this).val(); }).get();

    const audio = $('#audio')[0].files[0];

    // Validate audio
    if (!audio) {
        isValid = false;
        alert('Audio file must be uploaded.');
    }

    if (file.type !== 'audio/mpeg') {
        console.log(file.type)
        alert("Please upload a MP3 file.");
        event.preventDefault();
    } else if (file.size > MAX_AUDIO_SIZE) {
        alert("Audio size is too large! Must be an MP3 file < 5MB.");
        event.preventDefault();
    }

    // Validate title
    if (title && title.trim().length === 0) {
        isValid = false;
        alert('Title cannot be empty.');
    }

    // Notation not required
    // Key not required

    // Validate instrument
    if (instrument && instrument.trim().length === 0) {
        isValid = false;
        alert('Instrument cannot be empty.');
    }

    // Validate tags
    if (tags.length === 0 || tags.some(tag => tag.trim().length < 2 || tag.trim().length > 15)) {
        isValid = false;
        alert('All tags must be filled out and between 2 and 15 characters.');
    }

    if (!isValid) {
        event.preventDefault();
    }
});

$('#post-edit-form').submit(function (event) {
    let isValid = true;
    const title = $('#title').val();
    const instrument = $('#instrument').val();
    const tags = $('input[name="tags[]"]').map(function () { return $(this).val(); }).get();

    // Validate title
    if (title && title.trim().length === 0) {
        isValid = false;
        alert('Title cannot be empty.');
    }

    // Notation not required
    // Key not required

    // Validate instrument
    if (instrument && instrument.trim().length === 0) {
        isValid = false;
        alert('Instrument cannot be empty.');
    }

    // Validate tags
    if (tags.length === 0 || tags.some(tag => tag.trim().length < 2 || tag.trim().length > 15)) {
        isValid = false;
        alert('All tags must be filled out and between 2 and 15 characters.');
    }

    if (!isValid) {
        event.preventDefault();
    }
});

$('#search-form').submit(function (event) {
    let isValid = true;
    const tags = $('input[name="tags[]"]').map(function () { return $(this).val(); }).get();

    // Validate tags
    if (tags.length === 0 || tags.some(tag => tag.trim().length < 2 || tag.trim().length > 15)) {
        isValid = false;
        alert('All tags must be filled out and between 2 and 15 characters.');
    }

    if (!isValid) {
        event.preventDefault();
    }
});