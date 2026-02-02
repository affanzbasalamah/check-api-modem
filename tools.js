var g_priKey;
var g_timestamp;
var g_timestamp_start;
var g_encrytp_state = 0;
var pathnameArr = window.location.pathname.split("/");
var pageName = pathnameArr[pathnameArr.length-1].split(".")[0];
var hashname = window.location.hash;
var RedirectOnceFlag = true;
var href = window.location.href;
var logo_login_text = "5G Device";
var browser_title = "5G Device";

/*
 * 获取是否加密配置函数
 * */
function getEncryConfig() {
    $.ajax({
        url: "/config/global/config.xml",
        async: false,
        timeout: 1000,
        cache: false,
        type: "POST",
        dataType: "xml",
        contentType: "application/xml",
        error: function(xhr, textStatus) {
            var errorInfo = textStatus + ": " + xhr.status + " " + xhr.readyState;
            console.log(errorInfo);
        },
        success: function(data){
            var obj = xml2object($(data));
            g_encrytp_state = obj.config.encrypt;
            logo_login_text = obj.config.logo_text;
            browser_title = obj.config.title;
        }
    });
}

/*
 * 更新加密秘钥函数
 * */
function updatePrikey(newkey) {
    if (null != newkey) {
        var prikey = newkey;
        g_priKey = prikey.split("x")[0];
        g_timestamp = prikey.split("x")[1];
        var date = new Date();
        g_timestamp_start = parseInt(date.getTime()/1000);
    }
}

/*
 * 获取加密秘钥函数
 * */
function getPrikey() {
    $.ajax({
        url: "/goform/sync",
        async: false,
        timeout: 1000,
        cache: false,
        type: "POST",
        dataType: "text",
        contentType: "application/x-mgdata",
        error: function(xhr, textStatus) {
            var errorInfo = textStatus + ": " + xhr.status + " " + xhr.readyState;
            console.log(errorInfo);
        },
        success: function(data,textstate,xhr){
            updatePrikey(xhr.getResponseHeader("X-MG-Private"));
        }
    });
}
/*
* ajax方法
* */
function getAjaxJsonData(urlstr, callback, options) {
    var encryptType = "application/x-mgdata";
    var jsonType = "application/json";
    var contentType,type;
    var isasync = true,
        cache = false,
        inTimeout = 0;

    if (options) {
        if (options.hasOwnProperty("async")) {
            isasync = options.async;
        }
        if (options.hasOwnProperty("cache")) {
            cache = options.cache;
        }
        if (options.hasOwnProperty("timeout")) {
            inTimeout = parseInt(options.timeout, 10);
            if ((inTimeout < 0) || isNaN(inTimeout)) {
                inTimeout = g_ajaxTimeout;
            }
        }
    }
    if(g_encrytp_state){
        contentType = encryptType;
        type = "text";
    }else{
        contentType = jsonType;
        type = "json";
    }
    $.ajax({
        url: urlstr,
        async: isasync,
        timeout: inTimeout,
        cache: cache,
        type: "POST",
        dataType: type,
        contentType: contentType,
        error: function(xhr, textStatus) {
            var errorInfo = textStatus + ": " + xhr.status + " " + xhr.readyState;
            console.log(errorInfo);
        },
        success: function(data,textstate,xhr){
            if(g_encrytp_state){
                updatePrikey(xhr.getResponseHeader("X-MG-Private"));
                data = password_decode(data,g_priKey);
            }
            data = data2Object(data);
            if (typeof callback === "function"){
                callback(data,xhr);
            }
        }
    });
}
/*
* ajax方法
* */
function getAjaxXMLData(urlstr, callback, options) {
    var isasync = true,
        cache = false,
        inTimeout = 0;

    if (options) {
        if (options.hasOwnProperty("async")) {
            isasync = options.async;
        }
        if (options.hasOwnProperty("timeout")) {
            inTimeout = parseInt(options.timeout, 10);
            if ((inTimeout < 0) || isNaN(inTimeout)) {
                inTimeout = g_ajaxTimeout;
            }
        }
        if (options.hasOwnProperty("cache")) {
            cache = options.cache;
        }
    }
    $.ajax({
        url: urlstr,
        async: isasync,
        timeout: inTimeout,
        cache: cache,
        type: "POST",
        dataType: "xml",
        contentType: "application/xml",
        error: function(xhr, textStatus) {
            var errorInfo = textStatus + ": " + xhr.status + " " + xhr.readyState;
            console.log(errorInfo);
        },
        success: function(data){
            var obj = xml2object($(data));
            if (typeof callback === "function"){
                callback(obj);
            }
        }
    });
}

