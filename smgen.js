String.prototype.repeat= function(n){
    var output = "";
    for(var i = 0; i < n; i++) {
        output += this;
    }
    return output;
};

function sprintf () {
    // http://kevin.vanzonneveld.net
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Paulo Freitas
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Dj
    // +   improved by: Allidylls
    // *     example 1: sprintf("%01.2f", 123.1);
    // *     returns 1: 123.10
    // *     example 2: sprintf("[%10s]", 'monkey');
    // *     returns 2: '[    monkey]'
    // *     example 3: sprintf("[%'#10s]", 'monkey');
    // *     returns 3: '[####monkey]'
    // *     example 4: sprintf("%d", 123456789012345);
    // *     returns 4: '123456789012345'
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
    var a = arguments,
        i = 0,
        format = a[i++];

    // pad()
    var pad = function (str, len, chr, leftJustify) {
        if (!chr) {
            chr = ' ';
        }
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {
            '2': '0b',
            '8': '0',
            '16': '0x'
        }[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;

        if (substring == '%%') {
            return '%';
        }

        // parse flags
        var leftJustify = false,
            positivePrefix = '',
            zeroPad = false,
            prefixBaseX = false,
            customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) {
            switch (flags.charAt(j)) {
                case ' ':
                    positivePrefix = ' ';
                    break;
                case '+':
                    positivePrefix = '+';
                    break;
                case '-':
                    leftJustify = true;
                    break;
                case "'":
                    customPadChar = flags.charAt(j + 1);
                    break;
                case '0':
                    zeroPad = true;
                    break;
                case '#':
                    prefixBaseX = true;
                    break;
            }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined;
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
            case 's':
                return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c':
                return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b':
                return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o':
                return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x':
                return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X':
                return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u':
                return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd':
                number = +value || 0;
                number = Math.round(number - number % 1); // Plain Math.round doesn't just truncate
                prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            case 'e':
            case 'E':
            case 'f': // Should handle locales (as per setlocale)
            case 'F':
            case 'g':
            case 'G':
                number = +value;
                prefix = number < 0 ? '-' : positivePrefix;
                method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            default:
                return substring;
        }
    };

    return format.replace(regex, doFormat);
}

