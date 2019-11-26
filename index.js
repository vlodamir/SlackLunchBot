const SlackBot = require("slackbots");
const axios = require("axios");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const request = require("request");
const Promise = require("promise");

// oh yes give me all those russian hackers
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const apikey = "";

const botOAuthToken = "";
const channelName = "";

const dayNames = [
  "Pondělí",
  "Úterý",
  "Středa",
  "Čtvrtek",
  "Pátek",
  "Sobota",
  "Neděle"
];

const bot = new SlackBot({
  token: botOAuthToken,
  name: ""
});

//Start Handler
bot.on("start", () => {
  const params = {
    icon_emoji: ":sandwich:"
  };

  console.log("You hungri boiii?");
  //bot.postMessageToChannel(channelName, "You look hungry", params);
});

//Error handler
bot.on("error", err => console.log(err));

//Message handler
bot.on("message", data => {
  if (data.type !== "message") {
    return;
  }

  //console.log(data);
  handleMessage(data.text);
});

//co kdyz nekdo napise command vicekrat?
//Responds to Data
var previousMessage = "";
function handleMessage(message) {
  message = message.toLowerCase();
  if (message.includes == "hey lenny") {
    bot.postMessageToUser("Miroslav Vlodarčík", "this should work", {
      icon_emoji: ":robot_face:"
    });
  }

  if (previousMessage != "help") {
    if (message == "jack") {
      getZomatoMenu("jack", 16525845, ":hamburger:");
    } else if (message == "lev" || message == "ulva") {
      getZomatoMenu("lev", 16513499, ":lion_face:");
    } else if (message == "kolkovna") {
      getZomatoMenu("kolkovna", 17978813, ":ticket:");
    } else if (message == "jaros" || message == "ujarosu") {
      getScrapedMenu("jaros", "http://www.ujarosu.cz/cz/denni-menu/");
    } else if (message == "majak") {
      getScrapedMenu(
        "majak",
        "http://www.restaurantmajak.cz/cs/clanky/denni-nabidka"
      );
    } else if (message == "freshntasty" || message == "freshntastykb") {
      getScrapedMenu(
        "freshntastykb",
        "https://www.freshandtasty.cz/cz/firmy/moje-jidelna-kb/menu/obedy"
      );
    } else if (message == "basta") {
      getScrapedMenu(
        "basta",
        "http://www.pustkoveckabasta.cz/pustkovecka-basta"
      );
    } else if (message == "sodexo") {
      getScrapedMenu(
        "sodexosiemens",
        "http://siemens.portal.sodexo.cz/cs/jidelni-listek-na-cely-tyden"
      );
    } else if (message.includes("menuova")) {
      getMenuOva();
    } else if (message.includes("menuprg")) {
      getMenuPrg();
    }
  }
  if (message == "help") {
    getHelp(); //stop it. get some help.
  }

  previousMessage = message;
}

function getHelp() {
  console.log("Printing help...");
  bot.postMessageToChannel(
    channelName,
    "*Commands for Ostrava:*\n>Jack\n>Lev\n>Jaros\n>Basta\n>MenuOva\n" +
      "*Commands for Prague:*\n>Majak\n>Kolkovna\n>Freshntasty\n>MenuPrg\n" +
      "_...commands aren't case sensitive_",
    { icon_emoji: ":ambulance:" }
  );
}

function getZomatoMenu(resName, resId, resEmoji) {
  const zomatoUrl = "https://developers.zomato.com/api/v2.1/dailymenu?res_id=";
  var foodString = "";

  fetch(zomatoUrl + resId, {
    method: "GET",
    headers: {
      user_key: apikey
    }
  })
    .then(response => response.json())
    .then(data => {
      // const dishes = data.daily_menus[0];
      //console.log(dishes); // Prints result from `response.json()` in getRequest
      const params = { icon_emoji: resEmoji };

      var dishArray = data.daily_menus[0].daily_menu.dishes;
      var dishArrayString = "";

      //REPETITIVE CODE!
      var currentDayNumber = new Date().getDay() - Number(1); //pondeli musi byt 0
      //currentDayNumber = 4;
      console.log("Day number: " + currentDayNumber);

      var foodArray = [[], []];
      var foodArray = [];
      var priceArray = [];
      for (var i in dishArray) {
        dishArray[i].dish.name = dishArray[i].dish.name.replace(/\s*$/, "");
        foodArray.push(dishArray[i].dish.name);
        priceArray.push(dishArray[i].dish.price);
      }
      foodArray = [foodArray, priceArray];

      var foodString = getFoodString(foodArray, currentDayNumber);
      printFood(foodString, resName);
    })
    .catch(error => console.error(error));
}

