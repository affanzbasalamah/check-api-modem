/**
 * Created by Administrator on 2017/8/16 0016.
 */
var g_resultSuccess = 0;
var g_resultFailed = 1;
var success_icon = 1;
var failed_icon = 2;
var g_globalConfigData;
var g_menuMap;
var g_menuRoute = [];
var g_currentUrl = "";
var g_maxMenuNum = 3;
var g_pageTitle;
var g_ipv6_support = 1;
var g_ipv6_notSupport = 0;
var g_ipv6Status = g_ipv6_notSupport;
var wpsFirstShowFlag;
var g_wpsResultProcessing = "wps_processing";
var g_ajaxTimeout = 60000;
var g_networkModeNONE = "no service";
var g_networkModeCDMA = "cdma";
var g_networkModeEVDO = "evdo";
var g_networkModeGSM = "gsm";
var g_networkModeWCDMA = "wcdma";
var g_networkModeLTE = "lte";
var g_networkModeTDSCDMA = "td-scdma";
var g_networkModeNR5G = "nr5g";
var g_networkModeNSA = "nsa";
var g_operatorNameHome;
var g_login = 1;
var g_logout = 0;
var pubilc_postdata = [];
var public_response_data;
var g_curLoginStatus = 0;
var g_current_user;
var g_encrytp = 1;
var g_encrytp_state = 0;
var g_simStatusYes = "ready";
var g_simstatus_absent = "absent";
var g_simstatus_init = "init";
var g_simStatusPINLocked = "pin lock";
var g_simStatusPINUNLock = "pin unlock";
var g_simStatusPUKLocked = "puk lock";
var g_simStatusPUKBlocked = "puk blocked";
var g_networkStatusTimer;
var g_logoutTime;
var g_logoutTimer;
var g_allTimer = [];
var g_curSimStatus;
var g_curSimImsi;
var g_sigLevel;
var g_sigLevelnoservice = "no service";
var g_roamStatus;
var g_operatorName;
var g_networkType;
var g_curNetworkType;
var g_curNetModeType;
var g_curNetModeType0="0";
var g_curNetModeType2="2G";
var g_curNetModeType3="3G";
var g_curNetModeType4="4G";
var g_curNetModeType5="5G";
var qasyncflag = false;

var g_curWifiStatusOn = "open";
var g_curWifiStatusOff = "close";
var g_dialupConed = "connected";
var g_dialupDisConed = "disconnected";
var g_curDataStatus = g_dialupDisConed;
var g_internetSIM = "mobile_data";
var g_internetETH = "ethernet";

var g_newVerisonIstatus;
var g_newVerisonFound= "found new version";
var g_newVerisonDowning= "downloading";
var g_newVerisonDownsuc= "download successed";
var g_newVerisonDownfailed= "download failed";
var g_newVerisonDownpending= "download pending";
var g_curInternetMode;
var g_getDialStatus = 0;
var dialog_align_left="left";

var common_lang_en_us = "English";
var common_lang_ar_sa = "العربية";


var homeTimeout;
var devicestatusTimeout;
var rfparamtersTimeout;
var getsntpTimeout;
var initsntpTimeout;
var initstatisticeTimeout;
var checkwpsTimeout;
var vpnTimeout;
var smsTimeout;
var getsmsTimeout;
var secondTimeout;

var checkUpdateStatus_timeout;
var g_configUrationStrMode;
function clearPageTimeout(){
    clearTimeout(homeTimeout);
    clearTimeout(devicestatusTimeout);
    clearTimeout(rfparamtersTimeout);
    clearTimeout(getsntpTimeout);
    clearTimeout(initsntpTimeout);
    clearTimeout(initstatisticeTimeout);
    clearTimeout(checkwpsTimeout);
    clearTimeout(vpnTimeout);
    clearTimeout(checkUpdateStatus_timeout);
    clearTimeout(smsTimeout);
    clearTimeout(getsmsTimeout);
}
/*-------Wi-Fi个数--------*/
var wifi_num_2g;
var wifi_num_5g;
var wifi_num_total = 2;
/*-------pin lock 动态配置开关--------*/
var pin_lock_switch;
var pin_lock_switch_on = "on";
var pin_lock_switch_off = "off";
var pin_lock_status;
var pin_lock_status_valid = "valid";
var pin_lock_status_invalid = "invalid";
/*-------语音选项动态配置开关--------*/
var voice_switch_on = "on";
var voice_switch_off = "off";
var voice_all_switch = voice_switch_on;
var voice_cs_switch = voice_switch_on;
var voice_volte_switch = voice_switch_on;
var voice_voip_switch = voice_switch_on;

var leftmenuTitle;
var pageTitle;
function transformtime(time) {
    var M, H, D;
    var seconds = time % 60;
    var minutes = parseInt((time / 60) % 60);
    var hours = parseInt(((time / 60) / 60) % 24);
    var days = parseInt(((time / 60) / 60) / 24);
    if(minutes == 0 || minutes == 1){
        M = minutes + str_minute;
    }else{
        M = minutes + str_minutes;
    }
    if(hours == 0 || hours == 1){
        H = hours + str_hour;
    }else{
        H = hours + str_hours;
    }
    if(days == 0 || days == 1){
        D = days + str_day;
    }else{
        D = days + str_days;
    }
    if(days == 0 && hours == 0){
        return M;
    }else if(days == 0){
        return H + M;
    }else{
        return D + H + M;
    }
}
/*
 * ajax方法
 * */
