function likePost(postId) {
    $("#like_button").toggleClass('clicked');
    if ($("#like_button").hasClass('clicked')) {
        $.ajax({
            type: 'POST',
            url: `/posts/${postId}/like`,
            data: { },
            success: function() {
                console.log('Post liked successfully');
            },
            error: function() {
                $("#like_button").toggleClass('clicked');
                alert('Failed to like the post');
            }.bind(this)
        });
    } else {
        $.ajax({
            type: 'POST',
            url: `/posts/${postId}/like`,
            data: { reverse: true },
            success: function() {
                console.log('Post unliked successfully');
            },
            error: function() {
                $("#like_button").toggleClass('clicked');
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
            data: { },
            success: function() {
                console.log('Post disliked successfully');
            },
            error: function() {
                $("#dislike_button").toggleClass('clicked');
                alert('Failed to dislike the post');
            }
        });
    } else {
        $.ajax({
            type: 'POST',
            url: `/posts/${postId}/dislike`,
            data: { reverse: true },
            success: function() {
                console.log('Post undisliked successfully');
            },
            error: function() {
                $("#dislike_button").toggleClass('clicked');
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
            data: { },
            success: function() {
                console.log('Post favorited successfully');
            },
            error: function() {
                $("#favorite_button").toggleClass('clicked');
                alert('Failed to favorite the post');
            }
        });
    } else {
        $.ajax({
            type: 'POST',
            url: `/posts/${postId}/favorite`,
            data: { reverse: true },
            success: function() {
                console.log('Post unfavorited successfully');
            },
            error: function() {
                $("#favorite_button").toggleClass('clicked');
                alert('Failed to unfavorite the post');
            }
        });
    }
}