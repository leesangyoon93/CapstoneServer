/**
 * Created by Sangyoon on 2016-09-03.
 */
$(document).ready(function() {
    $('.menu_group').click(function() {
        alert('그룹 메뉴 클릭');
    });
    
    $('.form_groupAdd').submit(function() {
        $.ajax({
            url: '/getGroup',
            type: 'POST',
            data: $(this).serializeArray(),
            success: function(data) {
                console.log(data);
                var groupList = $('.wrap_groupList');
                groupList.children().remove();
                if(data.result != 'fail') {
                    console.log('success');
                    for (var i in data.groups) {
                        console.log(data.groups[i].roomName);
                        var group = "<div>이름 - " + data.groups[i].roomName + "</div>";
                        group += "<div>주소 - " + data.groups[i].address + "</div>";
                        groupList.append($(group));
                    }
                }
                else
                    groupList.append($("<div> 검색 결과가 없습니다. </div>"));
            }
            
        })
    })
});