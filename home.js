var g_wanConnect = "connected";
var g_wanDisconnect = "disconnected";
var g_curNetworkTypeHome;
var g_operatorNameHome;
var curviermode=0;
var mode_intenetview=0;
var mode_wifiview=1;
var mode_clientview=2;
var connected_type_lan = "eth";
var connected_type_wifi = "wifi";
var connected_type_usb = "usb";
var wifi_enabled = "ap_enable";
var wifi_disabled = "ap_disable";
var firstFlag=true;
var checklogout=false;
var timelong;
var clientFirstFlag = true;
var clientFirstData;
var wifiFirstFlag = true;
var wifiFirstData;
var statistics_Top;
var statistics_Bottom;
var g_wanStatusInfo = {
    status: "",
    uptime:"",
    macaddr: "",
    ipaddr: "",
    netmask: "",
    gateway: "",
    dns1: "",
    dns2: "",
    ipv6:"",
    ipv6dns1:"",
    ipv6dns2:""
};

var g_profileList = [];
var g_defaultProfileID;
var flag;

var g_wifi_24=[];
var g_wifi_5=[];

function initPageStr(){
    $("#homeInternet").text(str_home_internetinfo);
    $("#homeWiFi").text(str_home_i232);
    $("#homeMobileWiFi").text(str_home_i232);
    $("#homeClients").text(str_home_connected_clients);
    $("#internetModeStr").text(str_home_internet_mode+common_colon);
    $("#networkStatusStr").text(str_home_network_status+common_colon);
    $("#connectModeStr").text(str_home_connection_type+common_colon);
    $("#connectionUptimeStr").text(str_home_connection_uptime+common_colon);
    $("#ipAddressStr").text(str_home_ip_address+common_colon);
    $("#subnetMaskStr").text(str_home_subnet_mask+common_colon);
    $("#defaultGatewayStr").text(str_home_default_gateway+common_colon);
    $("#primaryDNSStr").text(str_home_dns1+common_colon);
    $("#secondaryDNSStr").text(str_home_dns2+common_colon);
    $("#ipv6AddressStr").text(str_home_ipv6_address+common_colon);
    $("#ipv6primaryDNSStr").text(str_home_ipv6dns1+common_colon);
    $("#ipv6secondaryDNSStr").text(str_home_ipv6dns2+common_colon);
    $("#statisticsHome").text(str_statistics_data+common_colon);
}
function switchMode(mode){
    var securitymode;
    switch (mode){
        case "open":
        case "wpa3_owe":
            securitymode = "nopass";
            break;
        case "wpa":
        case "wpa2":
        case "wpa_wpa2":
        case "wpa2_wpa3":
            securitymode = "WPA";
            break;
        case "wpa3":
            securitymode = "SAE";
            break;
        default :
            securitymode = "nopass";
            break;
    }
    return securitymode
}
function showqr(e){
    var id, arrname, index, _ev = e || event, qrcodeStr;
    var target = _ev.target || _ev.srcElemnt;
    id = target.id;
    arrname = id.split(",")[0];
    index = parseInt(id.split(",")[1]);
    var ssidInfo = {};
    if(arrname == 'g_wifi_24'){
        ssidInfo = g_wifi_24[index];
    } else {
        ssidInfo = g_wifi_5[index];
    }
    var wifiAuthMode = switchMode(ssidInfo.securitymode);
    ssidInfo.securitykey = wifiAuthMode == "nopass" ? "" : ssidInfo.securitykey;
    qrcodeStr = "WIFI:T:" + wifiAuthMode + "" + ";S:" + ssidInfo.ssid + ";P:"+ssidInfo.securitykey+";;";
    layer.open({
        title: '',
        type: 1,
        content: "<div style='width:300px;height: 300px;display: flex;justify-content: center;align-items: center'><div id='qrcode_div'></div></div>"
    });
    var qrcode = new QRCode(document.getElementById("qrcode_div"), {
        width : 200,
        height : 200
    });
    qrcode.makeCode(qrcodeStr);
}
function initModePage(){
    initPageStr();
    getProfileInfo();
    initData();
    firstFlag=false;
    $(".qrcode").on("click",function(ev){
        showqr(ev);
    });
}
function initData(){
    initInternet();
    initWifi();
    initClients();
    initstatistics();
    homeTimeout = setTimeout(initData, 3000);
}
function initstatistics(){
    var postdata = ['statistics_tx_bytes_rate','statistics_rx_bytes_rate'];
    ajaxGetJsonData(postdata, function(obj,data){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            statistics_Top = data.statistics_tx_bytes_rate || 0;
            statistics_Bottom = data.statistics_rx_bytes_rate || 0;
            $("#statistics_tb").text(transform(statistics_Top)+'/s   /   '+transform(statistics_Bottom)+'/s');
        }
    },{
        
    });
    
}