function data2Object(data){
    var obj;
    if (data){
        if (typeof data === "object"){
            obj = data;
        } else {
            try{
                obj = JSON.parse(data);
            } catch(e){
                obj = {};
            }
        }
    } else {
        obj = {};
    }
    return obj;
}
function getText(text){
    if (typeof text === "string" && text.length !== 0) {
        document.write(text);
    } else {
        document.write("Error: Can't get string!");
    }
}
function getCurrentUrl() {
    var url = window.location.pathname;
    var filenameArry = url.split("/");
    var filename = filenameArry[filenameArry.length-1];
    g_currentUrl = filename.split(".")[0];
}
function clickMenuMainRedirect(ev){
    var redirect = false;
    var _ev = ev || event;
    var target = _ev.target || _ev.srcElemnt;
    var id = target.id || $(target).parent().attr("id");

    switch(id) {
        case "settings":
            if (g_curLoginStatus === g_logout){
                window.location.replace("../common/login.html");
            }
            redirect = true;
            break;
        case "home":
            redirect = true;
            break;
        default:
            redirect =  false;
            break;
    }
    return redirect;
}
function getSimStatus(){
    closeDialog();
    var sinstatus = [g_simstatus_init,g_simstatus_absent];
    if (sinstatus.includes(g_curSimStatus)) {
        showTipsDialog(common_info,str_dialup_no_simtips,redirect);
    } else if(g_curSimStatus == g_simStatusPINLocked){
        window.location.replace("../html/settings.html#pinrequired");
        return;
    }else if(g_curSimStatus == g_simStatusPUKLocked){
        window.location.replace("../html/settings.html#pukrequired");
        return;
    }else if(g_curSimStatus == g_simStatusPUKBlocked){
        showTipsDialog(common_info,str_dialup_no_simtips,redirect);
        return;
    }
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
function getUnreadCount() {
    getAjaxJsonData("/action/sms_get_sms_count", function(obj){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            var data = obj.data;
            var inboxUnreadCount = data.sms_unread_count;
            if(inboxUnreadCount>0){
                $("#sms_Num").text(inboxUnreadCount);
                $("#sms_Num").show();
                var  title=str_message_not_read.replace("%d",inboxUnreadCount);
                $("#sms-status").attr("title", title);
                $("#sms-status").show();
            }
            else {
                $("#sms_Num").hide();
                $("#sms-status").hide();
            }
        }
    }, {
        async: true
    });
}
pubilc_postdata = ["fota_curr_istatus", "wifi_work_status", "mnet_sim_status", "rt_internet_mode", "mnet_sig_level", "mnet_roam_status", "mnet_operator_name", "mnet_sysmode", "dialup_dial_status","sms_unread_count","rt_eth_conn_info"];
function setTimeout3second(){
    if(typeof(g_globalConfigData.config.battery_enabled) != "undefined" && g_globalConfigData.config.battery_enabled == 1) {
        pubilc_postdata = ["fota_curr_istatus", "wifi_work_status", "mnet_sim_status", "rt_internet_mode", "mnet_sig_level", "mnet_roam_status", "mnet_operator_name", "mnet_sysmode", "dialup_dial_status","sms_unread_count","device_battery_charge_status","device_battery_level","device_battery_level_percent","rt_eth_conn_info"];
    }
    ajaxGetJsonData(pubilc_postdata, function(obj,data){
        if(typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            public_response_data = data;
        }
    }, {
        async: qasyncflag,
        timeout:2000
    });

    initIconInfo();
    secondTimeout = setTimeout(setTimeout3second,3000);
}
function initImg(id, title, src){
    if(id == "#signal-simg"){
        $(id).attr("title",signal_title).show().children("img").attr("src", src); 
    } else {
        $(id).attr("title",title).show().children("img").attr("src", src);
    }
}

