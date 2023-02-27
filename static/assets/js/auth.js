$(document).ready(function(){
    $('#usercheck').submit(function(e){
        e.preventDefault();
        $.ajax({
            type: "post",
            url: $(this).attr('action'),
            data: $(this).serialize(),
            success: function(response){
                if(response.response.page=="usercheck"){
                
                    if(response.response.status=="yes"){
                    
                        $(".login-div-btn").css("display", "flex")
                        $("#continueBtn").hide()
                        $('.forgot-username').hide()
                        $(".incorrect-username-para").remove()
                        $(".pass-div").css("display", "block")
                        $(".admin-login-form").attr("id", "userlogin")
                        $(".admin-login-form").attr("action", response.response.login_url)
                        $("#username").removeClass("invalid-input")
                        $(".username-div").removeClass("invalid-username-div")
                       
                        $('.fa-eye').mousedown(function () {
                            $('#password').attr('type', 'text'); 
                         });
                         $('.fa-eye').mouseup(function () {
                            $('#password').attr('type', 'password'); 
                         });
                    }else{
                        $(".invalid-msg-div").empty().append(`
                            <p class="text-danger incorrect-username-para fs-13 mt-2 mb-0">The username you entered is incorrect.</p>
                        `)
                        $("#username").addClass("invalid-input")
                        $(".username-div").addClass("invalid-username-div")
                        
                        
                    }
                }else{
                    if(response.response.dash_url){
                        url=window.location.origin+response.response.dash_url
                        window.location.replace(url);
                    }else{
                        $(".invalid-pass-text").empty().append(`
                            <p class="text-danger incorrect-password-para fs-13 mb-2 mb-0">The password you entered is incorrect.</p>
                        `)
                        $("#password").addClass("invalid-input")
                    }
                    
                    
                }
            },
            error: function(){
                if(response.response.page=="usercheck"){
                    alert('error');
                }else{
                    $(".login-div-btn").append(`
                            <p class="text-danger incorrect-pass-para fs-13 mt-2 mb-0">The password you entered is incorrect.</p>
                        `)
                }
            }
        })
    })
})



// back to username page
$("#backBtn").click(function(){
    $(".pass-div").css("display", "none");
    $(".login-div-btn").css("display", "none");
    $("#continueBtn").show();
    $('.forgot-username').show();
    var url=window.location.origin+"/account/check-username/"
    $('.admin-login-form').attr('action', url);
})



// $("#sendPassReset").click(function(e){
//     e.preventDefault()
//     console.log("hello pass reset")
// })