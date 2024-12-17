function likePost(postId) {
    $("#like_button").toggleClass('clicked');
    if ($("#like_button").hasClass('clicked')) {
        $.ajax({
            type: 'POST',
            url: `/posts/${postId}/like`,
            data: {},
            success: function () {
                console.log('Post liked successfully');
            },
            error: function () {
                alert('Failed to like the post');
            }.bind(this)
        });
    } else {
        $.ajax({
            type: 'POST',
            url: `/posts/${postId}/like`,
            data: { reverse: true },
            success: function () {
                console.log('Post unliked successfully');
            },
            error: function () {
                alert('Failed to unlike the post');
            }.bind(this)
        });
    }
}

function dislikePost(postId) {
    $("#dislike_button").toggleClass('clicked');
    if ($("#dislike_button").hasClass('clicked')) {
        $.ajax({
            type: 'POST',
            url: `/posts/${postId}/dislike`,
            data: {},
            success: function () {
                console.log('Post disliked successfully');
            },
            error: function () {
                alert('Failed to dislike the post');
            }
        });
    } else {
        $.ajax({
            type: 'POST',
            url: `/posts/${postId}/dislike`,
            data: { reverse: true },
            success: function () {
                console.log('Post undisliked successfully');
            },
            error: function () {
                alert('Failed to undislike the post');
            }
        });
    }
}

function favoritePost(postId) {
    $("#favorite_button").toggleClass('clicked');
    if ($("#favorite_button").hasClass('clicked')) {
        $.ajax({
            type: 'POST',
            url: `/posts/${postId}/favorite`,
            data: {},
            success: function () {
                console.log('Post favorited successfully');
            },
            error: function () {
                alert('Failed to favorite the post');
            }
        });
    } else {
        $.ajax({
            type: 'POST',
            url: `/posts/${postId}/favorite`,
            data: { reverse: true },
            success: function () {
                console.log('Post unfavorited successfully');
            },
            error: function () {
                alert('Failed to unfavorite the post');
            }
        });
    }
}

const commentsView = $('#commentsView');
const commentsList = $('#commentsList');
const commentsButton = $('#submit_comment');
let post = null;
let user = null;
let hidden = true;

function showCommentsView(postId, userId) {
    if (!hidden) {
        hidden = true;
        commentsView.toggle();
        return;
    } else {
        post = postId;
        user = userId;

        commentsList.empty();
        $.ajax({
            type: 'GET',
            url: `/posts/${postId}/comments`,
            success: function (data) {
                data.forEach(comment => {
                    if (comment.userId === userId) {
                        commentsList.append(`<li><a href="/users/me">You</a>: ${comment.content}</li>`);
                    } else {
                        commentsList.append(`<li><a href="/users/${comment.userId}">${comment.username}</a>: ${comment.content}</li>`);
                    }
                });
                commentsView.toggle();
                hidden = false;
            },
            error: function () {
                alert('Failed to load comments');
            }
        });
    }
}

commentsButton.click(function (event) {
    event.preventDefault();

    const content = $('#comment_content').val().trim();

    if(content.length === 0) {
        alert('Comment cannot be empty');
        return;
    }

    $.ajax({
        type: 'POST',
        url: `/posts/${post}/comments`,
        data: { comment: content, userId: user },
        success: function () {
            console.log('Comment added successfully');
            commentsList.append(`<li><a href="/users/me">You</a>: ${content}</li>`);
            $('#comment_content').val('');
        },
        error: function () {
            alert('Failed to add comment');
        }
    });
});

commentsView.toggle();