function checkWPSStatus(){
    ajaxGetJsonData(["wifi_wps_status"], function(obj,data){
        if(typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            switch(data.wifi_wps_status){
                case g_wpsResultProcessing:
                        wpsFirstShowFlag = false;
                        showWaitingDialog(common_waiting, str_wlan_advancesettings_wpsconning);
                    break;
                case "wps_success":
                    if(wpsFirstShowFlag == false){
                        wpsFirstShowFlag = true;
                        showResultDialog(common_result, wps_connect_success, success_icon, 3000);
                    }
                    break;
                case "wps_fail":
                case "wps_overlap":
                case "wps_invalid_params":
                    if(wpsFirstShowFlag == false){
                        wpsFirstShowFlag = true;
                        showResultDialog(common_result, wps_connect_failed, failed_icon, 3000);
                    }
                    break;
                case "wps_timeout":
                    if(wpsFirstShowFlag == false){
                        wpsFirstShowFlag = true;
                        showResultDialog(common_result, wps_connect_timeout, failed_icon, 3000);
                    }
                    break;
                default:
                    wpsFirstShowFlag = true;
                    break;
            }
        }
    }, {
        async: true,
        timeout:3000
    });
    checkwpsTimeout = setTimeout(checkWPSStatus, 5000);
}
function initIconInfo(){
    var simStatusInvalid = $("#signal-simg,#roam,#netmode");
    var $internetModeImg = $("#internet-mode").children("img");
    var data = public_response_data;
    g_curSimStatus = data.mnet_sim_status;
    g_curInternetMode = data.rt_internet_mode;
    g_sigLevel = data.mnet_sig_level;
    g_roamStatus = data.mnet_roam_status;
    g_operatorNameHome = data.mnet_operator_name;
    g_networkType = data.mnet_sysmode;
    g_newVerisonIstatus = data.fota_curr_istatus;
    switch(data.wifi_work_status){
        case g_curWifiStatusOn:
            initImg("#wifi-status", str_wifi_on, "../images/wifi_on.png");
            break;
        case g_curWifiStatusOff:
            initImg("#wifi-status", str_wifi_off, "../images/wifi_off.png");
            break;
        default:
            initImg("#wifi-status", str_wifi_off, "../images/wifi_off.png");
            break;
    }
    if (g_networkType == g_networkModeNONE){
        g_curNetworkType = str_home_noservice;
        g_curNetModeType=g_curNetModeType0;
    } else if (g_networkType == g_networkModeCDMA || g_networkType == g_networkModeGSM) {
        g_curNetworkType = common_2G;
        g_curNetModeType=g_curNetModeType2;
    } else if (g_networkType == g_networkModeEVDO ||
        g_networkType == g_networkModeWCDMA ||
        g_networkType == g_networkModeTDSCDMA)
    {
        g_curNetworkType = common_3G;
        g_curNetModeType=g_curNetModeType3;
    } else if (g_networkType == g_networkModeLTE) {
        g_curNetworkType = common_4G;
        g_curNetModeType=g_curNetModeType4;
    } else if(g_networkType == g_networkModeNR5G || g_networkType == g_networkModeNSA){
        g_curNetworkType = common_5G;
        g_curNetModeType=g_curNetModeType5;
    } else {
        g_curNetworkType = common_limited;
        g_curNetModeType=g_curNetModeType0;
    }
    switch(g_curInternetMode){
        case g_internetETH:
            if(typeof(public_response_data.rt_eth_conn_info) != "undefined"){
                var internet_info_arry = public_response_data.rt_eth_conn_info.split(",");
                if(internet_info_arry[0] ==g_dialupConed ){
            $internetModeImg.attr({"src":"../images/ethernet_small.png",
                "title":str_internetMode_ethernet_mode});
                } else {
                     $internetModeImg.attr({"src":"../images/ethernet_small_v.png",
                        "title":str_internetMode_ethernet_mode});
                }
            } else {
                $internetModeImg.attr({"src":"../images/ethernet_small_v.png",
                        "title":str_internetMode_ethernet_mode});
            }
            break;
        case g_internetSIM:
            g_curDataStatus = public_response_data.dialup_dial_status;
            switch(g_curDataStatus){
                case g_dialupConed:
                    $internetModeImg.attr({"src":"../images/data_up_down.png",
                        "title":str_header_mobile_connection});
                    break;
                case g_dialupDisConed:
                    $internetModeImg.attr({"src":"../images/data_disable.png",
                        "title":str_header_mobile_disconnection});
                    break;
                default:
                    $internetModeImg.attr({"src":"../images/data_disable.png",
                        "title":str_header_mobile_disconnection});
                    break;
            }
            break;
        default:
            $internetModeImg.attr({"src":"../images/ethernet_small_v.png",
                "title":common_unknown});
            break;
    }
    $("#cradleimg").show();
    switch(g_curSimStatus){
        case g_simstatus_init:
        case g_simstatus_absent:
            initImg("#card-status", str_invalid_missing_card, "../images/card_invalid.png");
            simStatusInvalid.hide();
            break;
        case g_simStatusYes:
        case g_simStatusPINUNLock:
            $("#card-status").hide();
            if(g_sigLevel != g_sigLevelnoservice){
                var _signal_s = "../images/signal_small_" + g_sigLevel + ".png";
                initImg("#signal-simg", g_curNetworkType, _signal_s);
                if(g_curNetModeType!=g_curNetModeType0){
                    var _netmpde_s = "../images/netmode" + g_curNetModeType + ".png";
                    $("#netmode").show().children("img").attr("src", _netmpde_s);

                }

            }else if(g_curNetworkType == str_home_noservice){
                initImg("#signal-simg", str_home_noservice, "../images/limited.png");
                $("#netmode").hide();
            } else{
                initImg("#signal-simg", common_limited, "../images/limited.png");
                $("#netmode").hide();
            }
            if(g_roamStatus != "off" && g_networkType != g_networkModeNONE){
                initImg("#roam", common_roaming, "../images/roaming.png");
            }
            else{
                $("#roam").hide();
            }
            break;
        case g_simStatusPINLocked:
            initImg("#card-status", str_pin_required, "../images/card_invalid.png");
            simStatusInvalid.hide();
            break;
        case g_simStatusPUKLocked:
            initImg("#card-status", str_puk_required, "../images/card_invalid.png");
            simStatusInvalid.hide();
            break;
        default:
            $("#card-status").hide();
            initImg("#signal-simg", str_home_noservice, "../images/limited.png");
            $("#netmode").hide();
            break;
    }
    switch(g_newVerisonIstatus){
        case g_newVerisonFound:
            $("#new").attr("title", str_new_vesion).children("img").attr("src", "../images/new.gif");
            $("#new").show().click(function(){
                window.location.replace("../html/settings.html#upgrade");
            });
            break;
        default:
            $("#new").hide();
            break;
    }
    if(typeof(g_menuMap.settings.sms.switch) != "undefined" && g_menuMap.settings.sms.switch == 1){
        var inboxUnreadCount = data.sms_unread_count;
        if(inboxUnreadCount >= 100){
            $("#sms_Num").text("...");
            $("#sms_Num").show();
            var title=str_message_not_read.replace("%d",inboxUnreadCount);
            $("#sms-status").attr("title", title);
            $("#sms-status").show();
        } else if(inboxUnreadCount>0){
            $("#sms_Num").text(inboxUnreadCount);
            $("#sms_Num").show();
            var  title=str_message_not_read.replace("%d",inboxUnreadCount);
            $("#sms-status").attr("title", title);
            $("#sms-status").show();
        }
        else {
            $("#sms_Num").hide();
            $("#sms-status").hide();
        }
    }
    if(typeof(data.device_battery_charge_status) != "undefined"){
        switch(data.device_battery_charge_status){
            case "none":
            case "otg_charging":
                switch(data.device_battery_level){
                    case "0":
                    case "1":
                    case "2":
                    case "3":
                    case "4":
                    case "5":
                        $("#battery-status").children("img").attr("src", "../images/Battery_"+data.device_battery_level+".png").attr("title", data.device_battery_level_percent+"%");
                        $("#batteryimg").show();
                        break;
                    default:
                        $("#battery-status").children("img").attr("src", "../images/Battery_4.png").attr("title", data.device_battery_level_percent+"%");
                        $("#batteryimg").show();
                        break;
                }
                break;
            default:
                $("#battery-status").children("img").attr("src", "../images/adapter.png").attr("title", data.device_battery_level_percent+"%");
                $("#batteryimg").show();
                break;
        }
    }
}
function initInfo() {
    $("#signal-simg").hide();
    $("#netmode").hide();
    $("#card-status").hide();
    $("#new").hide();
    $("#roam").hide();
    if(!g_globalConfigData){
        getAjaxXMLData("../config/global/config.xml", function(xml){
            g_globalConfigData = g_globalConfigData.config;
            if(typeof(g_globalConfigData.config.battery_enabled) != "undefined" && g_globalConfigData.config.battery_enabled == 1) {
                $("#battery-status").removeClass("hide");
            } else {
                $("#battery-status").addClass("hide");
            }
        }, {
            async: false,
            timeout: 1000
        });
    } else if(typeof(g_globalConfigData.config.battery_enabled) != "undefined" && g_globalConfigData.config.battery_enabled == 1){
        $("#battery-status").removeClass("hide");
    } else {
        $("#battery-status").addClass("hide");
    }
    setTimeout3second();

}
function initMenuMain() {
    if (!g_menuMap) {
        return;
    }
    $("#sms-status").on("click",function(){
        if(window.location.href.split("#")[1] == "shortmessage"){
            changeSmsType(1);
        }else{
            window.location.replace("../html/settings.html#shortmessage");   
        }
    });
    $("#logout").on("click", logout);
    var $el = $("#changeLanguage");
    $el.click(function(e){
        e.stopPropagation();
        $("#LanguageDiv").show(500);
        form.on('select(langid)', changeLanguage);
        form.render('select','LanguageDiv');
    });
    $(document).on('click',function(e){
        if($(e.target)[0].id == "LanguageDiv"){
            return;
        }
        var select_elements = $(e.target).parents();
        var falg = false;
        for(var i = 0;i < select_elements.length;i++){
            if(select_elements[i].id == "LanguageDiv"){
                falg = true;
                return;
            }
        }
        if(!falg){
            $("#LanguageDiv").hide(500);
        }
    });
}
function logout(){
    showConfirmDialog(common_logout, str_logout_tips, do_logout);
}
function do_logout(){
    getAjaxJsonData("/action/logout", function(obj){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            closeDialog();
            window.location.replace("../common/login.html");
        }
    }, {
        async: false
    });
}
function redirect(){
    setTimeout(goToHome,3000);
}
function goToHome(){
    closeDialog();
    window.location.replace("../html/settings.html#status");
}