function saveAjaxJsonData(url, data, callback, options){
    var encryptType = "application/x-mgdata";
    var jsonType = "application/json";
    var contentType,datatype;
    var isasync = true,
        timeout = 0;

    if (options){
        if (options.hasOwnProperty("async")){
            isasync = options.async;
        }
        if (options.hasOwnProperty("timeout")){
            timeout = options.timeout;
        }
    }
    if(g_encrytp_state){
        contentType = encryptType;
        datatype = "text";
        data = password_encode(data,g_priKey,g_timestamp,g_timestamp_start)
    }else{
        contentType = jsonType;
        datatype = "json";
    }
    $.ajax({
        url: url,
        async: isasync,
        data: data,
        timeout: timeout,
        type: "POST",
        dataType: datatype,
        contentType: contentType,
        error: function(xhr, msg){
            var errorInfo = xhr.status + ": " + msg;
            console.log(errorInfo);
        },
        success: function(data,textstate,xhr){
            if(g_encrytp_state){
                updatePrikey(xhr.getResponseHeader("X-MG-Private"));
                data = password_decode(data,g_priKey);
            }
            var obj = data2Object(data);
            if (typeof callback === "function") {
                callback(obj);
            }
        }
    });
}

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
function _getNodeValue(str) {
    if (typeof (str) === "undefined" || str === null ) {
        return null;
    }
    var trimStr = $.trim(str);
    if ( trimStr.length === 0) {
        return trimStr;
    }
    if (isNaN(str)) {
        return str;
    } else {
        return parseInt(str, 10);
    }
}
function _parseXML2Object($xml) {
    if ($xml.children().length > 0) {
        var obj = {};
        $xml.children().each(function(){
            var childObj = {};
            if ($(this).children().length > 0) {
                childObj = _parseXML2Object($(this));
            } else {
                childObj = _getNodeValue($(this).text());
            }
            if (obj[this.tagName]){
                if (Array.isArray(obj[this.tagName])) {
                    obj[this.tagName].push(childObj);
                } else {
                    var _value = obj[this.tagName];
                    obj[this.tagName] = [];
                    obj[this.tagName].push(_value);
                    obj[this.tagName].push(childObj);
                }
            } else {
                obj[this.tagName] = childObj;
            }
        });
        return obj;
    } else {
        return _getNodeValue($xml.text());
    }
}
function xml2object($xml){
    var obj = {};

    if ($xml.find("response").length > 0) {
        var _response = _parseXML2Object($xml.find("response"));
        obj.type = "response";
        obj.response =_response;
    } else if ($xml.find("config").length > 0) {
        var _config = _parseXML2Object($xml.find("config"));
        obj.type = "config";
        obj.config = _config;
    } else if ($xml.find("error").length > 0) {
        var _code = $xml.find("code").text(),
            _message = $xml.find("message").text();
        obj.type = "error";
        obj.error = {
            code: _code,
            message: _message
        };
    } else {
        obj.type = "unknow";
    }
    return obj;
}
/*
* 获取字符串方法
* */
function getText(text){
    if (typeof text === "string" && text.length !== 0) {
        document.write(text);
    } else {
        document.write("Error: Can't get string!");
    }
}

/**
 * 弹出框方法
 */

