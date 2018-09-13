var convertIf = function(copyMapper, dto) {
  // Convert if elements
  var regex = new RegExp("(@if@)([\\s\\S]*?)(@)([\\s\\S]*?)(@\/if@)", "g");
  var matches = copyMapper.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp("(@if@)([\\s\\S]*?)(@)([\\s\\S]*?)(@\/if@)", "g");
      var m = regex.exec(matches[z]);

      var evalString = m[2];
      var changeList = [];

      regex = new RegExp("(^|[!=<> ]{1,2})([a-zA-z0-9_]{1,})($|[!=<> ]{1,2})");
      var n = m[2].match(regex);

      // Convert parameters
      if (n != null && n.length > 0) {
        for (var k = 0; k < n.length; k++) {
          regex = new RegExp(
              "(^|[!=<> ]{1,2})([a-zA-z0-9_]{1,})($|[!=<> ]{1,2})");
          var h = regex.exec(n[k]);
          
          if (dto != null && Object.keys(dto).length != 0) {
            if (h != null && Object.keys(dto).includes(h[2])) {
              if (!changeList.includes(h[2])) {
                changeList.push(h[2]);
              }
            }          
          }
        }
      }

      // Create Evaluate string
      for (var l = 0; l < changeList.length; l++) {
        regex = new RegExp("(" + changeList[l] + ")", "g");
        evalString = evalString.replace(regex, "dto." + changeList[l]);
      }
      evalString = evalString.replace(/and/gi, " && ");
      evalString = evalString.replace(/or/gi, " || ");
      
      // Execute Evaluate string
      try {
        if (eval(evalString)) {
          copyMapper = copyMapper.replace(m[0], m[4]);
        } else {
          copyMapper = copyMapper.replace(m[0], "");
        }
      } catch (e) {
        copyMapper = copyMapper.replace(m[0], "");
      }
    }
  }

  return copyMapper;
}


var convertForeach = function (copyMapper) {
  // Convert foreach elements
  var regex = new RegExp(
      "(@foreach@)([\\s\\S]*?)(@)([\\s\\S]*?)(@\/foreach@)", "g");
  var matches = copyMapper.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp(
          "(@foreach@)([\\s\\S]*?)(@)([\\s\\S]*?)(@\/foreach@)", "g");
      var m = regex.exec(matches[z]);

      var evalString = m[2];

      // Get collection=
      var collectionRegex = new RegExp("(collection=\")([\\S]*?)(\")");
      var collectionMatches = evalString.match(collectionRegex);
      var collection = eval("dto." + collectionMatches[2]);

      // Get item=
      var itemRegex = new RegExp("(item=\")([\\S]*?)(\")");
      var itemMatches = evalString.match(itemRegex);
      var item = itemMatches[2];

      // Get open=
      var open = "";
      try {
        var openRegex = new RegExp("(open=\")([\\S\\s]*?)(\")");
        var openMatches = evalString.match(openRegex);
        open = openMatches[2];
      } catch (e) {
        open = "";
      }

      // Get separator=
      var separator = "";
      try {
        var separatorRegex = new RegExp("(separator=\")([\\S\\s]*?)(\")");
        var separatorMatches = evalString.match(separatorRegex);
        separator = separatorMatches[2];
      } catch (e) {
        separator = "";
      }

      // Get close=
      var close = "";
      try {
        var closeRegex = new RegExp("(close=\")([\\S\\s]*?)(\")");
        var closeMatches = evalString.match(closeRegex);
        close = closeMatches[2];
      } catch (e) {
        close = "";
      }

      var baseText = m[4];
      var forString = "";
      forString += open;

      if (collection != null && collection.length > 0) {
        for (var co = 0; co < collection.length; co++) {
          var strRegex = new RegExp("#{" + item + "}", "g");
          var intRegex = new RegExp("${" + item + "}", "g");

          var txt = baseText.replace(strRegex, "\"" + collection[co] + "\"");
          var txt = txt.replace(intRegex, collection[co]);

          if (co + 1 < collection.length) {
            forString += (txt + separator);
          } else {
            forString += txt;
          }
        }
      }

      forString += close;
      copyMapper = copyMapper.replace(m[0], forString);
    }

  }

  return copyMapper;
}

var convertWhere = function(copyMapper) {
  // Convert where elements
  var regex = new RegExp("(@where@)([\\s\\S]*?)(@\/where@)", "g");
  var matches = copyMapper.match(regex);

  if (matches != null && matches.length > 0) {
    for (var z = 0; z < matches.length; z++) {
      regex = new RegExp("(@where@)([\\s\\S]*?)(@\/where@)", "g");
      var m = regex.exec(matches[z]);

      var evalString = m[2];

      // Remove AND, OR
      var whereRegex = new RegExp("(^)([\\s]*?)(and|or)", "gi");
      evalString = evalString.replace(whereRegex, "");

      var whereRegex = new RegExp("(and|or)([\\s]*?)($)", "gi");
      evalString = evalString.replace(whereRegex, "");

      var whereRegex = new RegExp("([a-zA-Z])", "g");
      var w = evalString.match(whereRegex);

      if (w != null && w.length > 0) {
        evalString = "WHERE " + evalString;
      }
    }

    copyMapper = copyMapper.replace(m[0], evalString);
  }

  return copyMapper;
}

module.exports = {
  convertIf,
  convertWhere,
  convertForeach
};