function changeMenuLeftStatus(ev){
    MenuHeight();
    var submenu, _id;
    var _ev = ev || event;
    var target = _ev.target || _ev.srcElemnt;

    _id = $(target).parent().parent().attr("id") || $(target).parent().attr("id") || $(target).attr("id");
    if (_id === "menu-left-settings"){
        return;
    }
    if ($("#" + _id).children("a").length > 0) {
        startLogoutTimer();
        $(".li-item").removeClass("click");
        $("#" + _id).addClass("click");
        $('.container-left').addClass('content_left_mobile');
        $('#logout').addClass('content_left_mobile');
        $('#changeLanguage').addClass('content_left_mobile');
        $('.container-right').removeClass('content_left_mobile');
        $('.mobile-header').removeClass('content_more');
        $('.mobile-header .more-options-btn').removeClass('cancle-options-btn');
        return true;
    }
    submenu = $(this).children("ul").children("li");
    $.each(submenu, function(){
        if ($(this).attr("id") === _id) {
            if ($(this).children("span").hasClass("click")) {
                $(this).children("span").removeClass("click");
                $(this).children("ul").hide(500);
            } else {
                $(this).children("span").addClass("click");
                $(this).children("ul").show(500);
            }
        } else {
            $(this).children("span").removeClass("click");
            $(this).children("ul").hide(500);
        }
    });
}
function getMenuRoute(menumap){
    var ret = false;
    $.each(menumap, function(key, value){
        if (typeof value === "string") {
            if (value === g_currentUrl) {
                ret = true;
                g_menuRoute.unshift(key);
                return false;
            }
        } else if (typeof value === "object") {
            ret = getMenuRoute(value);
            if (ret) {
                g_menuRoute.unshift(key);
                return false;
            }
        }
    });
    return ret;
}
var logo_text = "5G Device";
function getGlobalData(){
    getCurrentUrl();
    getAjaxXMLData("../config/global/config.xml", function(xml){
        g_globalConfigData = xml;
        g_pageTitle = g_globalConfigData.config.title;
        g_maxMenuNum = g_globalConfigData.config.maxnumber_menu;
        g_ipv6Status = g_globalConfigData.config.ipv6;
        g_menuMap = g_globalConfigData.config.menu;
        logo_text = g_globalConfigData.config.logo_text;
    }, {
        async: false,
        timeout: 1000
    });
    var postdata = ["mnet_pinlock_switch","mnet_nr5g_config_mode", "mnet_pinlock_sim_status", "voice_feature_switch", "voice_calltype_cs_switch", "voice_calltype_volte_switch", "voice_calltype_voip_switch", "device_2g_ap_num", "device_5g_ap_num","device_5g_ex_ap_num","webs_bootstrap_wizard","webs_privacy_statement"];
    ajaxGetJsonDataGoform(postdata, function(obj,data){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            pin_lock_switch = data.mnet_pinlock_switch;
            pin_lock_status = data.mnet_pinlock_sim_status;
            voice_all_switch = data.voice_feature_switch;
            voice_cs_switch = data.voice_calltype_cs_switch;
            voice_voip_switch = data.voice_calltype_voip_switch;
            voice_volte_switch = data.voice_calltype_volte_switch;
            g_configUrationStrMode = data.mnet_nr5g_config_mode;
            wifi_num_2g = data.device_2g_ap_num;
            wifi_num_5g = data.device_5g_ap_num;
            data.device_5g_ex_ap_num = typeof(data.device_5g_ex_ap_num) == "undefined" ? 0 : data.device_5g_ex_ap_num;
            wifi_num_5g = parseInt(wifi_num_5g) - parseInt(data.device_5g_ex_ap_num);
            g_quickguide = data.webs_bootstrap_wizard;
            webs_privacy_statement = data.webs_privacy_statement;

        }
    });

    getMenuRoute(g_menuMap);
}
function checkLoginStatus(){
    getAjaxJsonData("/goform/get_login_info", function(data){
        if (typeof data.retcode === "number" && data.retcode === g_resultSuccess){
            g_curLoginStatus = data.loginStatus;
            g_current_user = data.loginUser;
            if (g_curLoginStatus != g_login) {
                window.location.replace("../common/login.html");
            }
        } else {
            g_curLoginStatus = g_logout;
        }

    }, {
        async: false,
        timeout: 1000
    });
}
function initSubmenu(index, obj){
    var submenu = Object.keys(obj);
    for(var j = 0;j<submenu.length;j++){
        if(obj[submenu[j+1]]){
            $("#"+submenu[j+1]).children("a").text(pageTitle[index][j]);
        }else{
            $("#"+submenu[j+1]).remove();
        }
    }
}
function refreshPage(id){
    var thisID;
    if(id){
        thisID = "#" + id;
    }else{
        thisID = window.location.hash;
    }
    if(!checkSwitch(thisID)){
        window.location.replace("../html/settings.html#status");
        return;
    }
    if((thisID == "#pukrequired" && g_curSimStatus != g_simStatusPUKLocked) || (thisID == "#pinrequired" && g_curSimStatus != g_simStatusPINLocked) ||
        (href.indexOf("quickguide.html")>-1 && g_quickguide == "false")){
        pageRedirect();
        return;
    }  else if(thisID == "#pukrequired"|| thisID == "#pinrequired"){
  
    } else if(g_quickguide == "true"){
        window.location.replace("../html/quickguide.html");
        return;
    } 
    if(webs_privacy_statement== "true" && g_quickguide !="true"){
        showpolicydialog();
    }
    $('.menu-ul li ul').hide();
    $(".li-item").removeClass("click");
    $(".ul-normal").removeClass("click");
    $(thisID).addClass("click");
    $(thisID).parent("ul").removeClass("hide");
    $(thisID).parent("ul").show();
    $(thisID).parent("ul").prev().addClass("click");
    var _id = thisID.substr(1);
    $("#content_noRefresh").load(_id + ".html #content_right", function(result){
        startLogoutTimer();
        clearPageTimeout();
        repeat_refresh_flag = false;
        $("#content_noRefresh").html(result);
    });
    if(_id == "pukrequired" || _id == "pinrequired" || _id == "logqxdm" || _id == "modemlog" || _id == "remotelog" ||_id == "celllock" || (_id == "cwmpsettings" && (typeof(g_globalConfigData.config.cwmp_left_menu) == "undefined" ||  g_globalConfigData.config.cwmp_left_menu != 1))){
        $('.Nohide_page').hide();
        $('.hide_page').show();
        var string = "str_"+ _id + "_head";
        $('.hide_page span').text(eval(string));
        $('.container-left').addClass('hide');
        $('.container-right').addClass('all_width');
        $('#logout').addClass('small_page');
        $('#changeLanguage').addClass('small_page');
        $('.mobile-header').addClass('content_bottom');
        $('#logout').removeClass('content_left_mobile');
        $('#changeLanguage').removeClass('content_left_mobile');
    } else {
        $('.Nohide_page').show();
        $('.hide_page').hide();
        var imgSrc = $(thisID).parent("ul").prev().children("img").attr("src");
        $(".header-left-img img").attr("src",imgSrc);
        var firstTitle = $(thisID).parent("ul").prev().children("span").text();
        $(".title-first").text(firstTitle);
        var secondTitle = $(thisID+" a").text();
        $(".title-second").text(secondTitle);
        $('.container-left').removeClass('hide');
        $('.container-right').removeClass('all_width');
        $('.container-left').addClass('content_left_mobile');
        $('#logout').removeClass('small_page');
        $('#changeLanguage').removeClass('small_page');
        $('.mobile-header').removeClass('content_bottom');
        $('#logout').addClass('content_left_mobile');
        $('#changeLanguage').addClass('content_left_mobile');
        $('.container-right').removeClass('content_left_mobile');
        $('.mobile-header').removeClass('content_more');
        $('.mobile-header .more-options-btn').removeClass('cancle-options-btn');
    }
}
function initMenuLeft(){
    leftmenuTitle = [str_leftmenu_home, str_leftmenu_sms, str_leftmenu_moblienetwork, str_leftmenu_internet, str_leftmenu_wireless,
        str_leftmenu_voice, str_leftmenu_features, str_leftmenu_management];
    pageTitle = [
        [str_leftmenu_status],
        [str_leftmenu_shortmessage],
        [str_leftmenu_mc, str_leftmenu_pm, str_leftmenu_ns, str_leftmenu_rf, str_leftmenu_pinm,str_leftmenu_NR],
        [str_leftmenu_ethernet, str_leftmenu_dns, str_wlan_dhcp, str_vpn],
        [str_leftmenu_ws, str_leftmenu_wa, menu_guest_wifi, str_wireless_wps, str_leftmenu_wmf, str_leftmenu_ps],
        [str_leftmenu_ps, str_sipserver],
        [str_leftmenu_mf, str_leftmenu_if, str_leftmenu_pf, str_leftmenu_ds, str_diagnosis,str_wanping,str_ippassthrough,str_urlfilter, str_parental_control,str_qossettings],
        [str_sntp, str_leftmenu_di, str_leftmenu_sta, str_system_log, str_leftmenu_sa, str_backuprestore, str_leftmenu_upgrade, str_leftmenu_rr,str_leftmenu_tr069,str_leftmenu_lteoff]
    ];
    var $leftmenu;
    if (!g_menuMap) {
        return;
    }
    $leftmenu = $("#menu-left");
    if ($leftmenu.children().is("#settings")) {
        $leftmenu.load("leftmenu.html #menu-left-settings", function(){
            var leftList = Object.keys(g_menuMap.settings);
            var listLen = leftList.length;
            for(var i = 0;i < listLen;i++){
                if (g_menuMap.settings[leftList[i]].switch) {
                    $("#label-"+leftList[i]).text(leftmenuTitle[i]);
                    initSubmenu(i, g_menuMap.settings[leftList[i]]);
                } else {
                    $("#"+leftList[i]).remove();
                }
            }
            if(voice_all_switch == voice_switch_off){
                $("#voice").remove();
            }else if(voice_voip_switch == voice_switch_off){
                $("#sipserver").remove();
            }
            if( typeof(g_configUrationStrMode) == "undefined"|| g_configUrationStrMode.length <= 0){
                $("#NR5GConfiguration").hide();
            }else{
                $("#NR5GConfiguration").show();
            }
            refreshPage();
            $("#menu-left-settings").on("click", changeMenuLeftStatus);
            $(".li-item").on("mouseover", function(){
                $(this).addClass("active");
            }).on("mouseout", function(){
                $(this).removeClass("active");
            });
            MenuHeight();
        });
    }
}
function ShowPsw(ev){
    var _id, classname, _ev = ev || event;
    var target = _ev.target || _ev.srcElemnt;
    classname = $(target).hasClass("showPwd");
    if(!$(target).hasClass("showPwd")){
        return;
    }
    _id = $(target).attr("id");
    var biyanjing = $("#"+_id);
    var demoInput = biyanjing.nextAll()[0];
    if (demoInput.type == "password") {
        demoInput.type = "text";
        biyanjing.addClass("pass-show-icon");
    }else {
        demoInput.type = "password";
        biyanjing.removeClass("pass-show-icon");
    }
}
function initFooter(){
    var url;
    url = "../htmlPolicy/privacyPolicy_en_us.html?v=" + Math.random();
    var footer_arr = [
        '<span>'+common_copyright+'&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a href="/common/Open_Source_Software_Notice.txt" rel="noopener noreferrer" target="_blank">'+common_opensource+'</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a href="'+url+'" rel="noopener noreferrer" target="_blank">'+str_quick_policy_txt+'</a></span>',
    ];
    var foot = footer_arr.join("");
    $("#footer").html(foot);
    $(".content").on("change",function(){
        startLogoutTimer();
    });
}
function initModePage(){
}
function startLogoutTimer(){
    var postdata = ["webs_session_timeout"];
    ajaxGetJsonData(postdata, function(obj,data){
        if(typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            g_logoutTime = typeof(data.webs_session_timeout) == "undefined" ? 300000 : Number(data.webs_session_timeout*1000);
            if (g_curLoginStatus === g_login) {
                if (g_logoutTimer) {
                    clearTimeout(g_logoutTimer)
                }
                g_logoutTimer = setTimeout(do_logout, g_logoutTime);
            }
        }
    }, {
        
    });
}
function stopLogoutTimer(){
    if (g_logoutTimer) {
        clearTimeout(g_logoutTimer)
    }
}

