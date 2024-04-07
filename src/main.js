const { invoke } = window.__TAURI__.tauri;

let email;
let emailInputEl;
let password;
let passwordInputEl;
let apiResponse;
let parser = new DOMParser();
const maxClasses = 18;
const statsCount = 8;
const maxExalts = 75;
let totalAll = maxClasses * statsCount * maxExalts;
let exalts;




async function getAccountData() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

  // disables login and uses sample data
  let debug = 0;

  if (!debug) {
    if (emailInputEl.value != "" || passwordInputEl.value != ""){
      emailInputEl.style.border = "";
      passwordInputEl.style.border = "";
      
      // send credentials to rust backend, parse the xml response to object and start creating the table
      apiResponse = await invoke("get_account", { guid: emailInputEl.value, password: passwordInputEl.value });
      let xml = parser.parseFromString(apiResponse, "text/xml");
      //console.log(xml);
      let JSONData = xmlToJson(xml);
      //console.log(JSONData);
      makeExaltationTable(JSONData.PowerUpStats);
      document.querySelector("#playername").textContent = JSONData.Account.Name;
    } else {
      emailInputEl.style.border = "2px solid #fb6a6a";
      passwordInputEl.style.border = "2px solid #fb6a6a";
    }
  }
  
  // if debug is enabled: create table with sample data
  if (debug) {
    let testData = {
      "ClassStats": [
        {
          "class": "768",
          "#text": "26,60,9,73,68,41,3,45"
        },
        {
          "class": "800",
          "#text": "71,62,19,55,52,22,40,49"
        },
        {
          "class": "801",
          "#text": "44,43,49,20,53,60,48,35"
        },
        {
          "class": "782",
          "#text": "73,31,39,44,34,35,61,56"
        },
        {
          "class": "818",
          "#text": "68,26,66,73,40,33,58,50"
        },
        {
          "class": "798",
          "#text": "9,27,35,50,55,24,55,15"
        },
        {
          "class": "805",
          "#text": "17,21,71,36,36,3,10,63"
        },
        {
          "class": "803",
          "#text": "40,17,53,9,3,57,68,25"
        },
        {
          "class": "796",
          "#text": "52,52,26,11,41,14,50,26"
        },
        {
          "class": "817",
          "#text": "17,0,52,32,69,51,26,28"
        },
        {
          "class": "785",
          "#text": "69,14,14,13,65,49,68,38"
        },
        {
          "class": "802",
          "#text": "12,33,20,44,3,31,30,52"
        },
        {
          "class": "797",
          "#text": "17,68,15,36,36,17,17,10"
        },
        {
          "class": "775",
          "#text": "73,21,71,9,66,59,34,58"
        },
        {
          "class": "806",
          "#text": "19,61,32,64,15,71,43,41"
        },
        {
          "class": "804",
          "#text": "11,39,27,13,38,13,67,58"
        },
        {
          "class": "799",
          "#text": "46,73,57,67,65,65,60,73"
        },
        {
          "class": "784",
          "#text": "30,42,65,54,19,9,0,50"
        }
      ],
      "ClaimedItem": [
          "30314",
          "30311",
          "30317",
          "9502",
          "30308",
          "30320",
          "9522"
      ]
    };
    makeExaltationTable(testData);
    document.querySelector("#playername").textContent = "Femboy";
  }
  
}

window.addEventListener("DOMContentLoaded", () => {
  emailInputEl = document.querySelector("#email-input");
  passwordInputEl = document.querySelector("#password-input");
  document.querySelector("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    getAccountData();
  });
});