////////////// ZOMATO END ////////////

//=============================================================================

function printFood(foodString, restaurantName) {
  console.log(foodString);
  var slackString =
    //"Menu pro restauraci " +
    "*" +
    getRestaurantFullName(restaurantName) +
    "*: " +
    "```" +
    foodString +
    "```";
  bot.postMessageToChannel(channelName, slackString);
}

function getMenuOva() {
  getScrapedMenu("jaros", "http://www.ujarosu.cz/cz/denni-menu/");
  getZomatoMenu("jack", 16525845, ":hamburger:");
  getZomatoMenu("lev", 16513499, ":lion_face:");
  getScrapedMenu("basta", "http://www.pustkoveckabasta.cz/pustkovecka-basta");
}

function getMenuPrg() {
  getZomatoMenu("kolkovna", 17978813, ":ticket:");
  getScrapedMenu(
    "majak",
    "http://www.restaurantmajak.cz/cs/clanky/denni-nabidka"
  );
  getScrapedMenu(
    "freshntastykb",
    "https://www.freshandtasty.cz/cz/firmy/moje-jidelna-kb/menu/obedy"
  );
  getScrapedMenu(
    "sodexosiemens",
    "http://siemens.portal.sodexo.cz/cs/jidelni-listek-na-cely-tyden"
  );
}

function requestPage(url) {
  return new Promise(resolve => {
    //var url = "http://www.ujarosu.cz/cz/denni-menu/"
    request(url, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        //console.log(html)
        resolve(html);
      } else {
        console.log("Couldn't get HTML page. (Check internet connection).");
      }
    });
  });
}

// GET SCRAPED MENU -----
function getScrapedMenu(restaurantName, url) {
  var foods = 0;

  requestPage(url).then(html => {
    const $ = cheerio.load(html, { decodeEntities: false });
    var currentDayNumber = new Date().getDay() - Number(1); //pondeli musi byt 0
    //currentDayNumber = 4;
    console.log("Day number: " + currentDayNumber);

    //je treba dale osetrit pripad kdy majak na strankach nema uvedene jidla (v nedeli denni nabidka neni k dispozici)
    //nektere restaurace serviruji i o vikendu... i fix,dw lemme just chill for a bit
    if (currentDayNumber >= 0 && currentDayNumber < 5) {
      var tempFoodArr = getScrapedFood($, restaurantName, currentDayNumber);
      foods = getFoodString(tempFoodArr, currentDayNumber);
      //console.log(foods);
    } else {
      console.log(
        "Dnes je " +
          dayNames[currentDayNumber] +
          " a pro tento den v tehle restauraci není jídlo"
      );
    }

    if (foods.size != 0 && foods != 0) {
      //console.log(foods.size);
      console.log("LOG: I got food!");
      printFood(foods, restaurantName);
    } else {
      console.log("I aquired no foods :(");
      bot.postMessageToChannel(
        channelName,
        "Vypisuji obedy pouze pro Pondeli-Patek"
      );
    }
  });
}

function getRestaurantFullName(restaurantName) {
  console.log("getRestaurantName: " + restaurantName);
  switch (restaurantName) {
    case "jaros":
      return "U Jarošů";
    case "majak":
      return "Maják";
    case "jack":
      return "Jack`s Burger Bar";
    case "lev":
      return "U Zlatého lva";
    case "kolkovna":
      return "Kolkovna";
    case "freshntastykb":
      return "Moje jídelna KB";
    case "basta":
      return "Pustkovecká Bašta";
    case "sodexosiemens":
      return "Sodexo Siemens";
    default:
      return "[Restaurant Full Name]";
  }
}

