/**
 * Created by Administrator on 2021/1/6 0018.
 */
var simStatus;
var g_simStatusPINLocked = "pin lock";
var g_simStatusPUKLocked = "puk lock";
var g_simStatusPUKBlocked = "puk blocked";
var g_resultSuccess = 0;
var g_ajaxTimeout = 60000;
var key = "0123456789";
var errorTime;
function initPageStr(){
    $("#LogoStr").text(logo_login_text);
    $("#loginTitleStr").text(common_login);
    $("#usernameStr").text(common_username);
    $("#passwordStr").text(common_password);
    $("#alertBtn").text(str_forget_password);
}
initlanguage();
$(document).ready(function(){
    document.title = browser_title;
    initPageStr();
    getsimstatus();
    $("#username").focus();
    $("#login").val(common_login_btn).on("click",function() {
        login();
    });
    $("#alertBtn").on("click",function() {
        showLoginForgetPsdDialog(common_Prompt, str_forget_password_tips, function(){
            layer.closeAll();
        });
    });
    document.onkeydown = function (e) { 
        var theEvent = window.event || e;
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code == 13 && typeof($("#login").attr("disabled")) =="undefined") {
           login();
        }
    };
    $(".login-input").on("click", ShowPsw);
});

function ShowPsw(ev){
    var _id, classname, _ev = ev || event;
    var target = _ev.target || _ev.srcElemnt;
    classname = $(target).attr("class");
    if(classname != "showPwd"){
        return;
    }
    _id = $(target).attr("id");
    var biyanjing = $("#"+_id);
    var demoInput = biyanjing.prev()[0];
    if (demoInput.type == "password") {
        demoInput.type = "text";
        biyanjing[0].src = "../images/show.png";
    }else {
        demoInput.type = "password";
        biyanjing[0].src = "../images/hide.png";
    }
}
function checkUsernamePassword() {
    var _username = $.trim($("#username").val());
    var _pwd= $.trim($("#password").val());
    clearErrorMsg();
    if ( _username.length < 1) {
        $('.error-tips').show()
        $('#error-tips').text(str_system_curusernametips);
        return false;
    }
    if ( _pwd.length < 1 ) {
        $('.error-tips').show()
        $('#error-tips').text(str_system_curpsdtips1);
        return false;
    }
    return true;
}

function getsimstatus(){
    var postdata = ["mnet_sim_status"];
    ajaxGetJsonDataGoform(postdata, function(obj,data){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess) {
            simStatus = data.mnet_sim_status;
        }
    }, {
        async: false
    });
}

function login(){
    getPrikey();
    var ret = checkUsernamePassword();
    if (ret) {
        var data = $(".login-input").serializeArray();
        var _obj = {};
        var postdata;
        $.each(data, function(index, val){
            val.value = $.trim(val.value);
            _obj[val.name] = hex_hmac_md5(key,val.value);
        });
        postdata = JSON.stringify(_obj);
    } else {
        return false;
    }
    saveAjaxJsonData("/goform/login", postdata, function(obj){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            pageRedirect();
        } else {
            switch (obj.remain_times){
                case 4:
                    $('.error-tips').show();
                    $('#error-tips').text(str_login_four_error);
                    break;
                case 3:
                    $('.error-tips').show();
                    $('#error-tips').text(str_login_three_error);
                    break;
                case 2:
                    $('.error-tips').show();
                    $('#error-tips').text(str_login_two_error);
                    break;
                case 1:
                    $('.error-tips').show();
                    $('#error-tips').text(str_login_one_error);
                    break;
                case 0:
                    errorTime = obj.remain_secs;
                    $('.error-tips').show();
                    $('#error-tips').text(str_login_num_error);
                    $("#login").attr("disabled","disabled");
                    logintimeout();
                    break;
                default :
                    $('.error-tips').show();
                    $('#error-tips').text(str_login_error);
                    break;
            }
        }
    }, {
        async: false
    });
    return false;
}
function logintimeout(){
    if(errorTime == 0){
        $("#login").val(common_login_btn).removeAttr("disabled");
        $('.error-tips').hide();
        return;
    }
    $("#login").val(common_login_btn + '('+errorTime+')');
    errorTime--;
    setTimeout(logintimeout,1000);
}
function clearErrorMsg(){
    $("#error-msg").remove();
}
doIECompatibility();
function doIECompatibility(){
    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === "[object Array]";
        }
    }
}
function closeDialog() {
    $("#pop-window").remove();
}
function pageRedirect(){
    var postdata = ["mnet_sim_status","webs_bootstrap_wizard"];
    ajaxGetJsonData(postdata, function(obj,data){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess) {
            var simStatus = data.mnet_sim_status;
            var g_quickguide = data.webs_bootstrap_wizard;
            if(simStatus == g_simStatusPUKLocked){
                window.location.replace("../html/settings.html#pukrequired");
                return;
            } else if (simStatus == g_simStatusPINLocked){
                window.location.replace("../html/settings.html#pinrequired");
                return;
            } else if(g_quickguide == "true"){
                window.location.replace("../html/quickguide.html");
                return;
            } else {
                window.location.replace("../html/settings.html#status");
                return;
            }
        }
    }, {
        async: false
    });
}