var g_clienthtmltr = [
    '<tr><td>%index</td><td><span class="span-ltr">%hostname</span></td><td><span class="span-ltr">%mac</span></td><td><span class="span-ltr">%ip</span></td><td>%type</td></tr>'
];

function showInternet(){
    if(g_curInternetMode == g_internetSIM ){
        $("#internetMode").text(str_internetMode_mobile_mode);
        var label = "<span>"+$.trim(g_operatorNameHome.replace("\n","</br>"))+"</span><span>&nbsp;&nbsp;</span><span>"+$.trim(g_curNetworkTypeHome)+"</span>";
        $("#connectMode").html(label).parent("tr").show();
    }else if(g_curInternetMode == g_internetETH){
        $("#internetMode").text(str_internetMode_ethernet_mode);
        $("#connectMode").parent("div").hide();
    }else{
        $("#internetMode").text(common_unknown);
        $("#connectMode").parent("div").hide();
    }

    if (g_wanStatusInfo.status == g_wanConnect) {
        $("#networkStatus").text(str_ethernet_status_conned);
    } else if (g_wanStatusInfo.status == g_wanDisconnect) {
        $("#networkStatus").text(str_ethernet_status_disconned);
    } else {
        $("#networkStatus").text(common_unknown);
    }

    if(g_wanStatusInfo.uptime.length>0){
        $("#connectionUptime").text(g_wanStatusInfo.uptime);
    }else{
        $("#connectionUptime").text(common_unknown);
    }
    if(g_wanStatusInfo.ipaddr.length>0){
        $("#ipAddress").text(g_wanStatusInfo.ipaddr);
    }else{
        $("#ipAddress").text(common_unknown);
    }
    if(g_wanStatusInfo.netmask.length>0){
        $("#subnetMask").text(g_wanStatusInfo.netmask);
    }else{
        $("#subnetMask").text(common_unknown);
    }
    if(g_wanStatusInfo.gateway.length>0){
        $("#defaultGateway").text(g_wanStatusInfo.gateway);
    }else{
        $("#defaultGateway").text(common_unknown);
    }
    if(g_wanStatusInfo.dns1.length>0){
        $("#primaryDNS").text(g_wanStatusInfo.dns1);
    }else{
        $("#primaryDNS").text(common_unknown);
    }
   if(g_wanStatusInfo.dns2.length>0){
       $("#secondaryDNS").text(g_wanStatusInfo.dns2);
   }else{
       $("#secondaryDNS").text(common_unknown);
   }
    if(g_wanStatusInfo.ipv6.length>0 && flag){
        $("#ipv6Address").text(g_wanStatusInfo.ipv6);
    }else{
        $("#ipv6Address").text(common_unknown);
    }
    if(g_wanStatusInfo.ipv6dns1.length>0 && flag){
        $("#ipv6primaryDNS").text(g_wanStatusInfo.ipv6dns1);
    }else{
        $("#ipv6primaryDNS").text(common_unknown);
    }
    if(g_wanStatusInfo.ipv6dns2.length>0 && flag){
        $("#ipv6secondaryDNS").text(g_wanStatusInfo.ipv6dns2);
    }else{
        $("#ipv6secondaryDNS").text(common_unknown);
    }
    if(g_ipv6Status == g_ipv6_support){
        $(".ipv6hide").show();
    }else{
        $(".ipv6hide").hide();
    }
}
function parseData(device_uptime, dataString){
    var internet_info_arry = dataString.split(",");
    g_wanStatusInfo.status = internet_info_arry[0];
    if(g_wanStatusInfo.status == g_wanConnect){
        timelong = device_uptime - Number(internet_info_arry[1]);
        //g_wanStatusInfo.macaddr=internet_info_arry[2];
        g_wanStatusInfo.ipaddr = internet_info_arry[3];
        g_wanStatusInfo.netmask = internet_info_arry[4];
        g_wanStatusInfo.gateway = internet_info_arry[5];
        g_wanStatusInfo.dns1 = internet_info_arry[6];
        g_wanStatusInfo.dns2 = internet_info_arry[7];
        g_wanStatusInfo.ipv6 = internet_info_arry[8];
        g_wanStatusInfo.ipv6dns1 = internet_info_arry[9];
        g_wanStatusInfo.ipv6dns2 = internet_info_arry[10];
    }else{
        timelong = 0;
    }
}
function initInternet(){
    //获取拨号连接状态
    var internetPostdata = ["device_uptime", "rt_wwan_conn_info", "rt_eth_conn_info"];
    ajaxGetJsonData(internetPostdata, function(obj,data){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            var device_uptime = data.device_uptime;
            if(g_curInternetMode == g_internetSIM) {
                parseData(device_uptime, data.rt_wwan_conn_info);
            }else if(g_curInternetMode == g_internetETH){
                parseData(device_uptime, data.rt_eth_conn_info);
            }else{
                timelong = 0;
            }
            g_wanStatusInfo.uptime =transformtime(timelong);
        }
    }, {
        async: false,
        timeout: 1000
    });
    if(g_curInternetMode == g_internetSIM) {
        if (g_networkType == g_networkModeNONE){
            g_curNetworkTypeHome = str_home_noservice;
        } else if (g_networkType == g_networkModeCDMA || g_networkType == g_networkModeGSM) {
            g_curNetworkTypeHome = common_2G;
        } else if (g_networkType == g_networkModeEVDO ||
            g_networkType === g_networkModeWCDMA ||
            g_networkType === g_networkModeTDSCDMA)
        {
            g_curNetworkTypeHome = common_3G;
        } else if (g_networkType == g_networkModeLTE) {
            g_curNetworkTypeHome = common_4G;
        } else if (g_networkType == g_networkModeNR5G || g_networkType == g_networkModeNSA) {
            g_curNetworkTypeHome = common_5G;
        } else {
            g_curNetworkTypeHome = common_limited;
        }
    }
    showInternet();
}
function showWifi(){
    var i, html24 = "",html5 = "";
    var trHead24 = "<div class='label_tr'><div class='colspan_th'>"+str_home_wifi24 + "</div></div>";
    var trHead5 = "<div class='label_tr'><div class='colspan_th'>"+str_home_ssid_wifi5 + "</div></div>";
    if(g_wifi_24.length > 0){
        html24 += trHead24;
        for (i=0;i<1;i++){
            var statusText = g_wifi_24[i].ssidstatus == wifi_enabled ? common_enable : (g_wifi_24[i].ssidstatus == wifi_disabled ? common_disable : common_unknown);
            var qrcodeEle = "<div class='qrcode' title='"+common_qrcode+"' id='g_wifi_24,"+i+"'></div>";
            var qrcodeStatus = g_wifi_24[i].ssidstatus == wifi_disabled ?  "" :  qrcodeEle;
                html24 += "<div class='label_tr' style='position: relative'><div>"+str_home_status+common_colon+"</div><div>"+statusText+"</div></div><div class='label_tr'><div>"
        +str_home_ssid_name+common_colon+"</div><div><div class='qr'><div>"+g_wifi_24[i].ssid+"</div>"+qrcodeStatus+"</div></div></div></div>";
            if(!(g_wifi_24[i].securitymode == "open" || g_wifi_24[i].securitymode == "shared" || g_wifi_24[i].securitymode == "wpa3_owe")){
                html24 += "<div class='label_tr showTr'><div>"
        +str_home_ssid_password+common_colon+"</div><div><div>"+g_wifi_24[i].securitykey+"</div></div></div>";
            }
        }
    }
    if(g_wifi_5.length > 0){
        html5 += trHead5;
        for (i=0;i<g_wifi_5.length;i++){
            var statusText = g_wifi_5[i].ssidstatus == wifi_enabled ? common_enable: (g_wifi_5[i].ssidstatus == wifi_disabled ? common_disable:common_unknown);
            var qrcodeEle = "<div class='qrcode' title='"+common_qrcode+"' id='g_wifi_5,"+i+"'></div>";
            var qrcodeStatus = g_wifi_5[i].ssidstatus == wifi_disabled ?  "" :  qrcodeEle;
                html5 += "<div class='label_tr' style='position: relative'><div>"+str_home_status+common_colon+"</div><div>"+statusText+"</div></div><div class='label_tr'><div>"
        +str_home_ssid_name+common_colon+"</div><div><div class='qr'><div>"+g_wifi_5[i].ssid+"</div>"+qrcodeStatus+"</div></div></div></div>";
            if(!(g_wifi_5[i].securitymode == "open" || g_wifi_5[i].securitymode == "shared" || g_wifi_5[i].securitymode == "wpa3_owe")){
               html5 += "<div class='label_tr showTr'><div>"
        +str_home_ssid_password+common_colon+"</div><div><div>"+g_wifi_5[i].securitykey+"</div></div></div>";;
            }    
        }
    }
    $("#wifiInfo").html(html24);
}
function initWifi(){
    var postdatawifi = [];
    for(var i =0;i<wifi_num_total;i++){
        postdatawifi.push("wifi_freq_"+i);
        postdatawifi.push("wifi_state_"+i);
        postdatawifi.push("wifi_ssid_"+i);
        postdatawifi.push("wifi_security_"+i);
        postdatawifi.push("xmg_wifi_psk_"+i);
        postdatawifi.push("wifi_mode_"+i);
    }
    ajaxGetJsonData(postdatawifi, function(obj,data){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess) {
            var j;
            var wifiobj = {};
            if(wifiFirstFlag){
                g_wifi_24 = [];
                g_wifi_5 = [];
                wifiFirstFlag = false;
                wifiFirstData = data;
                for(j =0;j<wifi_num_total;j++){
                    wifiobj = {};
                    wifiobj.ssidstatus = data["wifi_state_"+j];
                    wifiobj.ssid = data["wifi_ssid_"+j];
                    wifiobj.securitykey = data["wifi_psk_"+j];
                    wifiobj.securitymode = data["wifi_security_"+j];
                    if(data["wifi_mode_"+j] !="sta"){
                    if(data["wifi_freq_"+j] == "2.4g"){
                        g_wifi_24.push(wifiobj);
                        }else if(data["wifi_freq_"+j] == "5g" || data["wifi_freq_"+j] == "5g_ex"){
                            g_wifi_5.push(wifiobj);
                        }
                    }
                }
                showWifi();
            }else{
                if(!objSame(wifiFirstData, data)){
                    g_wifi_24 = [];
                    g_wifi_5 = [];
                    wifiFirstData = data;
                    for(j =0;j<wifi_num_total;j++){
                        wifiobj = {};
                        wifiobj.ssidstatus = data["wifi_state_"+j];
                        wifiobj.ssid = data["wifi_ssid_"+j];
                        wifiobj.securitykey = data["wifi_psk_"+j];
                        wifiobj.securitymode = data["wifi_security_"+j];
                        if(data["wifi_mode_"+j] !="sta"){
                             if(data["wifi_freq_"+j] == "2.4g"){
                                g_wifi_24.push(wifiobj);
                            }else if(data["wifi_freq_"+j] == "5g" || data["wifi_freq_"+j] == "5g_ex"){
                                g_wifi_5.push(wifiobj);
                            }
                        }
                    }
                    showWifi();
                }
            }
        }
    }, {
        async: false
    });
}

