document.addEventListener('DOMContentLoaded', function (event) {
    // by default, load all posts
    event.preventDefault();
    load_page('all_posts');

    // Use navigation button to load 'all posts'
    document.querySelector('#all_posts').addEventListener('click', function(event) {
        event.preventDefault();
        load_page('all_posts')
    });
    if (document.querySelector('form') != null) {
        document.querySelector('form').onsubmit = function () {
            const data = new FormData(form);
            fetch(`/posts`, {
                method: 'POST',
                headers: {'X-CSRFToken': csrftoken},
                mode: 'same-origin',
                body: JSON.stringify({
                    content: data.get("content"),
                })
            })
            .then(response => response.json())
            .then(result => {
                if (!result.ok) {
                    document.querySelector("#message").innerHTML = "Error: " + result.error
                }
                load_page('all_posts')
            })
            // catch errors and log to console
            .catch(error => {
                console.log('Error: ', error.error);
            });
            // prevent default submission
            return false;
        };
    };
});


function load_page(profile) {
    // Show the posts page and hide other views
    setupPostsPage(profile)
    document.querySelector('#posts-list').innerHTML = "";
    document.querySelector('#message').innerHTML = "";
    let current_page = 1;
    let rows_per_page = 10;
    // get posts
    fetch(`/posts/${profile}`)
        .then(response => response.json())
        .then(posts => {
            if (posts === undefined || posts.length == 0) {
                document.querySelector('#message').innerHTML = "No Posts Found";
            }
            else {
                // set number of rows_per_page and number of pages
                let current_page = 1;
                let page = current_page;
                let rows = 10;
                let rows_per_page = rows;
                let page_count = Math.ceil(posts.length / rows_per_page);

                // create 'previous' and 'next' buttons
                let element = document.createElement('div');
                element.innerHTML = `<button class="previous" id="previous" style="float:left;">Previous</button><button class="next" id="next" style="float:right;">Next</button>`

                // check if "previous" or "next" button pressed
                element.addEventListener('click', event => {
                    const element = event.target;
                    if (element.className === "previous") {
                        page = page - 1;
                        if (page > 0) {
                            document.querySelector('#posts-list').innerHTML = ""
                            // create display of posts
                            displayList(posts, rows_per_page, page, page_count)
                        }
                        else {
                            page = page + 1
                        }
                    }
                    else {
                        if (element.className === 'next') {
                            page = page + 1;
                            if (page <= page_count) {
                                document.querySelector('#posts-list').innerHTML = ""
                                // create display of posts
                                displayList(posts, rows_per_page, page, page_count)
                            }
                            else {
                                page = page - 1
                            }
                        }
                    }
                })
                document.querySelector('#pagination').append(element)
                // create display of posts
                displayList(posts, rows_per_page, page, page_count)
            }
        })
        .catch(error => {
            console.error("Error:", error)
        });
};