function closeDialog(){
    if($(".layui-layer-shade").length > 0){
        layer.closeAll();
    }
}
function closeResultDialog(){
    layer.closeAll();
    hashname = window.location.hash;
    if(pageName == "settings" && hashname != "#upgrade"){
        refreshPage();
    }else{
        window.location.reload();
    }
}
function showProgressDialog(title, msg, per){
    var dialog = [
        '<div id="proinfo">',
        '<div id="promsg">%msg</div>',
        '<div id="pronav">',
        '<div id="probar"></div>',
        '<div id="precent_text"></div>',
        '</div>',
        '</div>'].join("");
    dialog = dialog.replace("%msg", msg);
    if($(".layui-layer-title").text() != title && $("#promsg").text() != msg){
        closeDialog();
        layer.open({
            title: title,
            type: 1,
            content: dialog,
            skin: 'upgrade_dialog',
            success: function(){
                $(".layui-layer-setwin,.layui-layer-btn").remove();
            }
        });
    }
    $("#probar").width($("#pronav").width() * per / 100);
    $("#precent_text").text(per + "%");
}
function showResultOnlyDialogWithFlag(title, msg, icon, time){
    layer.open({
        title: title,
        icon: icon,
        content: msg,
        time: 4000,
        success: function(){
            $(".layui-layer-setwin,.layui-layer-btn").remove();
            if (typeof time === "number"){
                setTimeout(closeDialogWithFlag, time);
            } else {
                setTimeout(closeDialogWithFlag, 3000);
            }
        }
    });
}
function showResultDialog(title, msg, type, time){
    var time1, icon;
    if(type == 1){
        icon = 1;
    }else if(type == 2){
        icon = 2;
    }
    if (typeof time === "number"){
        time1 = time;
    } else {
        time1 = 3000;
    }
    layer.open({
        title: title,
        icon: icon,
        content: msg,
        time: time1,
        success: function(){
            $(".layui-layer-setwin,.layui-layer-btn").remove();
            if (typeof time === "number"){
                setTimeout(closeResultDialog, time1);
            } else {
                setTimeout(closeDialog, time1);
            }
        }
    });
}
function showErrorDialog(msg, id){
    showErrorUnderTextbox(id,msg);
}
function showWaitingDialog(title, msg){
    if($(".layui-layer-title").text() == title && $(".layui-layer-content").text() == msg){
        return;
    }
    closeDialog();
    layer.open({
        title: title,
        content: msg,
        icon: 16,
        skin: 'wait-class',
        success: function(){
            $(".layui-layer-setwin,.layui-layer-btn").remove();
        }
    });
}

function showConfirmDialog(title, msg, callback,cancelfun,closeFun){
    layer.confirm(msg, {
        title: title,
        btn: [common_ok, common_cancel],
        cancel:function(){
            if(typeof(closeFun) == "function"){
                closeFun();
            } else {
                closeDialog();
            }
        }
    }, function(index, layero){
      callback();
    }, function(){
        if(typeof(cancelfun) == "function"){
            cancelfun();
        } else {
            closeDialog();
        }
    });
}
function showLoginForgetPsdDialog(title, msg, callback,cancelfun,closeFun){
    layer.confirm(msg, {
        skin:'dome-class',
        title: title,
        btn: [common_ok],
        cancel:function(){
            if(typeof(closeFun) == "function"){
                closeFun();
            } else {
                closeDialog();
            }
        }
    }, function(index, layero){
        callback();
    }, function(){
        if(typeof(cancelfun) == "function"){
            cancelfun();
        } else {
            closeDialog();
        }
    });
}
function showConfirmRebootDialog(title, msg, callback){
    layer.confirm(msg, {
        title: title,
        btn: [str_wlan_dhcp_successtips_reboot_ok, str_wlan_dhcp_successtips_reboot_no]
    }, function(index, layero){
      callback();
    });
}