function showClients(g_clientsList){
    var totalhtml="";
    var temphtml="<tr><th>" + str_home_index + "</th><th>" + str_home_hostname +
        "</th><th>" + str_home_Mac + "</th><th>" + str_home_ip +
        "</th><th>" + str_home_type + "</th></tr>";
    var len = g_clientsList.length;
    for(var i = 0; i < len; i++) {
        var leftclient=g_clienthtmltr.join("");
        leftclient = leftclient.replace("%index", i+1);
        if(g_clientsList[i].rt_hosts_hostname.length>0){
            leftclient = leftclient.replace("%hostname", g_clientsList[i].rt_hosts_hostname);
        }else{
            leftclient = leftclient.replace("%hostname", common_unknown);
        }
        if(g_clientsList[i].rt_hosts_mac.length>0){
            leftclient = leftclient.replace("%mac", g_clientsList[i].rt_hosts_mac.toUpperCase());
        }else{
            leftclient = leftclient.replace("%mac", common_unknown);
        }
        if(g_clientsList[i].rt_hosts_ip.length>0){
            leftclient = leftclient.replace("%ip", g_clientsList[i].rt_hosts_ip);
        }else{
            leftclient = leftclient.replace("%ip", common_unknown);
        }
        if(g_clientsList[i].rt_hosts_type == connected_type_lan){
            leftclient = leftclient.replace("%type", "LAN");
        }else if(g_clientsList[i].rt_hosts_type == connected_type_wifi){
            leftclient = leftclient.replace("%type", "Wi-Fi");
        }else if(g_clientsList[i].rt_hosts_type == connected_type_usb){
            leftclient = leftclient.replace("%type", "USB");
        }else{
            leftclient = leftclient.replace("%type", common_unknown);
        }
        temphtml=temphtml+leftclient;
        if(i+1 == len){
            totalhtml=totalhtml+temphtml;
        }
    }
    $("#clients").html(temphtml);
}
function objSame (obj,newObj) {
    var bol = true;
    if (Object.keys(obj).length != Object.keys(newObj).length) {
        return false;
    }
    for(var key in obj) {
        if ( obj[key] instanceof Object) {
            bol = objSame(obj[key],newObj[key]);
            if (!bol) {
                break;
            }
        } else if ( obj[key] instanceof Array) {
            bol = arrSame(obj[key],newObj[key])
            if (!bol) {
                break;
            }
        } else if (obj[key] != newObj[key]) {
            bol =  false;
            break;
        }
    }
    return bol
}
function arrSame (arr,newArr) {
    var bol = true;
    if (arr.length != newArr.length) {
        return false;
    }
    for (var i = 0, n = arr.length;i < n; i++) {
        if (arr[i] instanceof Array) {
            bol = arrSame(arr[i],newArr[i])
            if (!bol) {
                break;
            }
        } else if (arr[i] instanceof Object) {
            bol = objSame(arr[i],newArr[i])
            if (!bol) {
                break;
            }
        }else if (arr[i] != newArr[i]) {
            bol = false;
            break;
        }
    }
    return bol;
}
function initClients(){
    getAjaxJsonData("/action/router_get_hosts_info", function(obj){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess) {
            if(clientFirstFlag){
                clientFirstFlag = false;
                clientFirstData = obj.data;
                showClients(clientFirstData.rt_hosts_list);
            }else{
                if(!objSame(clientFirstData, obj.data)){
                    clientFirstData = obj.data;
                    showClients(clientFirstData.rt_hosts_list);
                }
            }
        }
    }, {
        async: true
    });
}