function htmlspecialchars(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

$(document).ready(function() {
    var fieldTypes = [{
        key: 'int',
        text: 'Integer'
    }, {
        key: 'float',
        text: 'Float'
    }, {
        key: 'string',
        text: 'String'
    }, {
        key: 'char',
        text: 'Character'
    }, {
        key: 'vector',
        text: 'Vector'
    }, {
        key: 'bool',
        text: 'Bool'
    }, {
        key: 'handle',
        text: 'Handle'
    }, {
        key: 'array',
        text: 'Array [no kv write :( sorry]'
    }, {
        key: 'vectors',
        text: 'Vectors [adt]'
    }, {
        key: 'strings',
        text: 'Strings [adt]'
    }, {
        key: 'ints',
        text: 'Integers [adt]'
    }, {
        key: 'floats',
        text: 'Floats [adt]'
    }, {
        key: 'handles',
        text: 'Handles [adt]'
    }, {
        key: 'bools',
        text: 'Bools [adt]'
    }];

    var initialStructure = {
        name: 'War3Race',
        functionPrefix: 'War3_',
        paramPrefix: 'p_',
        variablePrefix: 's_',
        indentUseSpaces: true,
        indentSpaceCount: 4,
        threadedQueries: true,
        fields: [{
            name: 'ID',
            type: 'int',
            maxLength: '',
            doNotSave: false,
            doNotLoad: false
        }, {
            name: 'ShortName',
            type: 'string',
            maxLength: '32',
            doNotSave: false,
            doNotLoad: false
        }, {
            name: 'Description',
            type: 'string',
            maxLength: '512',
            doNotSave: false,
            doNotLoad: false
        }]
    };

    var vipPlayerStructure = {
        name: 'VIPPlayer',
        functionPrefix: 'PTV_',
        paramPrefix: 'p_',
        variablePrefix: 's_',
        indentUseSpaces: true,
        indentSpaceCount: 4,
        threadedQueries: true,
        fields: [{
            name: 'SteamID',
            type: 'string',
            maxLength: '64',
            doNotSave: false,
            doNotLoad: false
        }, {
            name: 'Client',
            type: 'int',
            maxLength: '',
            doNotSave: true,
            doNotLoad: true
        }, {
            name: 'WasVIPLastRound',
            type: 'bool',
            maxLength: '',
            doNotSave: true,
            doNotLoad: true
        }, {
            name: 'IsVIP',
            type: 'bool',
            maxLength: '',
            doNotSave: true,
            doNotLoad: true
        }, {
            name: 'Points',
            type: 'int',
            maxLength: '',
            doNotSave: false,
            doNotLoad: false
        }]
    };

    var vipRescueZoneStructure = {
        name: 'RescueZone',
        functionPrefix: 'PTV_',
        paramPrefix: 'p_',
        variablePrefix: 's_',
        indentUseSpaces: true,
        indentSpaceCount: 4,
        threadedQueries: true,
        fields: [{
            name: 'Name',
            type: 'string',
            maxLength: '128',
            doNotSave: false,
            doNotLoad: false
        }, {
            name: 'Position',
            type: 'vector',
            maxLength: '',
            doNotSave: false,
            doNotLoad: false
        }, {
            name: 'Radius',
            type: 'float',
            maxLength: '',
            doNotSave: false,
            doNotLoad: false
        }]
    };

    $('.vipPlayerExampleLink').click(function() {
        loadStructure(vipPlayerStructure);
    });

    $('.vipRescueZoneExampleLink').click(function() {
        loadStructure(vipRescueZoneStructure);
    });

    var genForm = $('#gen');
    var fieldList = $('#gen tbody');

    var fixUpDownLinks = function() {
        $('.moveUpFieldLink').show().first().hide();
        $('.moveDownFieldLink').show().last().hide();
    };

    fixUpDownLinks();

    var buildTypeBox = function(selectedType) {
        var html = "<select name='field_type[]'>";

        $.each(fieldTypes, function() {
            var fieldTypeInfo = this;

            var selectedStr = selectedType == fieldTypeInfo['key'] ? ' selected ' : '';

            html += '<option ' + selectedStr + 'value="' + fieldTypeInfo['key'] + '">' + fieldTypeInfo['text'] + '</option>';
        });

        html += '</select>';

        return html;
    };

    var loadStructure = function(structureInfo) {
        fieldList.html('');

        genForm.find(':input[name=structure_name]').val(structureInfo['name']);
        genForm.find(':input[name=function_prefix]').val(structureInfo['functionPrefix']);
        genForm.find(':input[name=function_param_prefix]').val(structureInfo['paramPrefix']);
        genForm.find(':input[name=function_var_prefix]').val(structureInfo['variablePrefix']);

        if(structureInfo['indentUseSpaces']) {
            genForm.find(':input[name=generate_use_spaces]').attr('checked', 'checked');
        }
        else {
            genForm.find(':input[name=generate_use_spaces]').removeAttr('checked');
        }

        genForm.find(':input[name=generate_space_count]').val(structureInfo['indentSpaceCount']);

        $.each(structureInfo['fields'], function() {
            var fieldInfo = this;

            var fieldRow = $(document.createElement('tr'));

            var nameColumn = $('<td><input type="text" name="field_name[]" value="' + fieldInfo['name'] + '" /></td>');

            var typeColumn = $('<td>' + buildTypeBox(fieldInfo['type']) + '</td>');
            var maxlenColumn = $('<td><input type="text" name="field_maxlen[]" value="' + fieldInfo['maxLength'] + '" /></td>');

            var removeColumn = $('<td><a href="#" class="removeFieldLink">Remove Field</a></td>');

            var upColumn = $('<td><a href="#" class="moveUpFieldLink">Move Up</a></td>');
            var downColumn = $('<td><a href="#" class="moveDownFieldLink">Move Down</a></td>');
            
            var doNotSaveCheckedStr = fieldInfo['doNotSave'] ? ' checked="checked" ' : '';
            var doNotSaveColumn = $('<td><input type="checkbox" name="field_do_not_save[]" ' + doNotSaveCheckedStr + ' value="1" /></td>');

            var doNotLoadCheckedStr = fieldInfo['doNotLoad'] ? ' checked="checked" ' : '';
            var doNotLoadColumn = $('<td><input type="checkbox" name="field_do_not_load[]" ' + doNotLoadCheckedStr + 'value="1" /></td>');

            fieldRow.append(nameColumn, typeColumn, maxlenColumn, doNotSaveColumn, doNotLoadColumn, removeColumn, upColumn, downColumn);

            fieldList.append(fieldRow);
        });

        fixUpDownLinks();
    };

    loadStructure(initialStructure);

    $('body').delegate('.removeFieldLink', 'click', function() {
        var tr = $(this).parents('tr');

        tr.remove();

        fixUpDownLinks();

        return false;
    });

    $('body').delegate('.moveUpFieldLink', 'click', function() {
        var tr = $(this).parents('tr');

        var prevTr = tr.prev();

        prevTr.before(tr);

        fixUpDownLinks();

        return false;
    });

    $('body').delegate('.moveDownFieldLink', 'click', function() {
        var tr = $(this).parents('tr');

        var nextTr = tr.next();

        nextTr.after(tr);

        fixUpDownLinks();

        return false;
    });

    $('.addFieldLink').click(function() {
        var fieldRow = $(document.createElement('tr'));

        var nameColumn = $('<td><input type="text" name="field_name[]" value="" /></td>');
        var typeColumn = $('<td>' + buildTypeBox() + '</td>');
        var maxlenColumn = $('<td><input type="text" name="field_maxlen[]" value="" /></td>');
        var removeColumn = $('<td><a href="#" class="removeFieldLink">Remove Field</a></td>');
        var upColumn = $('<td><a href="#" class="moveUpFieldLink">Move Up</a></td>');
        var downColumn = $('<td><a href="#" class="moveDownFieldLink">Move Down</a></td>');

        var doNotSaveColumn = $('<td><input type="checkbox" name="field_do_not_save[]" value="1" /></td>');
        var doNotLoadColumn = $('<td><input type="checkbox" name="field_do_not_load[]" value="1" /></td>');

        fieldRow.append(nameColumn, typeColumn, maxlenColumn, doNotSaveColumn, doNotLoadColumn, removeColumn, upColumn, downColumn);

        fieldList.append(fieldRow);

        fixUpDownLinks();

        return false;
    });

    genForm.submit(function() {
        var outputText = '';
        var fnPrefix = $.trim($(':input[name=function_prefix]').val());
        var paramPrefix = $.trim($(':input[name=function_param_prefix]').val());
        var structName = $.trim($(':input[name=structure_name]').val());
        var useSpacesInstead = $(':input[name="generate_use_spaces"]').is(':checked');
        var spaceCount = $(':input[name="generate_space_count"]').val();
        var varPrefix = $.trim($(':input[name=function_var_prefix]').val());
        var failedValidation = false;

        // Validation
        if(varPrefix == paramPrefix) {
            alert("Please make sure that the variable prefix is different than the function parameter prefix.");
            $(':input[name=function_param_prefix]').focus();
            return false;
        }

        if(varPrefix.length && !isNaN(varPrefix.charAt(0))) {
            alert("Your prefix may not start with a number.");
            $(':input[name=function_var_prefix]').focus();
            return false;
        }

        if(paramPrefix.length && !isNaN(paramPrefix.charAt(0))) {
            alert("Your prefix may not start with a number.");
            $(':input[name=function_param_prefix]').focus();
            return false;
        }

        if(fnPrefix.length && !isNaN(fnPrefix.charAt(0))) {
            alert("Your prefix may not start with a number.");
            $(':input[name=function_prefix]').focus();
            return false;
        }

        if(!structName.length) {
            alert("You must enter a name for this structure.");
            $(':input[name=structure_name]').focus();
            return false;
        }

        if(!isNaN(structName.charAt(0))) {
            alert("Your structure name must not begin with a number.");
            $(':input[name=structure_name]').focus();
            return false;
        }

        fieldList.find('tr').each(function(fieldIndex) {
            var tr = $(this);

            var fieldType = tr.find(':input[name="field_type[]"]').val();
            var fieldMaxLength = parseInt($.trim(tr.find(':input[name="field_maxlen[]"]').val()), 10);
            fieldMaxLength = isNaN(fieldMaxLength) ? 0 : fieldMaxLength;

            if(['string', 'array', 'strings'].indexOf(fieldType) != -1 && fieldMaxLength <= 0) {
                alert("Please enter a max length.");
                failedValidation = true;
                tr.find(':input[name="field_maxlen[]"]').focus();
                return false;
            }
        });

        if(failedValidation) {
            return false;
        }

        // Calculate size for CreateArray()
        var structSizeInCells = 1;

        fieldList.find('tr').each(function(fieldIndex) {
            var tr = $(this);

            var fieldType = tr.find(':input[name="field_type[]"]').val();
            var fieldMaxLength = parseInt($.trim(tr.find(':input[name="field_maxlen[]"]').val()), 10);
            fieldMaxLength = isNaN(fieldMaxLength) ? 0 : fieldMaxLength;

            var currentMemberSize = 0;

            if(fieldType == 'int') {
                currentMemberSize = 1;
            }
            else if(fieldType == 'float') {
                currentMemberSize = 1;
            }
            else if(fieldType == 'string') {
                currentMemberSize = Math.ceil(fieldMaxLength / 4);
            }
            else if(fieldType == 'char') {
                currentMemberSize = 1;
            }
            else if(fieldType == 'vector') {
                currentMemberSize = 3;
            }
            else if(fieldType == 'handle') {
                currentMemberSize = 1;
            }
            else if(fieldType == 'array') {
                currentMemberSize = fieldMaxLength;
            }
            else if(fieldType == 'bool') {
                currentMemberSize = 1;
            }
            else if(fieldType == 'vectors') {
                currentMemberSize = 1;
            }
            else if(fieldType == 'strings') {
                currentMemberSize = 1;
            }
            else if(fieldType == 'ints') {
                currentMemberSize = 1;
            }
            else if(fieldType == 'floats') {
                currentMemberSize = 1;
            }
            else if(fieldType == 'handles') {
                currentMemberSize = 1;
            }
            else if(fieldType == 'bools') {
                currentMemberSize = 1;
            }

            if(currentMemberSize > structSizeInCells) {
                structSizeInCells = currentMemberSize;
            }
        });

        var makeIndents = function(count) {
            count = typeof count == 'undefined' ? 1 : count;

            var singleIndentSpaces = " ".repeat(spaceCount);

            var indentChar = useSpacesInstead ? singleIndentSpaces : "\t";

            return indentChar.repeat(count);
        };

        var dblQuotify = function(text) {
            return "\"" + text.replace(/"/g, "\\\"") + "\"";
        };

        // Start with the function for creating a single object
        outputText += "stock Handle:" + fnPrefix + "Create" + structName + "(";

        var isFirst = true;

        fieldList.find('tr').each(function(fieldIndex) {
            var tr = $(this);
            var fieldType = tr.find(':input[name="field_type[]"]').val();
            var fieldName = tr.find(':input[name="field_name[]"]').val();
            var fieldMaxLength = parseInt($.trim(tr.find(':input[name="field_maxlen[]"]').val()), 10);
            fieldMaxLength = isNaN(fieldMaxLength) ? 0 : fieldMaxLength;

            if(!isFirst) {
                outputText += ', ';
            }

            if(fieldType == 'int') {
                outputText += paramPrefix + fieldName;
            }
            else if(fieldType == 'float') {
                outputText += 'Float:' + paramPrefix + fieldName;
            }
            else if(fieldType == 'string') {
                outputText += 'const String:' + paramPrefix + fieldName + '[]';
            }
            else if(fieldType == 'char') {
                outputText += 'const ' + paramPrefix + fieldName + '';
            }
            else if(fieldType == 'vector') {
                outputText += 'const Float:' + paramPrefix + fieldName + '[3]';
            }
            else if(fieldType == 'handle') {
                outputText += 'Handle:' + paramPrefix + fieldName;
            }
            else if(fieldType == 'array') {
                outputText += 'any:' + paramPrefix + fieldName + "[" + fieldMaxLength + "]";
            }
            else if(fieldType == 'bool') {
                outputText += 'bool:' + paramPrefix + fieldName;
            }
            else if(fieldType == 'vectors') {
                outputText += 'Handle:' + paramPrefix + fieldName;
            }
            else if(fieldType == 'strings') {
                outputText += 'Handle:' + paramPrefix + fieldName;
            }
            else if(fieldType == 'ints') {
                outputText += 'Handle:' + paramPrefix + fieldName;
            }
            else if(fieldType == 'floats') {
                outputText += 'Handle:' + paramPrefix + fieldName;
            }
            else if(fieldType == 'handles') {
                outputText += 'Handle:' + paramPrefix + fieldName;
            }
            else if(fieldType == 'bools') {
                outputText += 'Handle:' + paramPrefix + fieldName;
            }

            isFirst = false;
        });

        outputText += ") {\n";

        outputText += makeIndents(1) + "new Handle:" + varPrefix + structName + " = CreateArray(" + structSizeInCells + ");\n\n";

        fieldList.find('tr').each(function(fieldIndex) {
            var tr = $(this);
            var fieldType = tr.find(':input[name="field_type[]"]').val();
            var fieldName = tr.find(':input[name="field_name[]"]').val();
            var fieldMaxLength = parseInt($.trim(tr.find(':input[name="field_maxlen[]"]').val()), 10);
            fieldMaxLength = isNaN(fieldMaxLength) ? 0 : fieldMaxLength;

            if(['int', 'float', 'char', 'handle', 'bool', 'vectors', 'strings', 'ints', 'floats', 'handles', 'bools'].indexOf(fieldType) != -1) {
                outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", " + paramPrefix + fieldName + ");\n";
            }
            else if(fieldType == 'string') {
                outputText += makeIndents(1) + "PushArrayString(" + varPrefix + structName + ", " + paramPrefix + fieldName + ");\n";
            }
            else if(fieldType == 'vector') {
                outputText += makeIndents(1) + "PushArrayArray(" + varPrefix + structName + ", " + paramPrefix + fieldName + ", 3);\n";
            }
            else if(fieldType == 'array') {
                outputText += makeIndents(1) + "PushArrayArray(" + varPrefix + structName + ", " + paramPrefix + fieldName + ", " + fieldMaxLength + ");\n";
            }
        });

        outputText += "\n" + makeIndents(1) + "return " + varPrefix + structName + ";\n";

        outputText += "}\n\n";

        // Function for copying a single object
        outputText += "stock Handle:" + fnPrefix + "Copy" + structName + "(Handle:" + paramPrefix + structName + ") {\n";

        outputText += makeIndents(1) + "new Handle:" + varPrefix + structName + " = CreateArray(" + structSizeInCells + ");\n\n";

        fieldList.find('tr').each(function(fieldIndex) {
            var tr = $(this);
            var fieldType = tr.find(':input[name="field_type[]"]').val();
            var fieldName = tr.find(':input[name="field_name[]"]').val();
            var fieldMaxLength = parseInt($.trim(tr.find(':input[name="field_maxlen[]"]').val()), 10);
            fieldMaxLength = isNaN(fieldMaxLength) ? 0 : fieldMaxLength;

            if(['int', 'float', 'char', 'handle', 'bool', 'vectors', 'strings', 'ints', 'floats', 'handles', 'bools'].indexOf(fieldType) != -1) {
                outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + "));\n";
            }
            else if(fieldType == 'string') {
                outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "Output[" + fieldMaxLength + "];\n";
                outputText += makeIndents(1) + "GetArrayString(" + paramPrefix + structName + ", " + fieldIndex + ", " + varPrefix + fieldName + "Output, " + fieldMaxLength + ");\n";
                outputText += makeIndents(1) + "PushArrayString(" + varPrefix + structName + ", " + varPrefix + fieldName + "Output);\n"
            }
            else if(fieldType == 'vector') {
                outputText += makeIndents(1) + "decl Float:" + varPrefix + fieldName + "Output[3];\n";
                outputText += makeIndents(1) + "GetArrayArray(" + paramPrefix + structName + ", " + fieldIndex + ", " + varPrefix + fieldName + "Output, 3);\n";
                outputText += makeIndents(1) + "PushArrayArray(" + varPrefix + structName + ", " + varPrefix + fieldName + "Output, 3);\n"
            }
            else if(fieldType == 'array') {
                outputText += makeIndents(1) + "decl any:" + varPrefix + fieldName + "Output[" + fieldMaxLength + "];\n";
                outputText += makeIndents(1) + "GetArrayArray(" + paramPrefix + structName + ", " + fieldIndex + ", " + varPrefix + fieldName + "Output, " + fieldMaxLength + ");\n";
                outputText += makeIndents(1) + "PushArrayArray(" + varPrefix + structName + ", " + varPrefix + fieldName + "Output, " + fieldMaxLength + ");\n"
            }
        });

        outputText += "\n" + makeIndents(1) + "return " + varPrefix + structName + ";\n";

        outputText += "}\n\n";

        // Function for reading a single structure from KV
        outputText += "stock Handle:" + fnPrefix + "Read" + structName + "FromKV(Handle:" + paramPrefix + structName + "KV) {\n";

        outputText += makeIndents(1) + "new Handle:" + varPrefix + structName + " = CreateArray(" + structSizeInCells + ");\n\n";

        fieldList.find('tr').each(function(fieldIndex) {
            var tr = $(this);
            var fieldType = tr.find(':input[name="field_type[]"]').val();
            var fieldName = tr.find(':input[name="field_name[]"]').val();
            var fieldMaxLength = parseInt($.trim(tr.find(':input[name="field_maxlen[]"]').val()), 10);
            fieldMaxLength = isNaN(fieldMaxLength) ? 0 : fieldMaxLength;

            var fieldDoNotLoad = tr.find(':input[name="field_do_not_load[]"]').is(':checked');
            var constFieldValue = dblQuotify(fieldName);
            var constFieldCountValue = dblQuotify(fieldName + "_Count");
            var fieldTempKeySize = fieldName.length + 12;

            if(fieldType == 'int') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", 0);\n";
                }
                else {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", KvGetNum(" + paramPrefix + structName + "KV, " + constFieldValue + "));\n";
                }
            }
            else if(fieldType == 'float') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", 0.0);\n";
                }
                else {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", KvGetFloat(" + paramPrefix + structName + "KV, " + constFieldValue + "));\n";
                }
            }
            else if(fieldType == 'string') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayString(" + varPrefix + structName + ", \"\");\n";
                }
                else {
                    outputText += makeIndents(1) + "new String:" + varPrefix + fieldName + "Output[" + fieldMaxLength + "];\n";
                    outputText += makeIndents(1) + "KvGetString(" + paramPrefix + structName + "KV, " + constFieldValue + ", " + varPrefix + fieldName + "Output, " + fieldMaxLength + ");\n";
                    outputText += makeIndents(1) + "PushArrayString(" + varPrefix + structName + ", " + varPrefix + fieldName + "Output);\n";
                }
            }
            else if(fieldType == 'char') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", 0);\n";
                }
                else {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", KvGetNum(" + paramPrefix + structName + "KV, " + constFieldValue + "));\n";
                }
            }
            else if(fieldType == 'vector') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayArray(" + varPrefix + structName + ", {0.0, 0.0, 0.0}, 3);\n";
                }
                else {
                    outputText += makeIndents(1) + "decl Float:" + varPrefix + fieldName + "Value[3];\n";
                    outputText += makeIndents(1) + "KvGetVector(" + paramPrefix + structName + "KV, " + constFieldValue + ", " + varPrefix + fieldName + "Value);\n";
                    outputText += makeIndents(1) + "PushArrayArray(" + varPrefix + structName + ", " + varPrefix + fieldName + "Value, 3);\n";
                }
            }
            else if(fieldType == 'handle') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", INVALID_HANDLE);\n";
                }
                else {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", KvGetNum(" + paramPrefix + structName + "KV, " + constFieldValue + "));\n";
                }
            }
            else if(fieldType == 'array') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "new any:" + varPrefix + fieldName + "Value[" + fieldMaxLength + "];\n";
                    outputText += makeIndents(1) + "PushArrayArray(" + varPrefix + structName + ", " + varPrefix + fieldName + "Value, " + fieldMaxLength + ");\n";
                }
                else {
                    outputText += makeIndents(1) + "new any:" + varPrefix + fieldName + "Value[" + fieldMaxLength + "];\n";

                    outputText += makeIndents(1) + "new KvDataTypes:" + varPrefix + fieldName + "CurrentType;\n";

                    for(var arrIndex = 0; arrIndex < fieldMaxLength; arrIndex++) {
                        var arrKeyStr = dblQuotify(fieldName + "_" + arrIndex);

                        outputText += "\n" + makeIndents(1) + varPrefix + fieldName + "CurrentType = KvGetDataType(" + paramPrefix + structName + "KV, " + arrKeyStr + ");\n\n";

                        outputText += makeIndents(1) + "if(" + varPrefix + fieldName + "CurrentType == KvData_None || " + varPrefix + fieldName + "CurrentType == KvData_String || " + varPrefix + fieldName + "CurrentType == KvData_WString || " + varPrefix + fieldName + "CurrentType == KvData_UInt64 || " + varPrefix + fieldName + "CurrentType == KvData_Color) {\n";
                        outputText += makeIndents(2) + varPrefix + fieldName + "Value[" + arrIndex + "] = 0;\n";
                        outputText += makeIndents(1) + "}\n";
                        outputText += makeIndents(1) + "else if(" + varPrefix + fieldName + "CurrentType == KvData_Int || " + varPrefix + fieldName + "CurrentType == KvData_Ptr) {\n";
                        outputText += makeIndents(2) + varPrefix + fieldName + "Value[" + arrIndex + "] = KvGetNum(" + paramPrefix + structName + "KV, " + arrKeyStr + ");\n";
                        outputText += makeIndents(1) + "}\n";
                        outputText += makeIndents(1) + "else if(" + varPrefix + fieldName + "CurrentType == KvData_Float) {\n";
                        outputText += makeIndents(2) + varPrefix + fieldName + "Value[" + arrIndex + "] = KvGetFloat(" + paramPrefix + structName + "KV, " + arrKeyStr + ");\n";
                        outputText += makeIndents(1) + "}\n";
                    }

                    outputText += "\n" + makeIndents(1) + "PushArrayArray(" + varPrefix + structName + ", " + varPrefix + fieldName + "Value, " + fieldMaxLength + ");\n";
                }
            }
            else if(fieldType == 'bool') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", false);\n";
                }
                else {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", KvGetNum(" + paramPrefix + structName + "KV, " + constFieldValue + ") ? true : false);\n";
                }
            }
            else if(fieldType == 'vectors') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", CreateArray(3));\n";
                }
                else {
                    outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = CreateArray(3);\n";

                    outputText += makeIndents(1) + "new " + varPrefix + fieldName + "KVCount = KvGetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ");\n\n";

                    outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";
                    outputText += makeIndents(1) + "decl Float:" + varPrefix + fieldName + "Temp[3];\n\n";

                    outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "KVCount; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                    outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n\n";
                    outputText += makeIndents(2) + "KvGetVector(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey, " + varPrefix + fieldName + "Temp);\n\n";
                    outputText += makeIndents(2) + "PushArrayArray(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "Temp, 3);\n";
                    outputText += makeIndents(1) + "}\n\n";

                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", " + varPrefix + fieldName + "List);\n";
                }
            }
            else if(fieldType == 'strings') {
                var fieldSizeInCells = Math.ceil(fieldMaxLength / 4);

                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", CreateArray(" + fieldSizeInCells + "));\n";
                }
                else {
                    outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = CreateArray(" + fieldSizeInCells + ");\n";

                    outputText += makeIndents(1) + "new " + varPrefix + fieldName + "KVCount = KvGetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ");\n\n";

                    outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";
                    outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "Temp[" + fieldMaxLength + "];\n\n";

                    outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "KVCount; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                    outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n\n";
                    outputText += makeIndents(2) + "KvGetString(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey, " + varPrefix + fieldName + "Temp, " + fieldMaxLength + ");\n\n";
                    outputText += makeIndents(2) + "PushArrayString(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "Temp);\n";
                    outputText += makeIndents(1) + "}\n\n";

                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", " + varPrefix + fieldName + "List);\n";
                }
            }
            else if(fieldType == 'ints') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", CreateArray(1));\n";
                }
                else {
                    outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = CreateArray(1);\n";

                    outputText += makeIndents(1) + "new " + varPrefix + fieldName + "KVCount = KvGetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ");\n\n";

                    outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";
                    outputText += makeIndents(1) + "decl " + varPrefix + fieldName + "Temp;\n\n";

                    outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "KVCount; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                    outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n\n";
                    outputText += makeIndents(2) + varPrefix + fieldName + "Temp = KvGetNum(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey);\n\n";
                    outputText += makeIndents(2) + "PushArrayCell(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "Temp);\n";
                    outputText += makeIndents(1) + "}\n\n";

                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", " + varPrefix + fieldName + "List);\n";
                }
            }
            else if(fieldType == 'floats') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", CreateArray(1));\n";
                }
                else {
                    outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = CreateArray(1);\n";

                    outputText += makeIndents(1) + "new " + varPrefix + fieldName + "KVCount = KvGetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ");\n\n";

                    outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";
                    outputText += makeIndents(1) + "decl Float:" + varPrefix + fieldName + "Temp;\n\n";

                    outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "KVCount; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                    outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n\n";
                    outputText += makeIndents(2) + varPrefix + fieldName + "Temp = KvGetFloat(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey);\n\n";
                    outputText += makeIndents(2) + "PushArrayCell(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "Temp);\n";
                    outputText += makeIndents(1) + "}\n\n";

                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", " + varPrefix + fieldName + "List);\n";
                }
            }
            else if(fieldType == 'handles') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", CreateArray(1));\n";
                }
                else {
                    outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = CreateArray(1);\n";

                    outputText += makeIndents(1) + "new " + varPrefix + fieldName + "KVCount = KvGetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ");\n\n";

                    outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";
                    outputText += makeIndents(1) + "decl Handle:" + varPrefix + fieldName + "Temp;\n\n";

                    outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "KVCount; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                    outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n\n";
                    outputText += makeIndents(2) + varPrefix + fieldName + "Temp = Handle:KvGetNum(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey);\n\n";
                    outputText += makeIndents(2) + "PushArrayCell(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "Temp);\n";
                    outputText += makeIndents(1) + "}\n\n";

                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", " + varPrefix + fieldName + "List);\n";
                }
            }
            else if(fieldType == 'bools') {
                if(fieldDoNotLoad) {
                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", CreateArray(1));\n";
                }
                else {
                    outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = CreateArray(1);\n";

                    outputText += makeIndents(1) + "new " + varPrefix + fieldName + "KVCount = KvGetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ");\n\n";

                    outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";
                    outputText += makeIndents(1) + "decl bool:" + varPrefix + fieldName + "Temp;\n\n";

                    outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "KVCount; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                    outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n\n";
                    outputText += makeIndents(2) + varPrefix + fieldName + "Temp = KvGetNum(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey) ? true : false;\n\n";
                    outputText += makeIndents(2) + "PushArrayCell(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "Temp);\n";
                    outputText += makeIndents(1) + "}\n\n";

                    outputText += makeIndents(1) + "PushArrayCell(" + varPrefix + structName + ", " + varPrefix + fieldName + "List);\n";
                }
            }
        });

        outputText += "\n" + makeIndents(1) + "return " + varPrefix + structName + ";\n";

        outputText += "}\n\n";

        // Function for writing a single structure to KV
        outputText += "stock Handle:" + fnPrefix + "Write" + structName + "ToKV(Handle:" + paramPrefix + structName + ", Handle:" + paramPrefix + structName + "KV) {\n";

        fieldList.find('tr').each(function(fieldIndex) {
            var tr = $(this);
            var fieldType = tr.find(':input[name="field_type[]"]').val();
            var fieldName = tr.find(':input[name="field_name[]"]').val();
            var fieldMaxLength = parseInt($.trim(tr.find(':input[name="field_maxlen[]"]').val()), 10);
            fieldMaxLength = isNaN(fieldMaxLength) ? 0 : fieldMaxLength;

            var fieldDoNotSave = tr.find(':input[name="field_do_not_save[]"]').is(':checked');
            var constFieldValue = dblQuotify(fieldName);
            var constFieldCountValue = dblQuotify(fieldName + "_Count");

            var fieldTempKeySize = fieldName.length + 12;

            if(fieldDoNotSave) {
                return;
            }

            if(fieldType == 'int') {
                outputText += makeIndents(1) + "KvSetNum(" + paramPrefix + structName + "KV, " + constFieldValue + ", GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + "));\n";
            }
            else if(fieldType == 'float') {
                outputText += makeIndents(1) + "KvSetFloat(" + paramPrefix + structName + "KV, " + constFieldValue + ", GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + "));\n";
            }
            else if(fieldType == 'string') {
                outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "Temp[" + fieldMaxLength + "];\n";
                outputText += makeIndents(1) + "GetArrayString(" + paramPrefix + structName + ", " + fieldIndex + ", " + varPrefix + fieldName + "Temp, " + fieldMaxLength + ");\n";
                outputText += makeIndents(1) + "KvSetString(" + paramPrefix + structName + "KV, " + constFieldValue + ", " + varPrefix + fieldName + "Temp);\n";
            }
            else if(fieldType == 'char') {
                outputText += makeIndents(1) + "KvSetNum(" + paramPrefix + structName + "KV, " + constFieldValue + ", GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + "));\n";
            }
            else if(fieldType == 'vector') {
                outputText += makeIndents(1) + "decl Float:" + varPrefix + fieldName + "Temp[3];\n";
                outputText += makeIndents(1) + "GetArrayArray(" + paramPrefix + structName + ", " + fieldIndex + ", " + varPrefix + fieldName + "Temp, 3);\n";
                outputText += makeIndents(1) + "KvSetVector(" + paramPrefix + structName + "KV, " + constFieldValue + ", " + varPrefix + fieldName + "Temp);\n";
            }
            else if(fieldType == 'handle') {
                outputText += makeIndents(1) + "KvSetNum(" + paramPrefix + structName + "KV, " + constFieldValue + ", GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + "));\n";
            }
            else if(fieldType == 'array') {
                // No KV writing :( Can't check type at runtime. Sowwy. Maybe a reason to implement RTTI later SM devs :D
            }
            else if(fieldType == 'bool') {
                outputText += makeIndents(1) + "KvSetNum(" + paramPrefix + structName + "KV, " + constFieldValue + ", GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ") ? 1 : 0);\n";
            }
            else if(fieldType == 'vectors') {
                outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";
                outputText += makeIndents(1) + "new " + varPrefix + fieldName + "Count = GetArraySize(" + varPrefix + fieldName + "List);\n";
                outputText += makeIndents(1) + "KvSetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ", " + varPrefix + fieldName + "Count);\n\n";

                outputText += makeIndents(1) + "decl Float:" + varPrefix + fieldName + "Temp[3];\n\n";

                outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "Count; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n";
                outputText += makeIndents(2) + "GetArrayArray(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "CurrentIndex, " + varPrefix + fieldName + "Temp, 3);\n";
                outputText += makeIndents(2) + "KvSetVector(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey, " + varPrefix + fieldName + "Temp);\n";
                outputText += makeIndents(1) + "}\n";
            }
            else if(fieldType == 'strings') {
                outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";
                outputText += makeIndents(1) + "new " + varPrefix + fieldName + "Count = GetArraySize(" + varPrefix + fieldName + "List);\n";
                outputText += makeIndents(1) + "KvSetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ", " + varPrefix + fieldName + "Count);\n\n";

                outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "Temp[" + fieldMaxLength + "];\n\n";

                outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "Count; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n";
                outputText += makeIndents(2) + "GetArrayString(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "CurrentIndex, " + varPrefix + fieldName + "Temp, " + fieldMaxLength + ");\n";
                outputText += makeIndents(2) + "KvSetString(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey, " + varPrefix + fieldName + "Temp);\n";
                outputText += makeIndents(1) + "}\n";
            }
            else if(fieldType == 'ints') {
                outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";
                outputText += makeIndents(1) + "new " + varPrefix + fieldName + "Count = GetArraySize(" + varPrefix + fieldName + "List);\n";
                outputText += makeIndents(1) + "KvSetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ", " + varPrefix + fieldName + "Count);\n\n";

                outputText += makeIndents(1) + "decl " + varPrefix + fieldName + "Temp;\n\n";

                outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "Count; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n";
                outputText += makeIndents(2) + varPrefix + fieldName + "Temp = GetArrayCell(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "CurrentIndex);\n";
                outputText += makeIndents(2) + "KvSetNum(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey, " + varPrefix + fieldName + "Temp);\n";
                outputText += makeIndents(1) + "}\n";
            }
            else if(fieldType == 'floats') {
                outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";
                outputText += makeIndents(1) + "new " + varPrefix + fieldName + "Count = GetArraySize(" + varPrefix + fieldName + "List);\n";
                outputText += makeIndents(1) + "KvSetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ", " + varPrefix + fieldName + "Count);\n\n";

                outputText += makeIndents(1) + "decl Float:" + varPrefix + fieldName + "Temp;\n\n";

                outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "Count; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n";
                outputText += makeIndents(2) + varPrefix + fieldName + "Temp = GetArrayCell(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "CurrentIndex);\n";
                outputText += makeIndents(2) + "KvSetFloat(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey, " + varPrefix + fieldName + "Temp);\n";
                outputText += makeIndents(1) + "}\n";
            }
            else if(fieldType == 'handles') {
                outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";
                outputText += makeIndents(1) + "new " + varPrefix + fieldName + "Count = GetArraySize(" + varPrefix + fieldName + "List);\n";
                outputText += makeIndents(1) + "KvSetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ", " + varPrefix + fieldName + "Count);\n\n";

                outputText += makeIndents(1) + "decl Handle:" + varPrefix + fieldName + "Temp;\n\n";

                outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "Count; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n";
                outputText += makeIndents(2) + varPrefix + fieldName + "Temp = GetArrayCell(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "CurrentIndex);\n";
                outputText += makeIndents(2) + "KvSetNum(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey, _:" + varPrefix + fieldName + "Temp);\n";
                outputText += makeIndents(1) + "}\n";
            }
            else if(fieldType == 'bools') {
                outputText += makeIndents(1) + "new Handle:" + varPrefix + fieldName + "List = GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";
                outputText += makeIndents(1) + "new " + varPrefix + fieldName + "Count = GetArraySize(" + varPrefix + fieldName + "List);\n";
                outputText += makeIndents(1) + "KvSetNum(" + paramPrefix + structName + "KV, " + constFieldCountValue + ", " + varPrefix + fieldName + "Count);\n\n";

                outputText += makeIndents(1) + "decl bool:" + varPrefix + fieldName + "Temp;\n\n";

                outputText += makeIndents(1) + "decl String:" + varPrefix + fieldName + "TempKey[" + fieldTempKeySize + "];\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + fieldName + "CurrentIndex = 0; " + varPrefix + fieldName + "CurrentIndex < " + varPrefix + fieldName + "Count; " + varPrefix + fieldName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + "Format(" + varPrefix + fieldName + "TempKey, " + fieldTempKeySize + ", \"%s_%d\", " + constFieldValue + ", " + varPrefix + fieldName + "CurrentIndex);\n";
                outputText += makeIndents(2) + varPrefix + fieldName + "Temp = GetArrayCell(" + varPrefix + fieldName + "List, " + varPrefix + fieldName + "CurrentIndex) ? true : false;\n";
                outputText += makeIndents(2) + "KvSetNum(" + paramPrefix + structName + "KV, " + varPrefix + fieldName + "TempKey, " + varPrefix + fieldName + "Temp ? 1 : 0);\n";
                outputText += makeIndents(1) + "}\n";
            }
        });

        outputText += "}\n\n";

        // Field based function generation
        fieldList.find('tr').each(function(fieldIndex) {
            var tr = $(this);
            var fieldType = tr.find(':input[name="field_type[]"]').val();
            var fieldName = tr.find(':input[name="field_name[]"]').val();
            var fieldMaxLength = parseInt($.trim(tr.find(':input[name="field_maxlen[]"]').val()), 10);
            fieldMaxLength = isNaN(fieldMaxLength) ? 0 : fieldMaxLength;

            if(fieldType == 'int') {
                outputText += "stock " + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", " + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";

                outputText += "stock Handle:" + fnPrefix + "Find" + structName + "By" + fieldName + "(Handle:" + paramPrefix + structName + "List, " + paramPrefix + fieldName + "Value, " + paramPrefix + structName + "StartIndex = 0, &" + paramPrefix + structName + "FoundIndex = 0) {\n";

                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex < 0) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "StartIndex = 0;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new " + varPrefix + structName + "Count = GetArraySize(" + paramPrefix + structName + "List);\n\n";
                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex >= " + varPrefix + structName + "Count) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(2) + "return INVALID_HANDLE;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new Handle:" + varPrefix + "Current" + structName + " = INVALID_HANDLE;\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + structName + "CurrentIndex = " + paramPrefix + structName + "StartIndex; " + varPrefix + structName + "CurrentIndex < " + varPrefix + structName + "Count; " + varPrefix + structName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + varPrefix + "Current"+ structName + " = GetArrayCell(" + paramPrefix + structName + "List, " + varPrefix + structName + "CurrentIndex);\n\n";

                outputText += makeIndents(2) + "if(GetArrayCell(" + varPrefix + "Current" + structName + ", " + fieldIndex + ") != " + paramPrefix + fieldName + "Value) {\n";
                outputText += makeIndents(3) + "continue;\n";
                outputText += makeIndents(2) + "}\n\n";

                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = " + varPrefix + structName + "CurrentIndex;\n";
                outputText += makeIndents(2) + "return " + varPrefix + "Current" + structName + ";\n";

                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(1) + "return INVALID_HANDLE;\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'float') {
                outputText += "stock Float:" + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", Float:" + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";

                outputText += "stock Handle:" + fnPrefix + "Find" + structName + "By" + fieldName + "(Handle:" + paramPrefix + structName + "List, Float:" + paramPrefix + fieldName + "Value, " + paramPrefix + structName + "StartIndex = 0, &" + paramPrefix + structName + "FoundIndex = 0) {\n";

                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex < 0) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "StartIndex = 0;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new " + varPrefix + structName + "Count = GetArraySize(" + paramPrefix + structName + "List);\n\n";
                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex >= " + varPrefix + structName + "Count) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(2) + "return INVALID_HANDLE;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new Handle:" + varPrefix + "Current" + structName + " = INVALID_HANDLE;\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + structName + "CurrentIndex = " + paramPrefix + structName + "StartIndex; " + varPrefix + structName + "CurrentIndex < " + varPrefix + structName + "Count; " + varPrefix + structName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + varPrefix + "Current"+ structName + " = GetArrayCell(" + paramPrefix + structName + "List, " + varPrefix + structName + "CurrentIndex);\n\n";

                outputText += makeIndents(2) + "if(GetArrayCell(" + varPrefix + "Current" + structName + ", " + fieldIndex + ") != " + paramPrefix + fieldName + "Value) {\n";
                outputText += makeIndents(3) + "continue;\n";
                outputText += makeIndents(2) + "}\n\n";

                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = " + varPrefix + structName + "CurrentIndex;\n";
                outputText += makeIndents(2) + "return " + varPrefix + "Current" + structName + ";\n";

                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(1) + "return INVALID_HANDLE;\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'string') {
                outputText += "stock " + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", String:" + paramPrefix + fieldName + "Output[], " + paramPrefix + fieldName + "OutputMaxLen = -1) {\n";

                outputText += makeIndents(1) + "if(" + paramPrefix + fieldName + "OutputMaxLen == -1 || " + paramPrefix + fieldName + " > " + fieldMaxLength + ") {\n";
                outputText += makeIndents(2) + paramPrefix + fieldName + "OutputMaxLen = " + fieldMaxLength + ";\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "GetArrayString(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Output, " + paramPrefix + fieldName + "OutputMaxLen);\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", const String:" + paramPrefix + fieldName + "Value[]) {\n";

                outputText += makeIndents(1) + "SetArrayString(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";

                outputText += "stock Handle:" + fnPrefix + "Find" + structName + "By" + fieldName + "(Handle:" + paramPrefix + structName + "List, const String:" + paramPrefix + fieldName + "Value[], " + paramPrefix + structName + "StartIndex = 0, bool:" + paramPrefix + fieldName + "CaseSens = true, &" + paramPrefix + structName + "FoundIndex = 0) {\n";

                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex < 0) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "StartIndex = 0;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new " + varPrefix + structName + "Count = GetArraySize(" + paramPrefix + structName + "List);\n\n";
                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex >= " + varPrefix + structName + "Count) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(2) + "return INVALID_HANDLE;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new Handle:" + varPrefix + "Current" + structName + " = INVALID_HANDLE;\n";
                outputText += makeIndents(1) + "decl String:" + varPrefix + "Current" + fieldName + "Value[" + fieldMaxLength + "];\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + structName + "CurrentIndex = " + paramPrefix + structName + "StartIndex; " + varPrefix + structName + "CurrentIndex < " + varPrefix + structName + "Count; " + varPrefix + structName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + varPrefix + "Current" + structName + " = GetArrayCell(" + paramPrefix + structName + "List, " + varPrefix + structName + "CurrentIndex);\n\n";

                outputText += makeIndents(2) + "GetArrayString(" + varPrefix + "Current" + structName + ", " + fieldIndex + ", " + varPrefix + "Current" + fieldName + "Value, " + fieldMaxLength + ");\n\n";

                outputText += makeIndents(2) + "if(!StrEqual(" + varPrefix + "Current" + fieldName + "Value, " + paramPrefix + fieldName + "Value, " + paramPrefix + fieldName + "CaseSens)) {\n";
                outputText += makeIndents(3) + "continue;\n";
                outputText += makeIndents(2) + "}\n\n";

                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = " + varPrefix + structName + "CurrentIndex;\n";
                outputText += makeIndents(2) + "return " + varPrefix + "Current" + structName + ";\n";

                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(1) + "return INVALID_HANDLE;\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'char') {
                outputText += "stock " + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", " + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";

                outputText += "stock Handle:" + fnPrefix + "Find" + structName + "By" + fieldName + "(Handle:" + paramPrefix + structName + "List, String:" + paramPrefix + fieldName + "Value, " + paramPrefix + structName + "StartIndex = 0, &" + paramPrefix + structName + "FoundIndex = 0) {\n";

                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex < 0) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "StartIndex = 0;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new " + varPrefix + structName + "Count = GetArraySize(" + paramPrefix + structName + "List);\n\n";
                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex >= " + varPrefix + structName + "Count) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(2) + "return INVALID_HANDLE;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new Handle:" + varPrefix + "Current" + structName + " = INVALID_HANDLE;\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + structName + "CurrentIndex = " + paramPrefix + structName + "StartIndex; " + varPrefix + structName + "CurrentIndex < " + varPrefix + structName + "Count; " + varPrefix + structName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + varPrefix + "Current"+ structName + " = GetArrayCell(" + paramPrefix + structName + "List, " + varPrefix + structName + "CurrentIndex);\n\n";

                outputText += makeIndents(2) + "if(GetArrayCell(" + varPrefix + "Current" + structName + ", " + fieldIndex + ") != " + paramPrefix + fieldName + "Value) {\n";
                outputText += makeIndents(3) + "continue;\n";
                outputText += makeIndents(2) + "}\n\n";

                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = " + varPrefix + structName + "CurrentIndex;\n";
                outputText += makeIndents(2) + "return " + varPrefix + "Current" + structName + ";\n";

                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(1) + "return INVALID_HANDLE;\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'vector') {
                outputText += "stock " + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", Float:" + paramPrefix + fieldName + "Output[3]) {\n";

                outputText += makeIndents(1) + "GetArrayArray(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Output, 3);\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", const Float:" + paramPrefix + fieldName + "Value[3]) {\n";

                outputText += makeIndents(1) + "SetArrayArray(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value, 3);\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'handle') {
                outputText += "stock Handle:" + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", Handle:" + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";

                outputText += "stock Handle:" + fnPrefix + "Find" + structName + "By" + fieldName + "(Handle:" + paramPrefix + structName + "List, Handle:" + paramPrefix + fieldName + "Value, " + paramPrefix + structName + "StartIndex = 0, &" + paramPrefix + structName + "FoundIndex = 0) {\n";

                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex < 0) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "StartIndex = 0;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new " + varPrefix + structName + "Count = GetArraySize(" + paramPrefix + structName + "List);\n\n";
                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex >= " + varPrefix + structName + "Count) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(2) + "return INVALID_HANDLE;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new Handle:" + varPrefix + "Current" + structName + " = INVALID_HANDLE;\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + structName + "CurrentIndex = " + paramPrefix + structName + "StartIndex; " + varPrefix + structName + "CurrentIndex < " + varPrefix + structName + "Count; " + varPrefix + structName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + varPrefix + "Current"+ structName + " = GetArrayCell(" + paramPrefix + structName + "List, " + varPrefix + structName + "CurrentIndex);\n\n";

                outputText += makeIndents(2) + "if(GetArrayCell(" + varPrefix + "Current" + structName + ", " + fieldIndex + ") != " + paramPrefix + fieldName + "Value) {\n";
                outputText += makeIndents(3) + "continue;\n";
                outputText += makeIndents(2) + "}\n\n";

                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = " + varPrefix + structName + "CurrentIndex;\n";
                outputText += makeIndents(2) + "return " + varPrefix + "Current" + structName + ";\n";

                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(1) + "return INVALID_HANDLE;\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'array') {
                outputText += "stock " + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", any:" + paramPrefix + fieldName + "Output[], " + paramPrefix + fieldName + "OutputMaxLen = -1) {\n";

                outputText += makeIndents(1) + "if(" + paramPrefix + fieldName + "OutputMaxLen == -1 || " + paramPrefix + fieldName + " > " + fieldMaxLength + ") {\n";
                outputText += makeIndents(2) + paramPrefix + fieldName + "OutputMaxLen = " + fieldMaxLength + ";\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "return GetArrayArray(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Output, " + paramPrefix + fieldName + "OutputMaxLen);\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", const any:" + paramPrefix + fieldName + "Value[]) {\n";

                outputText += makeIndents(1) + "SetArrayArray(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value, " + fieldMaxLength + ");\n";

                outputText += "}\n\n";

                outputText += "stock any:" + fnPrefix + "Get" + structName + fieldName + "Item(Handle:" + paramPrefix + structName + ", " + paramPrefix + fieldName + "ItemIndex) {\n";

                outputText += makeIndents(1) + "decl any:" + varPrefix + fieldName + "Output[" + fieldMaxLength + "];\n\n";
                outputText += makeIndents(1) + "GetArrayArray(" + paramPrefix + structName + ", " + fieldIndex + ", " + varPrefix + fieldName + "Output, " + fieldMaxLength + ");\n\n";
                outputText += makeIndents(1) + "return " + varPrefix + fieldName + "Output[" + paramPrefix + fieldName + "ItemIndex];\n";

                outputText += "}\n\n";

                outputText += "stock any:" + fnPrefix + "Set" + structName + fieldName + "Item(Handle:" + paramPrefix + structName + ", " + paramPrefix + fieldName + "ItemIndex, const any:" + paramPrefix + fieldName + "ItemValue) {\n";

                outputText += makeIndents(1) + "decl any:" + varPrefix + fieldName + "Output[" + fieldMaxLength + "];\n\n";
                outputText += makeIndents(1) + "GetArrayArray(" + paramPrefix + structName + ", " + fieldIndex + ", " + varPrefix + fieldName + "Output, " + fieldMaxLength + ");\n\n";
                outputText += makeIndents(1) + varPrefix + fieldName + "Output[" + paramPrefix + fieldName + "ItemIndex] = " + paramPrefix + fieldName + "ItemValue;\n\n";
                outputText += makeIndents(1) + "SetArrayArray(" + paramPrefix + structName + ", " + fieldIndex + ", " + varPrefix + fieldName + "Output, " + fieldMaxLength + ");\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'bool') {
                outputText += "stock bool:" + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", bool:" + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";

                outputText += "stock Handle:" + fnPrefix + "Find" + structName + "By" + fieldName + "(Handle:" + paramPrefix + structName + "List, bool:" + paramPrefix + fieldName + "Value, " + paramPrefix + structName + "StartIndex = 0, &" + paramPrefix + structName + "FoundIndex = 0) {\n";

                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex < 0) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "StartIndex = 0;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new " + varPrefix + structName + "Count = GetArraySize(" + paramPrefix + structName + "List);\n\n";
                outputText += makeIndents(1) + "if(" + paramPrefix + structName + "StartIndex >= " + varPrefix + structName + "Count) {\n";
                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(2) + "return INVALID_HANDLE;\n";
                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + "new Handle:" + varPrefix + "Current" + structName + " = INVALID_HANDLE;\n\n";

                outputText += makeIndents(1) + "for(new " + varPrefix + structName + "CurrentIndex = " + paramPrefix + structName + "StartIndex; " + varPrefix + structName + "CurrentIndex < " + varPrefix + structName + "Count; " + varPrefix + structName + "CurrentIndex++) {\n";
                outputText += makeIndents(2) + varPrefix + "Current"+ structName + " = GetArrayCell(" + paramPrefix + structName + "List, " + varPrefix + structName + "CurrentIndex);\n\n";

                outputText += makeIndents(2) + "if(GetArrayCell(" + varPrefix + "Current" + structName + ", " + fieldIndex + ") != " + paramPrefix + fieldName + "Value) {\n";
                outputText += makeIndents(3) + "continue;\n";
                outputText += makeIndents(2) + "}\n\n";

                outputText += makeIndents(2) + paramPrefix + structName + "FoundIndex = " + varPrefix + structName + "CurrentIndex;\n";
                outputText += makeIndents(2) + "return " + varPrefix + "Current" + structName + ";\n";

                outputText += makeIndents(1) + "}\n\n";

                outputText += makeIndents(1) + paramPrefix + structName + "FoundIndex = -1;\n";
                outputText += makeIndents(1) + "return INVALID_HANDLE;\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'vectors') {
                outputText += "stock Handle:" + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", Handle:" + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'strings') {
                outputText += "stock Handle:" + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", Handle:" + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'ints') {
                outputText += "stock Handle:" + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", Handle:" + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'floats') {
                outputText += "stock Handle:" + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", Handle:" + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'handles') {
                outputText += "stock Handle:" + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", Handle:" + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";
            }
            else if(fieldType == 'bools') {
                outputText += "stock Handle:" + fnPrefix + "Get" + structName + fieldName + "(Handle:" + paramPrefix + structName + ") {\n";

                outputText += makeIndents(1) + "return GetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ");\n";

                outputText += "}\n\n";

                outputText += "stock " + fnPrefix + "Set" + structName + fieldName + "(Handle:" + paramPrefix + structName + ", Handle:" + paramPrefix + fieldName + "Value) {\n";

                outputText += makeIndents(1) + "SetArrayCell(" + paramPrefix + structName + ", " + fieldIndex + ", " + paramPrefix + fieldName + "Value);\n";

                outputText += "}\n\n";
            }
        });

        $('#output').text(outputText);

        return false;
    });

    var zeroClipboard = new ZeroClipboard(document.getElementById('copyClipLink'), {
        moviePath: "ZeroClipboard.swf"
    });
});