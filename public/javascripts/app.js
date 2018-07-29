const debounce = (fn, time) => {
    let timeout;
    return function() {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    }
};
$(document).ready(() => {

    /* Registration events */

    
    
    /* GitHub API events */
    $(".js-search-user").focus();
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    let lastKeyupValue = '';
    $(document).on('keyup', '.js-search-user', function(event) {
        const value = $(this).val();
        const query = {
            search: value
        };

        if (value.length >= 3 && lastKeyupValue !== value && event.keyCode === 13) {
            $(".loader").show();

            fetch('/git/getUesrs', {
                credentials: 'same-origin',
                method: 'POST',
                headers: { "Content-Type": "application/json", "CSRF-Token": csrfToken },
                body: JSON.stringify(query)
            })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                const json = JSON.parse(data);
                $.get('templates/user_template.ejs',(template) => {
                    const compilerFunction = ejs.compile(template);
                    const rendered = compilerFunction({users: json.items});

                    const user_count = json.total_count;
                    let message = `${user_count} users found`;
                    if(user_count) {
                        // $(".js-user-count").removeClass(['class^="alert-"']).addClass('alert-primary').text(message)
                        message += ` — check it out!`;
                        $(".js-user-count").removeClass('alert-danger').addClass('alert-primary').text(message);
                    } else {
                        $(".js-user-count").removeClass('alert-primary').addClass('alert-danger').text(message);
                    }
                    
                    $(".js-user-card-group").html(rendered);
                    $(".loader").hide();
                });
            })
            .catch((error) => console.log(error));
        }
    });

    $(document).on('click','.js-repo-url',function(event) {
        event.preventDefault();
        const repo_url = $(this).attr('url');
        const query = {
            repo_url: repo_url
        };
        $(".modal, .modal-backdrop").remove();
        $(".loader").show();
        fetch('/git/getUserRepoDetails',{
            credentials: 'same-origin',
            method: 'POST',
            headers: {'Content-Type': 'application/json', "CSRF-Token": csrfToken },
            body: JSON.stringify(query)
        })
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            const json = JSON.parse(data);
            $.get('templates/modals/repo_list.ejs', (template) => {
                const compilerFunction = ejs.compile(template);
                const rendered = compilerFunction({lists: json});

                $("body").append(rendered);
                $("#repoList").modal('show');
                $(".loader").hide();
            });
        })
        .catch(error => console.log(error));
    });

    $(document).on('click','.js-user', function(event) {
        event.preventDefault();
        const info_url = $(this).attr('url');
        const query = {
            info_url
        };
        $(".modal, .modal-backdrop").remove();
        $(".loader").show();
        fetch('/git/getUserDetails',{
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "CSRF-Token": csrfToken
            },
            body: JSON.stringify(query)
        })
        .then(response => response.json())
        .then(data => {
            
            const json = JSON.parse(data);

            $.get('templates/modals/user.ejs', (template) => {
                const compilerFunction = ejs.compile(template);
                const rendered = compilerFunction(json);

                $("body").append(rendered);
                $("#userInfo").modal('show');
                $(".loader").hide();
            })
        })
        .catch(error => console.log(error));
    });
});