const MAX_TAGS = 10;

let tagCount = 1;

$('#add-tag-button').click(function() {
    tagCount++;
    const newTagInput = `
        <label id="tag-input-${tagCount-1}-label" for="tag-input-${tagCount-1}">Tag ${tagCount-1}:</label>
        <input type="text" name="tags[]" placeholder="Tag" id="tag-input-${tagCount-1}" required>
    `;
    $(newTagInput).insertBefore('#add-tag-button');
    $('#remove-tag-button').attr('disabled', false);

    if (tagCount >= MAX_TAGS) {
        $('#add-tag-button').attr('disabled', true);
    }
    $('#tagCount').val(tagCount);
});

$('#remove-tag-button').click(function() {
    if (tagCount > 1) {
        $(`#tag-input-${tagCount-1}`).remove();
        $(`#tag-input-${tagCount-1}-label`).remove();
        tagCount--;
        $('#add-tag-button').attr('disabled', false);

        if (tagCount === 1) {
            $('#remove-tag-button').attr('disabled', true);
        }
    }
    $('#tagCount').val(tagCount);
});