function closeDialogWithFlag(){
    layer.closeAll();
    g_deleting_flag=false;
}
function showTipsDialog(title, msg, callback,iconFlag){
    var icon = 0;
    if(typeof(iconFlag)!="undefined"){
        icon = iconFlag;
    }
    layer.open({
        title: title,
        icon: icon,
        content: msg,
        success: function(){
            $(".layui-layer-setwin,.layui-layer-btn").remove();
            if (typeof callback == "function"){
                callback();
            } else {
                setTimeout(closeDialog, 3000);
            }
        }
    });
}
/**
 * 弹出框方法
 */

function showResultOnlyDialog(title, msg, time){
    var dialogIndex = layer.open({
        title: title,
        icon: 0,
        content: msg,
        time: time,
        success: function(){
            $(".layui-layer-setwin,.layui-layer-btn").remove();
        }
    });
}
/**
 * 弹出框方法
 */

function showResultOnlyDialogSms(title, msg, icon, time){
    var dialogIndex = layer.open({
        title: title,
        icon: icon,
        content: msg,
        time: time,
        success: function(){
            $(".layui-layer-setwin,.layui-layer-btn").remove();
        }
    });
}
function showSendSMSWaitingDialog(title, msg){
    layer.open({
        title: title,
        content: msg,
        success: function(){
            $(".layui-layer-setwin,.layui-layer-btn").remove();
        }
    });
    setTimeout(function(){
        layer.load(2);
    },0);
}

/*********************************  new Get  **********************************/
function commonAjax(url, key, callback, options){
    var encryptType = "application/x-mgdata";
    var jsonType = "application/json";
    var contentType,datatype;
    var isasync = true,
        timeout = 0;
    var data = {};
    data.keys = key;
    data = JSON.stringify(data);
    if (options){
        if (options.hasOwnProperty("async")){
            isasync = options.async;
        }
        if (options.hasOwnProperty("timeout")){
            timeout = options.timeout;
        }
    }
    if(g_encrytp_state){
        contentType = encryptType;
        datatype = "text";
        data = password_encode(data,g_priKey,g_timestamp,g_timestamp_start)
    }else{
        contentType = jsonType;
        datatype = "json";
    }
    $.ajax({
        url: url,
        async: isasync,
        data: data,
        timeout: timeout,
        type: "POST",
        dataType: datatype,
        contentType: contentType,
        error: function(xhr, msg){
            var errorInfo = xhr.status + ": " + msg;
            console.log(errorInfo);
            if(RedirectOnceFlag && msg == "Redirect"){
                RedirectOnceFlag = false;
                showTipsDialog(common_info, str_session_expired, function(){
                    setTimeout(function(){
                        window.location.reload();
                    },3000);
                });
            }
        },
        success: function(data){
            if(g_encrytp_state){
                data = password_decode(data,g_priKey);
            }
            data = data2Object(data);
            if (typeof callback === "function") {
                var dataBack = data.data;
                callback(data,dataBack);
            }
        }
    });
}
function ajaxGetJsonDataGoform(key, callback, options){
    commonAjax("/goform/get_mgdb_params", key, callback, options);
}
function ajaxGetJsonData(key, callback, options){
    commonAjax("/action/get_mgdb_params", key, callback, options);
}

function replaceSymbol(string){
    var str = string;
    str = str.replace(/&/g,"&amp;");
    str = str.replace(/,/g,"&#39;");
    return str;
}
function parseSymbol(string){
    var str = string;
    str = str.replace(/&#39;/g,",");
    str = str.replace(/&amp;/g,"&");
    return str;
}

function IsBridgeEnabled(){
    var bridge_status = false;
    if(!g_menuMap){
        getAjaxXMLData("/config/global/config.xml", function(xml){
            g_menuMap = g_globalConfigData.config.menu;
            IsBridgeEnabled();
        }, {
            async: false,
            timeout: 1000
        });
    } else if(typeof(g_menuMap.settings.features.ippassthrough) != "undefined" && g_menuMap.settings.features.ippassthrough == 1){
        var postdata = ["rt_ip_passthrough_switch"];
        ajaxGetJsonData(postdata, function(obj,data){
            if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
                if(typeof(data.rt_ip_passthrough_switch) != "undefined" && data.rt_ip_passthrough_switch == "enable"){
                    bridge_status = true;
                }
            }
        }, {
            async: false,
            timeout: 1000
        });
    }
    return bridge_status;
}

