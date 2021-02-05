var AdvTag = 
{
    
};

AdvTag.plugin = {};

AdvTag.plugin.parse = {
    tyrano: null,
    kag: null,
    flag_script: false,
    deep_if: 0,
    init: function() {},
    loadConfig: function(call_back) {
        var that = this;
        $.loadText("./data/system/Config.tjs", function(text_str) {
            var map_config = that.compileConfig(text_str);
            if (call_back) call_back(map_config)
        })
    },
    compileConfig: function(text_str) {
        var error_str = "";
        var map_config = {};
        var array_config = text_str.split("\n");
        for (var i = 0; i < array_config.length; i++) try {
            var line_str = $.trim(array_config[i]);
            if (line_str != "" && line_str.substr(0, 1) ===
                ";") {
                var tmp_comment = line_str.split("//");
                if (tmp_comment.length > 1) line_str = $.trim(tmp_comment[0]);
                line_str = $.replaceAll(line_str, ";", "");
                line_str = $.replaceAll(line_str, '"', "");
                var tmp = line_str.split("=");
                var key = $.trim(tmp[0]);
                var val = $.trim(tmp[1]);
                map_config[key] = val
            }
        } catch (e) {
            error_str += "Error:Config.tjs\u306b\u8aa4\u308a\u304c\u3042\u308a\u307e\u3059/\u884c:" + i + ""
        }
        if (error_str != "") alert(error_str);
        return map_config
    },
    parseScenario: function(text_str) {
        var array_s = [];
        var map_label = {};
        var array_row =
            text_str.split("\n");
        var flag_comment = false;
        for (var i = 0; i < array_row.length; i++) {
            var line_str = $.trim(array_row[i]);
            var first_char = line_str.substr(0, 1);
            if (line_str.indexOf("endscript") != -1) this.flag_script = false;
            if (flag_comment === true && line_str === "*/") flag_comment = false;
            else if (line_str === "/*") flag_comment = true;
            else if (flag_comment == true || first_char === ";");
            else if (first_char === "#") {
                var tmp_line = $.trim(line_str.replace("#", ""));
                var chara_name = "";
                var chara_face = "";
                if (tmp_line.split(":").length > 1) {
                    var array_line =
                        tmp_line.split(":");
                    chara_name = array_line[0];
                    chara_face = array_line[1]
                } else chara_name = tmp_line;
                var text_obj = {
                    line: i,
                    name: "chara_ptext",
                    pm: {
                        "name": chara_name,
                        "face": chara_face
                    },
                    val: text
                };
                array_s.push(text_obj)
            } else if (first_char === "*") {
                var label_tmp = line_str.substr(1, line_str.length).split("|");
                var label_key = "";
                var label_val = "";
                label_key = $.trim(label_tmp[0]);
                if (label_tmp.length > 1) label_val = $.trim(label_tmp[1]);
                var label_obj = {
                    name: "label",
                    pm: {
                        "line": i,
                        "index": array_s.length,
                        "label_name": label_key,
                        "val": label_val
                    },
                    val: label_val
                };
                array_s.push(label_obj);
                if (map_label[label_obj.pm.label_name]) this.kag.warning("Warning line:" + i + " " + $.lang("label") + "'" + label_obj.pm.label_name + "'" + $.lang("label_double"));
                else map_label[label_obj.pm.label_name] = label_obj.pm
            } else if (first_char === "@") {
                var tag_str = line_str.substr(1, line_str.length);
                var tmpobj = this.makeTag(tag_str, i);
                array_s.push(tmpobj)
            } else {
                if (first_char === "_") line_str = line_str.substring(1, line_str.length);
                var array_char = line_str.split("");
                var text = "";
                var tag_str = "";
                var flag_tag = false;
                var num_kakko = 0;
                for (var j = 0; j < array_char.length; j++) {
                    var c = array_char[j];
                    if (flag_tag === true)
                        if (c === "]" && this.flag_script == false) {
                            num_kakko--;
                            if (num_kakko == 0) {
                                flag_tag = false;
                                array_s.push(this.makeTag(tag_str, i));
                                tag_str = ""
                            } else tag_str += c
                        } else if (c === "[" && this.flag_script == false) {
                        num_kakko++;
                        tag_str += c
                    } else tag_str += c;
                    else if (flag_tag === false && c === "[" && this.flag_script == false) {
                        num_kakko++;
                        if (text != "") {
                            var text_obj = {
                                line: i,
                                name: "text",
                                pm: {
                                    "val": text
                                },
                                val: text
                            };
                            array_s.push(text_obj);
                            text = ""
                        }
                        flag_tag = true
                    } else text += c
                }
                if (text != "") {
                    var text_obj = {
                        line: i,
                        name: "text",
                        pm: {
                            "val": text
                        },
                        val: text
                    };
                    array_s.push(text_obj)
                }
            }
        }
        var result_obj = {
            array_s: array_s,
            map_label: map_label
        };
        if (this.deep_if != 0) {
            alert("[if]\u3068[endif]\u306e\u6570\u304c\u4e00\u81f4\u3057\u307e\u305b\u3093\u3002\u30b7\u30ca\u30ea\u30aa\u3092\u898b\u76f4\u3057\u3066\u307f\u307e\u305b\u3093\u304b\uff1f");
            this.deep_if = 0
        }
        return result_obj
    },
    makeTag: function(str, line) {
        var obj = {
            line: line,
            name: "",
            pm: {},
            val: ""
        };
        var array_c = str.split("");
        var flag_quot_c = "";
        var tmp_str = "";
        var cnt_quot_c = 0;
        for (var j = 0; j < array_c.length; j++) {
            var c = array_c[j];
            if (flag_quot_c == "" && (c === '"' || c === "'")) {
                flag_quot_c = c;
                cnt_quot_c = 0
            } else if (flag_quot_c != "")
                if (c === flag_quot_c) {
                    flag_quot_c = "";
                    if (cnt_quot_c == 0) tmp_str += "undefined";
                    cnt_quot_c = 0
                } else {
                    if (c == "=") c = "#";
                    if (c == " ") c = "";
                    tmp_str += c;
                    cnt_quot_c++
                }
            else tmp_str += c
        }
        str = tmp_str;
        var array = str.split(" ");
        obj.name = $.trim(array[0]);
        for (var k = 1; k < array.length; k++)
            if (array[k] == "") {
                array.splice(k, 1);
                k--
            } else if (array[k] ===
            "=") {
            if (array[k - 1])
                if (array[k + 1]) {
                    array[k - 1] = array[k - 1] + "=" + array[k + 1];
                    array.splice(k, 2);
                    k--
                }
        } else if (array[k].substr(0, 1) === "=") {
            if (array[k - 1])
                if (array[k]) {
                    array[k - 1] = array[k - 1] + array[k];
                    array.splice(k, 1)
                }
        } else if (array[k].substr(array[k].length - 1, array[k].length) === "=")
            if (array[k + 1])
                if (array[k]) {
                    array[k] = array[k] + array[k + 1];
                    array.splice(k + 1, 1)
                } for (var i = 1; i < array.length; i++) {
            var tmp = $.trim(array[i]).split("=");
            var pm_key = $.trim(tmp[0]);
            var pm_val = $.trim(tmp[1]);
            if (pm_key == "*") obj.pm["*"] = "";
            if (pm_val !=
                "") obj.pm[pm_key] = $.replaceAll(pm_val, "#", "=");
            if (pm_val == "undefined") obj.pm[pm_key] = ""
        }
        if (obj.name == "iscript") this.flag_script = true;
        if (obj.name == "endscript") this.flag_script = false;
        switch (obj.name) {
            case "if":
                this.deep_if++;
            case "elsif":
            case "else":
                obj.pm.deep_if = this.deep_if;
                break;
            case "endif":
                obj.pm.deep_if = this.deep_if;
                this.deep_if--;
                break
        }
        return obj
    },
    test: function() {}
};