function formatTextDots(foodArray) {
  var longestDish = 0;
  var symbol = ".";

  for (var i in foodArray[0]) {
    if (foodArray[0][i].length >= longestDish) {
      longestDish = foodArray[0][i].length;
      //console.log(longestDish);
    }
  }

  longestDish += Number(5);

  for (var i in foodArray[0]) {
    foodArray[0][i] += symbol.repeat(longestDish - foodArray[0][i].length);
  }

  return foodArray;
}

function getTableSize($, target) {
  //pouze pro majak a jarose
  return $("tr", target).length;
}

function getFoodString(foodArray, currentDayNumber) {
  var foodString = "";
  console.log(dayNames[currentDayNumber] + ":");

  foodArray = formatTextDots(foodArray);

  for (var i in foodArray[1]) {
    if (i == 0) continue;

    if (!foodArray[1][i].includes("Kč") && !isNaN(parseInt(foodArray[1][i]))) {
      foodArray[1][i] += " Kč";
    }
  }

  for (var i in foodArray[0]) {
    //console.log(Number(i)+Number(1) + ". " + foodArray[0][i] + "\t" + foodArray[1][i]);
    foodString +=
      // Number(i) +
      // Number(1) +
      // ". " +
      "• " + foodArray[0][i] + "\t" + foodArray[1][i] + "\n";
  }
  return foodString;
}

function getScrapedFood($, restaurantName, currentDayNumber) {
  var scopeTarget = "";

  //var tableSize = getTableSize($, scopeTarget);

  if (restaurantName == "majak") {
    scopeTarget = ".foodlist";
    return scrapeFood(
      $,
      getTableSize($, scopeTarget),
      scopeTarget,
      restaurantName,
      10,
      currentDayNumber
    );
  } else if (restaurantName == "jaros") {
    scopeTarget = "table";
    return scrapeFood(
      $,
      getTableSize($, scopeTarget),
      scopeTarget,
      restaurantName,
      6,
      currentDayNumber
    );
  } else if (restaurantName == "freshntastykb") {
    scopeTarget = ".whole-menu__wrap menu"; //???
    return scrapeFood(
      $,
      getTableSize($, scopeTarget),
      scopeTarget,
      restaurantName,
      0,
      currentDayNumber
    );
  } else if (restaurantName == "basta") {
    return scrapeFood($, 0, "", "basta", 0, 0);
  } else if (restaurantName == "sodexosiemens") {
    return scrapeFood($, 0, "", "sodexosiemens", 0, currentDayNumber);
  }
}

// ================= SCRAPE FOOD v2 =========================================

function scrapeFood(
  $,
  tableSize,
  scopeTarget,
  restaurantName,
  maxFoodsPerDay,
  currentDayNumber
) {
  if (restaurantName == "majak" || restaurantName == "jaros") {
    return scrapeMajakOrJaros(
      tableSize,
      restaurantName,
      scopeTarget,
      $,
      currentDayNumber,
      maxFoodsPerDay
    );
  } else if (restaurantName == "freshntastykb") {
    return scrapeFreshNTasty($, currentDayNumber);
  } else if (restaurantName == "basta") {
    return scrapBasta($);
  } else if (restaurantName == "sodexosiemens") {
    return scrapeSodexoSiemens($, currentDayNumber);
  }
}

// ====================================================================

function scrapeMajakOrJaros(
  tableSize,
  restaurantName,
  scopeTarget,
  $,
  currentDayNumber,
  maxFoodsPerDay
) {
  var justFoods = [];
  var justPrices = [];
  var detail = [];
  var addedFoods = 0;
  var canAdd = false;

  for (i = 0; i <= tableSize; i++) {
    if (
      $(selectorFactory(restaurantName, "day", i), scopeTarget)
        .text()
        .includes(dayNames[currentDayNumber])
    ) {
      canAdd = true;
      addedFoods = 0;
    }

    if (
      $(selectorFactory(restaurantName, "day", i), scopeTarget)
        .text()
        .includes(dayNames[currentDayNumber + 1])
    ) {
      canAdd = false;
      break;
    } else if (addedFoods > maxFoodsPerDay) {
      break;
    }

    if (canAdd) {
      $(selectorFactory(restaurantName, "food", i), scopeTarget).each(
        function() {
          justFoods.push($(this).html());
          addedFoods++;
        }
      );

      $(`tr:nth-child(${i}) td:nth-child(1)`).each(
        (i,element) => {
          detail.push($(element).html().trim());
        }
      )

      $(selectorFactory(restaurantName, "price", i), scopeTarget).each(
        function() {
          justPrices.push($(this).html());
        }
      );
    }

    
  }

  if(restaurantName == "jaros"){
    detail[0] = "";
    for(var i in justFoods){
      justFoods[i] = detail[i] + " " + justFoods[i];
    }
  }
  return [justFoods, justPrices];
}