function showTipBridgeNotes() {
    $("#content_right>.main-content").remove();
    var linkhtml = '<a class="selectmenu" href="../html/settings.html#ippassthrough" rel="noopener noreferrer" target="_self" style="text-decoration:underline;color:#337ab7">'+str_ippassthrough+'</a>';
    var result = bridge_mode_warning;
    var re = new RegExp("%l", 'g');
    bridge_mode_warning.replace(re, linkhtml);
    result = result.replace(re, linkhtml);
    console.log(bridge_mode_warning);
    var bridge_html = "";
    bridge_html += '<div class="Bridge_notes" style="padding: 45px 45px;color:red">';
    bridge_html += '<div style="margin-bottom: 20px;">'+common_notes+'</div>';
    bridge_html += '<div>'+result+'</div>';
    bridge_html += ' </div>';
    $("#content_right").html(bridge_html);
}
//校验中文字符为3字节,返回字符串整个长度.
function CheckName(str){
    var fildName = str.match(/[\u0391-\uFFE5]/g);
    return str.length + (fildName == null ? 0 : fildName.length *2);
}
function showErrorUnderTextbox(idOfTextbox, errormsg,time) {
    var errorLabel = '';
    errorLabel += '<div style="z-index: 19891017; position: absolute;" class="error_tips">';
    errorLabel += '    <div style="padding: 8px 15px;background-color: rgb(210, 77, 87);color:#fff">';
    errorLabel += '        <i class="layui-layer-TipsG layui-layer-TipsB" style="border-right-color: rgb(210, 77, 87);position: absolute;width: 0;height: 0;border-width: 8px;border-style: dashed;border-right-style: solid;top: -8px;z-index: -1;"></i>';
    errorLabel += '        <span style="line-height: 22px;min-width: 12px;padding: 8px 15px;font-size: 12px;color: #fff;">' + errormsg + '</span>';
    errorLabel += '     </div>';
    errorLabel += ' </div>';
    $(idOfTextbox).after(errorLabel);
    var ele = $(idOfTextbox).parent();
    $(idOfTextbox+"+.error_tips").css("top",$(ele).outerHeight()+10);
    if (0 == $(ele).children('.error_message').length && $(ele).hasClass("content_option")) {
        $(ele).addClass("error_postion");
    }
    if(typeof(time) != "undefined"){
        setTimeout(clearAllErrorMessage,time);
    } else {
        setTimeout(clearAllErrorMessage,3000);
    }
}
function clearAllErrorMessage() {
    $('.error_tips').remove();
}
function initHomePageText(){
    var elements = $("*");
    elements.each(function() {
        var element = $(this);
        var langText = element.attr("langid");
        if(langText != undefined){
            try {
                var val_in = eval(langText);
            }catch(e){
                var val_in = "";
            }
            if(element.is("input")){
                element.attr("value", val_in);
            }else{
                element.text(val_in);
            }
        }
        langText = element.attr("langid_col");
        if(langText != undefined){
            try {
                var val_in = eval(langText) + common_colon;
            }catch(e){
                var val_in = "";
            }
            if(element.is("input")){
                element.attr("value", val_in);
            }else{
                element.text(val_in);
            }
        }
    });
}

function checkIPModify(ip){
    if(window.location.protocol != "https:"){
        return false;
    }
    var oldHost = window.location.hostname;
    if(oldHost.indexOf(ip) == -1){
        layer.confirm(str_device_not_connect, {
            title: common_confirm,
            btn: common_ok
        }, function(index, layero){
            ip = (window.location.port == "" || window.location.port == 443) ? ip : (ip+":"+window.location.port);
            if(ip.indexOf("https://") == -1 && ip.indexOf("http://")== -1){
                ip = window.location.protocol + "//" + ip;
            }
            window.location.href = ip;
        });
        return true;
    }
    return false;
}