function getProfileInfo(){
    var i, profilePostdata=["dialup_profile_default"];
    for(i = 1;i<=30;i++){
        profilePostdata.push("dialup_profile_"+i);
    }
    ajaxGetJsonData(profilePostdata, function(obj,data){
        if (typeof obj.retcode === "number" && obj.retcode === g_resultSuccess){
            for(var i=1;i<=30;i++){
                if(data["dialup_profile_"+i] != "" && typeof(data["dialup_profile_"+i]) != "undefined"){
                    var profileObj={};
                    profileObj.index = i;
                    profileObj.iptype = data["dialup_profile_"+i].split(",")[5];
                    g_profileList.push(profileObj);
                }
            }
            g_defaultProfileID = parseInt(data.dialup_profile_default);
            for(var i = 0; i < g_profileList.length; i++){
                if(g_profileList[i].index == g_defaultProfileID){
                    g_profileList[i].iptype == "ipv4" ? flag = false : flag = true;
                }
            }
        }
    }, {
        async: false
    });
}
function transform(bytes){
    var i;
    if (bytes < 1024){
        return bytes + ' B';
    }else if(bytes < 1024 * 1024){
        i = parseFloat(bytes/(1024)).toFixed(2);
        return  i + ' KB';
    }else if(bytes < 1024 * 1024 * 1024){
        i = parseFloat(bytes/(1024 * 1024)).toFixed(2);
        return i + " MB";
    }else if(bytes < 1024 * 1024 * 1024 * 1024){
        i = parseFloat(bytes/(1024 * 1024 * 1024)).toFixed(2);
        return i + " GB";
    }else{
        i = parseFloat(bytes/(1024 * 1024 * 1024 * 1024)).toFixed(2);
        return i + " TB";
    }
}