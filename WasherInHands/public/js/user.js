/**
 * Created by Sangyoon on 2016-09-02.
 */
$(document).ready(function () {
    $.ajax({
        type: 'GET',
        url: '/getUser',
        success: function(data) {
            if(data.result != 'fail') {
                $.ajax({
                    type: 'GET',
                    url: '/showJoinedGroup',
                    success: function(data) {
                        for(var i in data)
                            $('#wrap_groupList').append("<p>" + data[i].roomName + "</p>");
                        
                        $('#wrap_groupList').find('p').click(function() {
                            var roomName = $(this).html();
                            $.ajax({
                                url: '/showGroup',
                                type: 'POST',
                                data: {roomName: roomName},
                                success: function(data) {
                                    $('#currentRoom').html(data.roomName);
                                    $.ajax({
                                        type: 'GET',
                                        url: '/showGroupMember',
                                        success: function(data) {
                                            console.log(data);
                                            for(var i in data) {
                                                $('#wrap_groupMember').append("<p>" + data[i].userName + "</p>");
                                            }
                                        }
                                    })
                                }
                            })
                        })
                    }
                })
            }
        }
    })
    
    $.ajax({
        type: 'GET',
        url: '/showAllGroup',
        success: function(data) {
            for(var i in data) {
                $('#wrap_allGroupList').append("<p>" + data[i].roomName + "</p>");
                
                $('#wrap_allGroupList').find('p').click(function() {
                    $.ajax({
                        type: 'POST',
                        url: '/joinGroup',
                        data: {roomName: $(this).html()},
                        success: function(data) {
                            window.location.href = '/';
                        }
                    })
                })
            }
        }
    })
    
    $('#deleteGroup').click(function() {
        $.ajax({
            type: 'GET',
            url: '/deleteGroup',
            success: function(data) {
                window.location.href = '/';
            }
        })
    })
});