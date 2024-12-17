const MAX_TAGS = 10;

let tagCount = 1;

$('#add-tag-button').click(function() {
    tagCount++;
    const newTagInput = `
        <label for="tag-input-${tagCount}">Tag ${tagCount}:</label>
        <input type="text" name="tag-input-${tagCount}" placeholder="Tag" id="tag-input-${tagCount}">
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
        $(`#tag-input-${tagCount}`).remove();
        tagCount--;
        $('#add-tag-button').attr('disabled', false);

        if (tagCount === 1) {
            $('#remove-tag-button').attr('disabled', true);
        }
    }
    $('#tagCount').val(tagCount);
});