function doIECompatibility(){
    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === "[object Array]";
        }
    }
}
doIECompatibility();
initlanguage();
checkLoginStatus();
getGlobalData();
function MenuHeight() {
    var width = $(window).width();
    if(width < 720){
        $("#menu-left-settings").css("height", $(window).height() - 160);
    } else {
        $("#menu-left-settings").css("height", $(window).height() - 160 -25);
    }
}

function initFooters(){
    var width = $(window).width();
    if(width < 720){
        $("#footer > span").remove();
    }else {
        initFooter();
    }
}
var layer
var form;
$(document).ready(function(){
    if(href.indexOf("home.html")>-1){
    } else {
        layer = layui.layer;
        form = layui.form;
    }
    $('#logo').text(logo_text);
    document.title = g_pageTitle;
    initMenuMain();
    initInfo();
    initLangList(g_langList);
    initMenuLeft();
    initModePage();
    initFooters();
    startLogoutTimer();
    $(window).on('hashchange', function(){
         layer.closeAll("tips");
         $(".container-right").scrollTop(0);
         refreshPage();
    });
    $(window).resize(function () {
        MenuHeight();
        initFooters();
    });
    $('.mobile-header .more-options-btn').on('click', function () {
        $(this).toggleClass('cancle-options-btn');
        if($(this).hasClass('cancle-options-btn')){
            $('.container-left').removeClass('content_left_mobile');
            $('#logout').removeClass('content_left_mobile');
            $('#changeLanguage').removeClass('content_left_mobile');
            $('.container-right').addClass('content_left_mobile');
            $('.mobile-header').addClass('content_more');
        } else {
            $('.container-left').addClass('content_left_mobile');
            $('#logout').addClass('content_left_mobile');
            $('#changeLanguage').addClass('content_left_mobile');
            $('.container-right').removeClass('content_left_mobile');
            $('.mobile-header').removeClass('content_more');
        }
    });
    initHeader();
    $(window).bind( 'orientationchange', function(e){
        orient();
    });
    setTimeout(initFooterHeight,1);
});
function initFooterHeight (){
    var ua = navigator.userAgent;
    if (ua.indexOf("VivoBrowser") > -1) {
        var callength = window.screen.height - document.documentElement.clientHeight;
        if(callength <= 125){
            $(".mobile-header,#logout,#changeLanguage").css("bottom","60px");
            $("#logout,#changeLanguage").css("bottom","80px");
            $("#content_noRefresh").css("padding-bottom","160px");
        } else {
            $(".mobile-header,#logout,#changeLanguage").css("bottom","0px");
            $("#logout,#changeLanguage").css("bottom","20px");
        }
    } else {
        $(".mobile-header,#logout,#changeLanguage").css("bottom","0px");
        $("#logout,#changeLanguage").css("bottom","20px");
    }
}
function orient() {
    if (window.orientation == 0 || window.orientation == 180) {
        window.location.reload();
        return false;
    } else if (window.orientation == 90 || window.orientation == -90) {
        window.location.reload();
        return false;
    }
}
function initHeader(){
    if(typeof(g_menuMap.settings.sms.switch) != "undefined" && g_menuMap.settings.sms.switch == 0){
        $('#sms-status').remove();
    }
}
function checkSwitch(hash){
    hash = hash.slice(1);
    var flag = false;
    switch(hash){
        case "status":
            if(typeof(g_menuMap.settings.home.status) != "undefined" && g_menuMap.settings.home.status == 1) {
                flag = true;
            }
            break;
        case "shortmessage":
            if(typeof(g_menuMap.settings.sms.shortmessage) != "undefined" && g_menuMap.settings.sms.shortmessage == 1) {
                flag = true;
            }
            break;
        case "mobileconnection":
            if(typeof(g_menuMap.settings.mobilenetwork.mobileconnection) != "undefined" && g_menuMap.settings.mobilenetwork.mobileconnection == 1) {
                flag = true;
            }
            break;
        case "profilemanagement":
            if(typeof(g_menuMap.settings.mobilenetwork.profilemanagement) != "undefined" && g_menuMap.settings.mobilenetwork.profilemanagement == 1) {
                flag = true;
            }
            break;
        case "networksetting":
            if(typeof(g_menuMap.settings.mobilenetwork.networksetting) != "undefined" && g_menuMap.settings.mobilenetwork.networksetting == 1) {
                flag = true;
            }
            break;
        case "rfparamters":
            if(typeof(g_menuMap.settings.mobilenetwork.rfparamters) != "undefined" && g_menuMap.settings.mobilenetwork.rfparamters == 1) {
                flag = true;
            }
            break;
        case "pinmanagement":
            if(typeof(g_menuMap.settings.mobilenetwork.pinmanagement) != "undefined" && g_menuMap.settings.mobilenetwork.pinmanagement == 1) {
                flag = true;
            }
            break;
        case "NR5GConfiguration":
            if(g_configUrationStrMode.length <= 0){
                flag = false;
            }else if(typeof(g_menuMap.settings.mobilenetwork.NR5GConfiguration) != "undefined" && g_menuMap.settings.mobilenetwork.NR5GConfiguration == 1) {
                flag = true;
            }
            break;
        case "ethernet":
            if(typeof(g_menuMap.settings.internet.ethernet) != "undefined" && g_menuMap.settings.internet.ethernet == 1) {
                flag = true;
            }
            break;
        case "dnssetting":
            if(typeof(g_menuMap.settings.internet.dnssetting) != "undefined" && g_menuMap.settings.internet.dnssetting == 1) {
                flag = true;
            }
            break;
        case "dhcp":
            if(typeof(g_menuMap.settings.internet.dhcp) != "undefined" && g_menuMap.settings.internet.dhcp == 1) {
                flag = true;
            }
            break;
        case "vpn":
            if(typeof(g_menuMap.settings.internet.vpn) != "undefined" && g_menuMap.settings.internet.vpn == 1) {
                flag = true;
            }
            break;
        case "wlansettings":
            if(typeof(g_menuMap.settings.wireless.wlansettings) != "undefined" && g_menuMap.settings.wireless.wlansettings == 1) {
                flag = true;
            }
            break;
        case "guestwifi":
            if(typeof(g_menuMap.settings.wireless.guestwifi) != "undefined" && g_menuMap.settings.wireless.guestwifi == 1) {
                flag = true;
            }
            break;
        case "wifiadvanced":
            if(typeof(g_menuMap.settings.wireless.wifiadvanced) != "undefined" && g_menuMap.settings.wireless.wifiadvanced == 1) {
                flag = true;
            }
            break;
        case "wps":
            if(typeof(g_menuMap.settings.wireless.wps) != "undefined" && g_menuMap.settings.wireless.wps == 1) {
                flag = true;
            }
            break;
        case "wlanmacfilter":
            if(typeof(g_menuMap.settings.wireless.wlanmacfilter) != "undefined" && g_menuMap.settings.wireless.wlanmacfilter == 1) {
                flag = true;
            }
            break;
        case "phonesettings":
            if(typeof(g_menuMap.settings.voice.phonesettings) != "undefined" && g_menuMap.settings.voice.phonesettings == 1) {
                flag = true;
            }
            break;
         case "sipserver":
            if(voice_voip_switch == voice_switch_off) {
                flag = false;
            } else if(typeof(g_menuMap.settings.voice.sipserver) != "undefined" && g_menuMap.settings.voice.sipserver == 1) {
                flag = true;
            }
            break;
        case "macfilter":
            if(typeof(g_menuMap.settings.features.macfilter) != "undefined" && g_menuMap.settings.features.macfilter == 1) {
                flag = true;
            }
            break;
        case "ipfilter":
            if(typeof(g_menuMap.settings.features.ipfilter) != "undefined" && g_menuMap.settings.features.ipfilter == 1) {
                flag = true;
            }
            break;
        case "portforwarding":
            if(typeof(g_menuMap.settings.features.portforwarding) != "undefined" && g_menuMap.settings.features.portforwarding == 1) {
                flag = true;
            }
            break;
         case "dmzsettings":
            if(typeof(g_menuMap.settings.features.dmzsettings) != "undefined" && g_menuMap.settings.features.dmzsettings == 1) {
                flag = true;
            }
            break;
        case "diagnosis":
            if(typeof(g_menuMap.settings.features.diagnosis) != "undefined" && g_menuMap.settings.features.diagnosis == 1) {
                flag = true;
            }
            break;
         case "wanping":
            if(typeof(g_menuMap.settings.features.wanping) != "undefined" && g_menuMap.settings.features.wanping == 1) {
                flag = true;
            }
            break;
        case "urlfilter":
            if(typeof(g_menuMap.settings.features.urlfilter) != "undefined" && g_menuMap.settings.features.urlfilter == 1) {
                flag = true;
            }
            break;
        case "parentalcontrol":
            if (typeof(g_menuMap.settings.features.parentalcontrol) != "undefined" && g_menuMap.settings.features.parentalcontrol == 1) {
                flag = true;
            }
            break;
        case "ippassthrough":
            if(typeof(g_menuMap.settings.features.ippassthrough) != "undefined" && g_menuMap.settings.features.ippassthrough == 1) {
                flag = true;
            }
            break;
        case "qossettings":
            if(typeof(g_menuMap.settings.features.qossettings) != "undefined" && g_menuMap.settings.features.qossettings == 1) {
                flag = true;
            }
            break;
         case "sntp":
            if(typeof(g_menuMap.settings.management.sntp) != "undefined" && g_menuMap.settings.management.sntp == 1) {
                flag = true;
            }
            break;
        case "deviceinfo":
            if(typeof(g_menuMap.settings.management.deviceinfo) != "undefined" && g_menuMap.settings.management.deviceinfo == 1) {
                flag = true;
            }
            break;
        case "statistics":
            if(typeof(g_menuMap.settings.management.statistics) != "undefined" && g_menuMap.settings.management.statistics == 1) {
                flag = true;
            }
            break;
        case "systemlog":
            if(typeof(g_menuMap.settings.management.systemlog) != "undefined" && g_menuMap.settings.management.systemlog == 1) {
                flag = true;
            }
            break;
        case "systemadmin":
            if(typeof(g_menuMap.settings.management.systemadmin) != "undefined" && g_menuMap.settings.management.systemadmin == 1) {
                flag = true;
            }
            break;
        case "backuprestore":
            if(typeof(g_menuMap.settings.management.backuprestore) != "undefined" && g_menuMap.settings.management.backuprestore == 1) {
                flag = true;
            }
            break;
        case "upgrade":
            if(typeof(g_menuMap.settings.management.upgrade) != "undefined" && g_menuMap.settings.management.upgrade == 1) {
                flag = true;
            }
            break;
        case "rebootreset":
            if(typeof(g_menuMap.settings.management.rebootreset) != "undefined" && g_menuMap.settings.management.rebootreset == 1) {
                flag = true;
            }
            break;
        case "lteoff":
            if(typeof(g_menuMap.settings.management.lteoff) != "undefined" && g_menuMap.settings.management.lteoff == 1) {
                flag = true;
            }
            break;
        case "cwmpsettings":
        case "pukrequired":
        case "pinrequired":
        case "logqxdm":
        case "modemlog":
        case "remotelog":
        case "celllock":
            flag = true;
            break;
        default:
            flag = false;
            break;
    }
    return flag;
}
function checkPrefixLenNum(val) {
    var flag = true;
    var sizeParts = val.split("");
    if (val == '') {
        flag = false;
    } else if (val < 0 || val > 128) {
        flag = false;
    } else {
        $(sizeParts).each(function (i) {
            if (!(sizeParts[i] <= '9' && sizeParts[i] >= '0')) {
                flag = false;
            }
        });
    }
    return flag;
}
function isValidIpv6Address(address) {
    var loweraddress = '';
    var addrParts = '';
    var startadd = [];
    var endadd = [];
    loweraddress = address.toLowerCase();
    addrParts = loweraddress.split('::');
    if (addrParts.length == 2) {
        if (addrParts[0] != '') {
            startadd = verifyIpv6str(addrParts[0]);
            if (startadd.length == 0) {
                return false;
            }
        }
        if (addrParts[1] != '') {
            endadd = verifyIpv6str(addrParts[1]);
            if (endadd.length == 0) {
                return false;
            }
        }
        var alllen = startadd.length + endadd.length;
        if (alllen > 7) {
            return false;
        }
    } else if (addrParts.length == 1) {
        startadd = verifyIpv6str(addrParts[0]);
        if (startadd.length != 8) {
            return false;
        }
    } else {
        return false;
    }
    return true;
}
function verifyIpv6str(str) {
    var Num;
    var i,
    j;
    var finalAddrArray = new Array();
    var falseAddrArray = new Array();
    var addrArray = str.split(':');
    Num = addrArray.length;
    if (Num > 8 || Num < 1) {
        return falseAddrArray;
    }
    for (i = 0; i < Num; i++) {
        if ((addrArray[i].length > 4)
             || (addrArray[i].length < 1)) {
            return falseAddrArray;
        }
        for (j = 0; j < addrArray[i].length; j++) {
            if ((addrArray[i].charAt(j) < '0')
                 || (addrArray[i].charAt(j) > 'f')
                 || ((addrArray[i].charAt(j) > '9') &&
                    (addrArray[i].charAt(j) < 'a'))) {
                return falseAddrArray;
            }
        }
        finalAddrArray[i] = '';
        for (j = 0; j < (4 - addrArray[i].length); j++) {
            finalAddrArray[i] += '0';
        }
        finalAddrArray[i] += addrArray[i];
    }
    return finalAddrArray;
}
function checkInvalidDestinationIpv6Addr(addr) {
    var ipv6address = addr.toLowerCase();
    if (('::' == addr) || isSameipv6Prefix('::1', addr, 128) || ('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff' == ipv6address) ||
        ('ff01' == ipv6address.substring(0, 4)) || ('ff02' == ipv6address.substring(0, 4)) ||
        ('ff05' == ipv6address.substring(0, 4)) || ('ff08' == ipv6address.substring(0, 4)) ||
        ('ff0e' == ipv6address.substring(0, 4))) {
        return false;
    }
    return true;
}
function isSameipv6Prefix(ipv61, ipv62, Prefix1) {
    if (ipv61 == '' || ipv62 == '') {
        return false;
    }
    if (Prefix1 <= 0 || Prefix1 > 128) {
        return false;
    }
    var bret = true;
    var address_ipv6_1 = formatIpv6address(ipv61);
    var address_ipv6_2 = formatIpv6address(ipv62);
    var i = 0;
    var ipv6_array_1 = address_ipv6_1.split(":");
    var ipv6_array_2 = address_ipv6_2.split(":");
    var ipv6_value_1 = 0;
    var ipv6_value_2 = 0;
    for (i = 0; i < Prefix1 / 16; i++) {
        ipv6_value_1 = parseInt(ipv6_array_1[i], 16);
        ipv6_value_2 = parseInt(ipv6_array_2[i], 16);
        if (ipv6_value_1 != ipv6_value_2) {
            bret = false;
            break;
        }
    }
    if ((bret == true) && (Prefix1 % 16 != 0)) {
        var temp = '';
        for (i = 0; i < 16; i++) {
            if (i < Prefix1 % 16) {
                temp = temp + '1';
            } else {
                temp = temp + '0';
            }
        }
        var a = parseInt(ipv6_array_1[Math.floor(Prefix1 / 16)], 16);
        var b = parseInt(ipv6_array_2[Math.floor(Prefix1 / 16)], 16);
        var compareobj = parseInt(temp, 2);
        if (a & compareobj != b & compareobj) {
            bret = false;
        }
    }
    return bret;
}
function formatIpv6address(simpeIpv6) {
    simpeIpv6 = simpeIpv6.toUpperCase();
    const ipv6Empty = "0000:0000:0000:0000:0000:0000:0000:0000";
    const ipv6EmptyHead = "0000";
    if (simpeIpv6 == "::") {
        return ipv6Empty;
    }
    var arr = ipv6Empty.split(":");
    if (simpeIpv6.startsWith("::")) {
        var tmpArr = simpeIpv6.substring(2).split(":");
        for (var i = 0; i < tmpArr.length; i++) {
            arr[i + 8 - tmpArr.length] = (ipv6EmptyHead + tmpArr[i]).slice(-4);
        }
    } else if (simpeIpv6.endsWith("::")) {
        var tmpArr = simpeIpv6.substring(0, simpeIpv6.length - 2).split(":");
        for (var i = 0; i < tmpArr.length; i++) {
            arr[i] = (ipv6EmptyHead + tmpArr[i]).slice(-4);
        }
    } else if (simpeIpv6.indexOf("::") >= 0) {
        var tmpArr = simpeIpv6.split("::");
        var tmpArr0 = tmpArr[0].split(":");
        for (var i = 0; i < tmpArr0.length; i++) {
            arr[i] = (ipv6EmptyHead + tmpArr0[i]).slice(-4);
        }
        var tmpArr1 = tmpArr[1].split(":");
        for (var i = 0; i < tmpArr1.length; i++) {
            arr[i + 8 - tmpArr1.length] = (ipv6EmptyHead + tmpArr1[i]).slice(-4);
        }
    } else {
        var tmpArr = simpeIpv6.split(":");
        for (var i = 0; i < tmpArr.length; i++) {
            arr[i + 8 - tmpArr.length] = (ipv6EmptyHead + tmpArr[i]).slice(-4);
        }
    }
    return arr.join(":");
}
function showpolicydialog(){
    var url;
    url = "../htmlPolicy/privacyPolicy_en_us.html?v=" + Math.random();

    var i, len, html, style;
    var option = "<option value=\"%d\">%s</option>";
    var footer_content = str_quick_policy_centent.replace('%l','<a rel="noopener noreferrer" target="_blank" style="" href="'+url+'">'+str_quick_policy_txt+'</a>')
    var policydialog = [
        '<div id="policydialog">',
        '<div class="policy_content">'+policy_txt+'</div>',
        '<div class="policy_footer">'+footer_content+'</div>',
        '<div class="btn-area">',
        '<input type="button" class="common-btn" value="'+str_quick_no+'" onclick="do_logout()">',
        '<input type="button" class="common-btn" value="'+str_quick_ok+'" onclick="setPrivacy()">',
        '</div>',
        '</div>'].join("");

    style = policydialog.replace("%select", html);
    layer.open({
        title: str_dialog_policy,
        type: 1,
        content: style,
        skin: 'new_profile_style dialog_content quick_policy_dialog'
    });
    $(".quick_policy_dialog .layui-layer-setwin").css("display","none");

}
function setPrivacy(){
    var postdata = {};
    postdata.webs_privacy_statement = false;
    var quickpostdata = JSON.stringify(postdata);
    saveAjaxJsonData("/action/set_privacy_statement", quickpostdata, function(obj){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            closeDialog();
            if(g_quickguide == "true"){
                $(".quick_page")[0].style.display = "block";
            } else {
                window.location.reload();
            }
        }else {
            closeDialog();
            showResultDialog(common_result, common_failed, failed_icon, 3000);
            setTimeout(do_logout,3000);
        }
    },{

    });
}