//chybi meal__item--extra
function scrapeFreshNTasty($, currentDayNumber) {
  var justFoods = [];
  var justPrices = [];
  var justExtra = [];

  ////////
  var freshNTastyCurrDayNumber = currentDayNumber + Number(2);

  //foods thursday select
  $(
    ".meal__item--second",
    `.meal__items:nth-child(${freshNTastyCurrDayNumber})`
  ).each((i, element) => {
    justFoods.push($(element).html());
  });
  //prices select
  $(
    ".meal__item--third",
    `.meal__items:nth-child(${freshNTastyCurrDayNumber})`
  ).each((i, element) => {
    justPrices.push($(element).html());
  });

  $(
    ".meal__item--extra",
    `.meal__items:nth-child(${freshNTastyCurrDayNumber})`
  ).each((i, element) => {
    justExtra.push($(element).html());
  });

  for (i = 0; i <= justFoods.length; i++) {
    if (justFoods[i] == "") {
      justFoods.splice(i, 1);
      justPrices.splice(i, 1);
      justExtra.splice(i, 1);
    }
    // if(justExtra[i] != ""){
    //   justFoods[i]+= " (" + justExtra[i] + ")";
    // }
  }

  return [justFoods, justPrices];
}

function scrapBasta($) {
  var justFoods = [];
  var justPrices = [];
  var detail = [];

  $("li h4", "#daily2 .daily-item.today").each((i, element) => {
    justFoods.push($(element).html());
  });

  $("li .price", "#daily2 .daily-item.today").each((i, element) => {
    justPrices.push(
      $(element)
        .html()
        .trim()
    );
  });

  $("li .menu-detail", "#daily2 .daily-item.today").each((i, element) => {
    detail.push(
      $(element)
        .html()
        .trim()
    );
  });
  //polevka nema cenu
  justPrices.unshift("");

  for (var i in justFoods) {
    justFoods[i] = detail[i] + " " + justFoods[i]  ;
  }

  return [justFoods, justPrices];
}

function scrapeSodexoSiemens($, currentDayNumber) {
  var justFoods = [];
  var justPrices = [];
  var detail = [];

  //var currentDayNumber = new Date().getDay() - Number(1); //pondeli musi byt 0
  //currentDayNumber = 4; //debug
  var siemensDay = currentDayNumber * -1 + Number(4);

  $(".popisJidla", `#menu-${siemensDay}`).each((i, element) => {
    justFoods.push($(element).text());
  });

  $(".vaha", `#menu-${siemensDay}`).each((i, element) => {
    detail.push($(element).text());
  });

  $(".pismo", `#menu-${siemensDay}`).each((i, element) => {
    justPrices.push($(element).text());
  });

  for(var i in justFoods){
    if(detail[i] == ""){
      detail[i] = "---g"
    }
      justFoods[i] = detail[i] + " " + justFoods[i] ;
      //console.log(justFoods[i] + "........." + justPrices[i]);
  }

  return [justFoods, justPrices];
}

function selectorFactory(restaurantName, type, i) {
  switch (restaurantName) {
    case "majak":
      switch (type) {
        case "day":
          return `tr:nth-child(${i}) th:nth-child(1)`; //th
        case "food":
          return `tr:nth-child(${i}) td:nth-child(2)`;
        case "price":
          return `tr:nth-child(${i}) td:nth-child(3)`;
      }
      break;
    case "jaros":
      switch (type) {
        case "day":
          return `tr:nth-child(${i}) td:nth-child(1)`; //td
        case "food":
          return `tr:nth-child(${i}) td:nth-child(2)`;
        case "price":
          return `tr:nth-child(${i}) td:nth-child(3)`;
      }
      break;

    default:
      console.log(
        "Could not select anything for type: " + type + " with index: " + i
      );
  }
}

