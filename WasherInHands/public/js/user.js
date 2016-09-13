/**
 * Created by Sangyoon on 2016-09-02.
 */
$(document).ready(function () {
    $('.form_register').submit(function () {
        var registerData = $(this).serializeArray();
        if(registerData[2].value == registerData[3].value) {
            $.ajax({
                url: '/register',
                type: 'POST',
                data: registerData,
                success: function(data) {
                    // 중복검사 추가하기
                    if(data.result == 'success')
                        window.location.href = '/main/';
                    else alert("이미 사용하고 있는 아이디입니다.");
                }
            })
        }
        else alert('비밀번호가 일치하지 않습니다.');
    });

    $('.form_login').submit(function () {
        $.ajax({
            url: '/login',
            type: 'POST',
            data: $(this).serializeArray(),
            success: function (data)  {
                if(data.result == 'success')
                    window.location.href = '/main/';
                else
                    alert('아이디가 존재하지 않거나 비밀번호가 잘못되었습니다.');
            }
        })
    });
    
    // $('#btn_logout').click(function() {
    //     window.location.href = '/logout';
    // });
    
    $('.form_passwordChange').submit(function() {
        var changeData = $(this).serializeArray();
        
        if(changeData[1].value == changeData[2].value) {
            $.ajax({
                url: '/changePassword',
                type: 'POST',
                data: changeData,
                success: function(data) {
                    if(data.result == 'fail')
                        alert('현재 비밀번호가 일치하지 않습니다.');
                    else {
                        alert('변경완료. 재로그인 해주세요');
                        window.location.href = '/';
                    }
                }
            })
        }
        else alert('변경할 비밀번호가 일치하지 않습니다.');
    })
});