function makeExaltationTable(exaltData){
  var $d = $('#exalts').addClass('exalts-container');
  var $t = $('<table cellspacing="0">').addClass('exalts-table');
  var $tb = $('<tbody>');

  // check if a table exists
  if ($('#exalts table').length != 0) {
    $d.empty();
  }

  // reset all counting variables
  resetExalts();
  resetTotals();

  //console.log(exaltData);
  //console.log(totalsClass);

  // Populate exalt object with data from the parsed response
  // if account only has exalts on one class the exalt data won't have an array
  if (Array.isArray(exaltData.ClassStats)) {
    exaltData.ClassStats.forEach((item) => {
      //console.log(item);
      var className = classes[item.class][0];
      var groupIndex = classes[item.class][4][0]; // 0 -> Weapon 3 -> Armor
      var stats = item['#text'].split(',');

      // cap exalt points to 75 
      stats[0] = stats[0] > 75 ? 75 : parseInt(stats[0]);
      stats[1] = stats[1] > 75 ? 75 : parseInt(stats[1]);
      stats[2] = stats[2] > 75 ? 75 : parseInt(stats[2]);
      stats[3] = stats[3] > 75 ? 75 : parseInt(stats[3]);
      stats[4] = stats[4] > 75 ? 75 : parseInt(stats[4]);
      stats[5] = stats[5] > 75 ? 75 : parseInt(stats[5]);
      stats[6] = stats[6] > 75 ? 75 : parseInt(stats[6]);
      stats[7] = stats[7] > 75 ? 75 : parseInt(stats[7]);
  
      // sort classes by armor
      exalts[groupIndex][className] = {
        'hp': stats[7],
        'mp': stats[4],
        'atk': stats[5],
        'def': stats[6],
        'spd': stats[1],
        'dex': stats[0],
        'vit': stats[2],
        'wis': stats[3],
      }
  
  
      // calculate totals
      calculateTotals(className,groupIndex,stats);
    });
  } else {
    console.log(exaltData);
    var className = classes[exaltData.ClassStats.class][0];
    var groupIndex = classes[exaltData.ClassStats.class][4][0]; // 0 -> Weapon 3 -> Armor
    var stats = exaltData.ClassStats['#text'].split(',');
    console.log(className);
    console.log(groupIndex);
    console.log(stats);

    // cap exalt points to 75 (rotmg keeps counting points past 75)
    stats[0] = stats[0] > 75 ? 75 : parseInt(stats[0]);
    stats[1] = stats[1] > 75 ? 75 : parseInt(stats[1]);
    stats[2] = stats[2] > 75 ? 75 : parseInt(stats[2]);
    stats[3] = stats[3] > 75 ? 75 : parseInt(stats[3]);
    stats[4] = stats[4] > 75 ? 75 : parseInt(stats[4]);
    stats[5] = stats[5] > 75 ? 75 : parseInt(stats[5]);
    stats[6] = stats[6] > 75 ? 75 : parseInt(stats[6]);
    stats[7] = stats[7] > 75 ? 75 : parseInt(stats[7]);


    exalts[groupIndex][className] = {
      'hp': stats[7],
      'mp': stats[4],
      'atk': stats[5],
      'def': stats[6],
      'spd': stats[1],
      'dex': stats[0],
      'vit': stats[2],
      'wis': stats[3],
    }

    // calculate totals
    calculateTotals(className,groupIndex,stats);
  };

      
  //console.log(exalts);
  //console.log(totalsClass);
  //console.log(totalsStat);

  //create table and populate with data from exalt object
  $t.append('<thead><tr><th>Class</th><th  class="hp">HP</th><th class="mp">MP</th><th class="atk">Atk</th><th class="def">Def</th><th class="spd">Spd</th><th class="dex">Dex</th><th class="vit">Vit</th><th class="wis">Wis</th><th>Total</th></tr></thead>');
  for (var [group,groupEntry] of Object.entries(exalts)) {
      //console.log(groupEntry);
      for (var [name,stats] of Object.entries(groupEntry)) {
          //console.log(stats);
          var $row = $('<tr>').addClass('equipmentGroup' + group);
          $row.append(`
              <td>${name}</td>
              <td>${stats.hp}</td>
              <td>${stats.mp}</td>
              <td>${stats.atk}</td>
              <td>${stats.def}</td>
              <td>${stats.spd}</td>
              <td>${stats.dex}</td>
              <td>${stats.vit}</td>
              <td>${stats.wis}</td>
              <td class="totalsClass">${totalsClass[group][name].total}</td>
          `);
          $tb.append($row);
      }

  }

  
  var $row = $('<tr>').addClass('totalsStat');
  $row.append(`
    <td>Total</td>
    <td>${totalsStat.hp}</td>
    <td>${totalsStat.mp}</td>
    <td>${totalsStat.atk}</td>
    <td>${totalsStat.def}</td>
    <td>${totalsStat.spd}</td>
    <td>${totalsStat.dex}</td>
    <td>${totalsStat.vit}</td>
    <td>${totalsStat.wis}</td>
    <td>${totalAll}</td>
  `);

  $tb.append($row);
  $t.append($tb);
  $d.append($t);
}