function displayList(posts, rows_per_page, page, page_count) {
    // determine which buttons to display (previous and next) based on which page being shown
    if (page_count != 1) {
        document.querySelector('#previous').style.display = 'block'
        document.querySelector('#next').style.display = 'block'
    }
    if (page >= page_count) {
        document.querySelector('#next').style.display = 'none'
    }
    if (page < 2) {
        document.querySelector('#previous').style.display = 'none'
    }
    // reset form
    if (document.querySelector('form') != null) {
        document.querySelector('form').reset()
    }
    // determine next page of posts
    page--;
    let start = rows_per_page * page;
    let end = start + rows_per_page;
    let paginatedItems = posts.slice(start, end)

    // display page with "rows_per_page" number of posts at a time
    for (let i = 0; i < paginatedItems.length; i++) {
        // create separate div for each post
        const element = document.createElement('div');
        // build each post
        userName = document.getElementById('user_name')
        if (!userName) {
             // no edit button
             element.innerHTML = `<div class="pbox"><strong><a href="#" class="posterNm">${paginatedItems[i].poster}</a></strong><br><span id="content">${paginatedItems[i].content}</span><br>${paginatedItems[i].postDate}<br><img src="https://www.publicdomainpictures.net/pictures/40000/velka/red-heart-1362916005N5Z.jpg" style="width:20px; height:20px;">
             <p id="tog_button" style="display:inline-block">${paginatedItems[i].likes}</p><button class="likes" id="likebtn" style="margin:2px;">Like</button><button class="unlikes" id="unlikebtn">Unlike</button></div>`;
        } else {
            userNm = document.getElementById('user_name').innerText
            if (userNm == paginatedItems[i].poster) {
                // if signed-in user's own post, add edit button
                element.innerHTML = `<div class="pbox"><strong><a href="#" class="posterNm">${paginatedItems[i].poster}</a></strong><br><button class="edit" id="edit;">Edit</button><br><span id="content" style="border:1px solid lightgrey; padding:3px;">${paginatedItems[i].content}</span><br>${paginatedItems[i].postDate}<br><img src="https://www.publicdomainpictures.net/pictures/40000/velka/red-heart-1362916005N5Z.jpg" style="width:20px; height:20px;">
                <p id="tog_button" style="display:inline-block">${paginatedItems[i].likes}</p><button class="likes" id="likebtn" style="margin:2px;">Like</button><button class="unlikes" id="unlikebtn">Unlike</button></div>`;
            } else {
                // no edit button
                element.innerHTML = `<div class="pbox"><strong><a href="#" class="posterNm">${paginatedItems[i].poster}</a></strong><br><span id="content">${paginatedItems[i].content}</span><br>${paginatedItems[i].postDate}<br><img src="https://www.publicdomainpictures.net/pictures/40000/velka/red-heart-1362916005N5Z.jpg" style="width:20px; height:20px;">
                <p id="tog_button" style="display:inline-block">${paginatedItems[i].likes}</p><button class="likes" id="likebtn" style="margin:2px;">Like</button><button class="unlikes" id="unlikebtn">Unlike</button></div>`;
            }
        }

        // add event listener for clicking on a poster or a button: like or unlike, edit or save
        element.addEventListener('click', event => {
            const element = event.target;
            // if click on Like Button
            if (element.className === 'likes') {
                let counter = parseInt(element.previousSibling.innerText)
                // add one to likes counter
                counter = counter + 1;
                element.previousSibling.innerText = counter

                // update 'likes' total in database
                var post_id = parseInt(paginatedItems[i].id)
                checkLike(post_id, counter)
            }
            // if click on Unlike Button
            else if (element.className === "unlikes") {
                let counter = parseInt(element.previousElementSibling.previousElementSibling.innerText)
                // subtract one from 'likes' counter
                if (counter > 0) {
                    counter = (counter - 1);
                    element.previousElementSibling.previousElementSibling.innerText = counter
                    // update like total in database
                    var post_id = parseInt(paginatedItems[i].id)
                    checkLike(post_id, counter)
                }
            }
            // if click on Edit
            else if (element.className === "edit") {
                let post_id = parseInt(paginatedItems[i].id)
                // set attribute of textarea to editable
                element.nextElementSibling.nextElementSibling.setAttribute('contenteditable', 'true')
                let texte = element.nextElementSibling.nextElementSibling.innerText
                // create temporary "save" button
                const ele = document.createElement('div')
                ele.innerHTML = `<button class="saveContent" id="saveContent">Save</button>`
                let eleEnd = ele.innerHTML
                // put save button next to edit button
                element.insertAdjacentHTML("afterend", eleEnd)
                // disable edit button so can't be clicked twice
                element.setAttribute('disabled', 'true')
            }
            // if click on save button
            else if (element.className === "saveContent") {
                let eleContent = element.nextElementSibling.nextElementSibling.innerText
                // turn off editable on textarea
                element.nextElementSibling.nextElementSibling.setAttribute("contenteditable", "false")
                // re-enable edit button
                element.previousElementSibling.disabled=false
                // remove save button
                element.remove()
                let post_id = parseInt(paginatedItems[i].id)
                // update 'content' in database
                editPost(post_id, eleContent)
            }
            // else if click on poster name to get all posts by a poster
            else if (element.className === "posterNm") {
                profile = paginatedItems[i].poster
                // set up header for profile page
                getPoster(profile)
            } else {
                var target = event.target.id
            }
        });
        document.querySelector('#posts-list').append(element);
    }
};


function setupPostsPage(profile) {
    document.querySelector('#posts-list').style.display = 'block';
    document.querySelector('#posts-buttons').style.display = 'none';
    document.querySelector("#pagination").innerHTML = "";
    if (profile == 'following') {
        document.querySelector('#new-post').style.display = 'none';
        document.querySelector('#post-name').innerHTML = 'Following:';
        document.querySelector('#post-first').innerHTML = "";
        document.querySelector('#message').innerHTML = "";
    }
    else if (profile == 'all_posts') {
        document.querySelector('#new-post').style.display = 'block';
        document.querySelector('#post-first').innerHTML = "";
    }
    else {
        document.querySelector('#posts-buttons').style.display = 'block';
        document.querySelector('#new-post').style.display = 'none';
        followers(profile);
    }
};


function getPoster(profile) {
    // set up header for profile page
    document.querySelector('#post-name').innerHTML = "Profile Page for"
    document.querySelector('#post-first').innerHTML = profile
    document.querySelector('#posts-buttons').style.display = 'block';
    // load posts for profile page
    load_page(profile)
};


function checkLike(post_id, counter) {
    // update 'likes' total in database
    fetch(`/posts/${post_id}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin',
        body: JSON.stringify({
            likes: counter
        })
    })
        .then(response => {
            if (!response.ok) {
                document.querySelector('#message').innerHTML = "Updating 'Likes' in database was Unsuccessful."
            }
        })
        .catch(error => {
            console.error('Error:', error);
        })
};

function editPost(post_id, eleContent) {
    // update 'content' in database
    post_id = parseInt(post_id)
    fetch(`/posts/${post_id}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin',
        body: JSON.stringify({
            content: eleContent
        })
    })
        .then(response => {
            if (!response.ok) {
                document.querySelector("#message").innerHTML = "Updating post content in database was unsuccessful."
            }
        })
        .catch(error => {
            console.error("Error:", error);
        })
};

