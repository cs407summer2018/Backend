
$(document).ready(function() {
    $("#target").click(function () {
        $.get('/test', function(res) {
            alert(res.msg)
        })
    });
});