//resets exalt object to 0 on all stats
function resetExalts(){
  exalts = {
    1: {
      "Warrior": {},
      "Paladin": {},
      "Knight": {},
    }, // Sword
    2: {
      "Trickster": {},
      "Assassin": {},
      "Rogue": {},
    }, // Dagger
    3: {
      "Archer": {},
      "Huntress": {},
      "Bard": {},
    }, // Bow
    8: {
      "Sorcerer": {},
      "Summoner": {},
      "Priest": {},
    }, // Wand
    17: {
      "Wizard": {},
      "Mystic": {},
      "Necromancer": {},
    }, // Staff
    24: {
      "Ninja": {},
      "Samurai": {},
      "Kensei": {},
    }, // Katana
  };

  for (var [group,groupEntry] of Object.entries(exalts)) {
    //console.log(groupEntry);
    for (var [name,stats] of Object.entries(groupEntry)) {
      exalts[group][name] = {
        "hp": 0,
        "mp": 0,
        "atk": 0,
        "def": 0,
        "spd": 0,
        "dex": 0,
        "vit": 0,
        "wis": 0,
      }
    }
  }
}

//calculates totals for class, stat and overall
function calculateTotals(className, groupIndex,stats) {
  totalsStat = {
    'hp': totalsStat['hp'] - stats[7],
    'mp': totalsStat['mp'] - stats[4],
    'atk': totalsStat['atk'] - stats[5],
    'def': totalsStat['def'] - stats[6],
    'spd': totalsStat['spd'] - stats[1],
    'dex': totalsStat['dex'] - stats[0],
    'vit': totalsStat['vit'] - stats[2],
    'wis': totalsStat['wis'] - stats[3],
  }
  
  totalsClass[groupIndex][className].total = totalsClass[groupIndex][className].total - 
    stats[0] - stats[1] - stats[2] - stats[3] -  stats[4] - stats[5] - stats[6] - stats[7];

  totalAll = totalAll - stats[0] - stats[1] - stats[2] - stats[3] - stats[4] - stats[5] - stats[6] - stats[7];
}

//resets totals
function resetTotals(){
  totalAll = maxExalts * statsCount * maxClasses;
  totalsClass = {
    "1": {
        "Knight": {
            "total": maxExalts * statsCount
        },
        "Warrior": {
          "total": maxExalts * statsCount
        },
        "Paladin": {
          "total": maxExalts * statsCount
        }
    },
    "2": {
        "Rogue": {
          "total": maxExalts * statsCount
        },
        "Assassin": {
          "total": maxExalts * statsCount
        },
        "Trickster": {
          "total": maxExalts * statsCount
        }
    },
    "3": {
        "Bard": {
          "total": maxExalts * statsCount
        },
        "Huntress": {
          "total": maxExalts * statsCount
        },
        "Archer": {
          "total": maxExalts * statsCount
        }
    },
    "8": {
        "Sorcerer": {
          "total": maxExalts * statsCount
        },
        "Summoner": {
          "total": maxExalts * statsCount
        },
        "Priest": {
          "total": maxExalts * statsCount
        }
    },
    "17": {
        "Necromancer": {
          "total": maxExalts * statsCount
        },
        "Wizard": {
          "total": maxExalts * statsCount
        },
        "Mystic": {
          "total": maxExalts * statsCount
        }
    },
    "24": {
        "Kensei": {
          "total": maxExalts * statsCount
        },
        "Samurai": {
          "total": maxExalts * statsCount
        },
        "Ninja": {
          "total": maxExalts * statsCount
        }
    }
  }
    
  totalsStat = {
    'hp':  maxExalts * maxClasses,
    'mp':  maxExalts * maxClasses,
    'atk':  maxExalts * maxClasses,
    'def':  maxExalts * maxClasses,
    'spd':  maxExalts * maxClasses,
    'dex':  maxExalts * maxClasses,
    'vit':  maxExalts * maxClasses,
    'wis': maxExalts * maxClasses,
  }
}