function followers(profile) {
    document.querySelector('#followNos').innerHTML = "";
    document.querySelector('#message').innerHTML = "";
    let countUpdate = ""
    // get number of follows and followedby from database and whether to show follow & unfollow buttons
    fetch(`/followers/${profile}`)
        .then(response => response.json())
        .then(followers => {
            if (followers.error) {
                document.querySelector('#message').innerHTML = "Accessing database was unsuccessful. Error: " + followers.error
            }
            else {
                // create "follows" and "followed by" display
                const element = document.createElement('div')
                element.innerHTML = `<div class="followNums" id="followNums" style="display:inline-block; margin:10px; color:green;"><span id="followNos" style="display:inline-block;">Follows: ${followers.followsNo}</span><span id="followby" style="display:inline-block; margin:10px;">Followed By: <p id="lastp" style="display:inline-block;">${followers.followedByNo}</p></div>`;
                document.querySelector('#followNos').append(element);

                // create "follow" and "unfollow" buttons where applicable (profile != signed-in username)
                if (followers.showButtons == 'true') {
                    let html = `<button class="follow" id="follow" style="margin:10px;">Follow</button><button class="unfollow" id="unfollow">Unfollow</button>`;
                    const btn = document.getElementById('lastp')

                    // add event listener for "follow" and "unfollow" buttons
                    element.addEventListener('click', event => {
                        checkRecord(profile, event)
                    });
                    btn.insertAdjacentHTML("afterend", html)
                };
            }
        })
        .catch(error => {
            console.error("error:", error);
            document.querySelector('#message').innerHTML = "Accessing database was Unsuccessful. Error: " + followers.error
        });
};

async function checkRecord(profile, event) {
    const element = event.target
    document.querySelector('#message').innerHTML = "";
    // check if record exists with specific follower and followed

    try {
        const response = await fetch(`/checkRecord/${profile}`)
        const data = await response.json()
        if (response.status === 200) {
            if (element.className === 'follow') {
                // if new record
                if (data.newRecord === true) {
                    follow(event)
                } else if (data.newRecord === false && data.activity === false) {
                    // if not new record and not following already
                    follow(event)
                } else {
                    // no update to database
                    document.querySelector('#message').innerText = "Already Following"
                }
            } else if (element.className === 'unfollow') {
                if (data.newRecord === false) {
                    // if not new Record
                     if (data.activity === true) {
                        // if currently following
                        follow(event)
                     } else {
                        // if currently not following
                        document.querySelector('#message').innerText = "Already Unfollows"
                     }
                } else {
                    // no unfollow update
                    document.querySelector('#message').innerText = "Already Unfollows"
                }
            }
        } else {
            if (data.error) {
                console.log(data.error)
                document.querySelector('#message').innerText = data.error
            }
        }
    } catch(error) {
        console.log('error', error)
    }
};

function follow(event) {
    // update 'followed' and 'is_active' fields in database
    document.querySelector('#message').innerHTML = "";
    const element = event.target

    // get name of user to be followed/unfollowed
    profile = document.querySelector('#post-first').innerText
    // if 'follow', set activity to true
    if (element.id === 'follow') {
        activity = true;
        document.querySelector('#message').innerHTML = "Following " + profile
    }
    else if (element.id === 'unfollow') {
        // if 'unfollow', set activity to false
        activity = false
        document.querySelector('#message').innerHTML = "Unfollow Successful"
    }

    // set 'is_active' field in database to either true (follow) or false (unfollow)
    fetch(`/checkRecord/${profile}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin',
        body: JSON.stringify({
            followed: profile,
            is_active: activity
        })
    })
        .then(response => {
            if (!response.ok) {
                document.querySelector("#message").innerHTML = "Update was Not Successful."
            } else {
                updateCounter(event)
            }
        })
        .catch(error => {
            console.error("Error: ", error);
            document.querySelector('#message').innerHTML = "Update was unsuccessful. Error: " + error
        })
};

function updateCounter(event) {
    // if 'follow' or 'unfollow' button clicked
    const element = event.target
    if (element.className === 'follow') {
        // if follow button clicked, add one to counter
        let x = element.previousSibling.innerText
        let counter = parseInt(x)
        counter = counter + 1
        element.previousSibling.innerText = counter
    } else {
        if (element.className === 'unfollow') {
             // if 'unfollow' button clicked, subtract one from counter
             let x = element.previousSibling.previousSibling.innerText
             let counter = parseInt(x)
              counter = (counter - 1)
              element.previousSibling.previousSibling.innerText = counter
        }
    }
};