function xmlToJson(xml) {
  var X = {
      toObj: function(xml) {
          var o = {};
          if (xml.nodeType==1) {   // element node ..
              if (xml.attributes.length)   // element with attributes  ..
                  for (var i=0; i<xml.attributes.length; i++)
                      o[xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
              if (xml.firstChild) { // element has child nodes ..
                  var textChild=0, cdataChild=0, hasElementChild=false;
                  for (var n=xml.firstChild; n; n=n.nextSibling) {
                      if (n.nodeType==1) hasElementChild = true;
                      else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                      else if (n.nodeType==4) cdataChild++; // cdata section node
                  }
                  if (hasElementChild) {
                      if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                          X.removeWhite(xml);
                          for (var n=xml.firstChild; n; n=n.nextSibling) {
                              if (n.nodeType == 3)  // text node
                                  o["#text"] = X.escape(n.nodeValue);
                              else if (n.nodeType == 4)  // cdata node
                                  o["#cdata"] = X.escape(n.nodeValue);
                              else if (o[n.nodeName]) {  // multiple occurence of element ..
                                  if (o[n.nodeName] instanceof Array)
                                      o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                  else
                                      o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                              }
                              else  // first occurence of element..
                                  o[n.nodeName] = X.toObj(n);
                          }
                      }
                      else { // mixed content
                          if (!xml.attributes.length)
                              o = X.escape(X.innerXml(xml));
                          else
                              o["#text"] = X.escape(X.innerXml(xml));
                      }
                  }
                  else if (textChild) { // pure text
                      if (!xml.attributes.length)
                          o = X.escape(X.innerXml(xml));
                      else
                          o["#text"] = X.escape(X.innerXml(xml));
                  }
                  else if (cdataChild) { // cdata
                      if (cdataChild > 1)
                          o = X.escape(X.innerXml(xml));
                      else
                          for (var n=xml.firstChild; n; n=n.nextSibling)
                              o["#cdata"] = X.escape(n.nodeValue);
                  }
              }
              if (!xml.attributes.length && !xml.firstChild) o = null;
          }
          else if (xml.nodeType==9) { // document.node
              o = X.toObj(xml.documentElement);
          }
          else
              alert("unhandled node type: " + xml.nodeType);
          return o;
      },
      innerXml: function(node) {
          var s = ""
          if ("innerHTML" in node)
              s = node.innerHTML;
          else {
              var asXml = function(n) {
                  var s = "";
                  if (n.nodeType == 1) {
                      s += "<" + n.nodeName;
                      for (var i=0; i<n.attributes.length;i++)
                          s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                      if (n.firstChild) {
                          s += ">";
                          for (var c=n.firstChild; c; c=c.nextSibling)
                              s += asXml(c);
                          s += "</"+n.nodeName+">";
                      }
                      else
                          s += "/>";
                  }
                  else if (n.nodeType == 3)
                      s += n.nodeValue;
                  else if (n.nodeType == 4)
                      s += "<![CDATA[" + n.nodeValue + "]]>";
                  return s;
              };
              for (var c=node.firstChild; c; c=c.nextSibling)
                  s += asXml(c);
          }
          return s;
      },
      escape: function(txt) {
          return txt.replace(/[\\]/g, "\\\\")
              .replace(/[\"]/g, '\\"')
              .replace(/[\n]/g, '\\n')
              .replace(/[\r]/g, '\\r');
      },

      removeWhite: function(e) {
          e.normalize();
          for (var n = e.firstChild; n; ) {
              if (n.nodeType == 3) {  // text node
                  if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                      var nxt = n.nextSibling;
                      e.removeChild(n);
                      n = nxt;
                  }
                  else
                      n = n.nextSibling;
              }
              else if (n.nodeType == 1) {  // element node
                  X.removeWhite(n);
                  n = n.nextSibling;
              }
              else                      // any other node
                  n = n.nextSibling;
          }
          return e;
      }
  };
  if (xml.nodeType == 9) // document node
      xml = xml.documentElement;
  return X.toObj(X.removeWhite(xml));
}

// rotmg classes
let classes = {
768: ['Rogue', [150, 100, 10, 0, 15, 15, 15, 10], [625.0, 195.0, 29.0, 0.0, 43.5, 43.5, 24.5, 29.0], [720, 252, 50, 25, 0, 0, 40, 50], [2, 13, 6, 9]],
775: ['Archer', [130, 100, 12, 0, 12, 12, 12, 10], [605.0, 195.0, 40.5, 0.0, 31.0, 31.0, 21.5, 29.0], [700, 252, 0, 25, 55, 50, 40, 50], [3, 15, 6, 9]],
782: ['Wizard', [100, 100, 12, 0, 10, 15, 12, 12], [50.0, 290.0, 40.5, 0.0, 29.0, 43.5, 21.5, 31.0], [670, 385, 0, 25, 50, 0, 40, 60], [17, 11, 14, 9]],
784: ['Priest', [100, 100, 12, 0, 12, 12, 10, 15], [50.0, 290.0, 31.0, 0.0, 40.5, 31.0, 19.5, 43.5], [670, 385, 50, 25, 55, 55, 40, 0], [8, 4, 14, 9]],
785: ['Samurai', [150, 100, 12, 0, 10, 10, 12, 12], [625.0, 195.0, 40.5, 0.0, 29.0, 29.0, 40.5, 40.5], [720, 252, 0, 30, 55, 50, 60, 60], [24, 27, 7, 9]],
796: ['Bard', [100, 100, 10, 0, 10, 15, 12, 15], [50.0, 290.0, 38.5, 0.0, 29.0, 43.5, 31.0, 43.5], [670, 385, 55, 25, 55, 70, 45, 0], [3, 28, 14, 9]],
797: ['Warrior', [200, 100, 15, 0, 7, 10, 10, 10], [60.0, 195.0, 43.5, 0.0, 26.0, 29.0, 38.5, 29.0], [770, 252, 0, 25, 50, 50, 0, 50], [1, 16, 7, 9]],
798: ['Knight', [200, 100, 15, 0, 7, 10, 10, 10], [60.0, 195.0, 43.5, 0.0, 26.0, 29.0, 38.5, 29.0], [770, 252, 50, 40, 50, 50, 0, 50], [1, 5, 7, 9]],
799: ['Paladin', [200, 100, 12, 0, 12, 10, 12, 10], [60.0, 195.0, 40.5, 0.0, 31.0, 29.0, 40.5, 38.5], [770, 252, 55, 30, 55, 55, 60, 0], [1, 12, 7, 9]],
800: ['Assassin', [150, 100, 12, 0, 15, 15, 15, 10], [625.0, 214.0, 31.0, 0.0, 43.5, 43.5, 24.5, 38.5], [720, 305, 65, 25, 65, 0, 40, 60], [2, 18, 6, 9]],
801: ['Necromancer', [100, 100, 12, 0, 10, 15, 10, 12], [50.0, 290.0, 40.5, 0.0, 29.0, 43.5, 19.5, 40.5], [670, 385, 0, 25, 50, 60, 40, 0], [17, 19, 14, 9]],
802: ['Huntress', [130, 100, 12, 0, 12, 12, 12, 10], [605.0, 214.0, 40.5, 0.0, 31.0, 31.0, 21.5, 29.0], [700, 305, 65, 25, 50, 60, 40, 50], [3, 20, 6, 9]],
803: ['Mystic', [100, 100, 10, 0, 12, 10, 15, 15], [50.0, 290.0, 38.5, 0.0, 31.0, 38.5, 24.5, 43.5], [670, 385, 65, 25, 60, 65, 40, 0], [17, 21, 14, 9]],
804: ['Trickster', [150, 100, 10, 0, 12, 15, 12, 12], [625.0, 195.0, 38.5, 0.0, 40.5, 43.5, 21.5, 31.0], [720, 252, 65, 25, 0, 0, 40, 60], [2, 22, 6, 9]],
805: ['Sorcerer', [100, 100, 15, 0, 12, 15, 10, 15], [50.0, 290.0, 43.5, 0.0, 40.5, 34.0, 38.5, 43.5], [670, 385, 0, 25, 60, 65, 0, 60], [8, 23, 14, 9]],
806: ['Ninja', [150, 100, 15, 0, 10, 12, 12, 12], [625.0, 195.0, 43.5, 0.0, 38.5, 40.5, 40.5, 40.5], [720, 252, 70, 25, 60, 70, 60, 70], [24, 25, 6, 9]],
817: ['Summoner', [100, 100, 10, 0, 12, 15, 10, 15], [50.0, 290.0, 38.5, 0.0, 31.0, 43.5, 19.5, 43.5], [670, 385, 50, 25, 60, 0, 40, 0], [8, 29, 14, 9]],
818: ['Kensei', [150, 100, 12, 0, 10, 12, 12, 15], [625.0, 195.0, 40.5, 0.0, 29.0, 40.5, 31.0, 34.0], [720, 252, 65, 25, 60, 65, 60, 50], [24, 30, 7, 9]],
};

// initialize totals
let totalsClass = {
  "1": {
      "Knight": {
          "total": maxExalts * statsCount
      },
      "Warrior": {
        "total": maxExalts * statsCount
      },
      "Paladin": {
        "total": maxExalts * statsCount
      }
  },
  "2": {
      "Rogue": {
        "total": maxExalts * statsCount
      },
      "Assassin": {
        "total": maxExalts * statsCount
      },
      "Trickster": {
        "total": maxExalts * statsCount
      }
  },
  "3": {
      "Bard": {
        "total": maxExalts * statsCount
      },
      "Huntress": {
        "total": maxExalts * statsCount
      },
      "Archer": {
        "total": maxExalts * statsCount
      }
  },
  "8": {
      "Sorcerer": {
        "total": maxExalts * statsCount
      },
      "Summoner": {
        "total": maxExalts * statsCount
      },
      "Priest": {
        "total": maxExalts * statsCount
      }
  },
  "17": {
      "Necromancer": {
        "total": maxExalts * statsCount
      },
      "Wizard": {
        "total": maxExalts * statsCount
      },
      "Mystic": {
        "total": maxExalts * statsCount
      }
  },
  "24": {
      "Kensei": {
        "total": maxExalts * statsCount
      },
      "Samurai": {
        "total": maxExalts * statsCount
      },
      "Ninja": {
        "total": maxExalts * statsCount
      }
  }
}
  
let totalsStat = {
  'hp':  maxExalts * maxClasses,
  'mp':  maxExalts * maxClasses,
  'atk':  maxExalts * maxClasses,
  'def':  maxExalts * maxClasses,
  'spd':  maxExalts * maxClasses,
  'dex':  maxExalts * maxClasses,
  'vit':  maxExalts * maxClasses,
  'wis': maxExalts * maxClasses,
}