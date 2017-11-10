var ClickPlayer = function (name, ui_div) {

    var match = null;
    var position = null;
    var current_game = null;
    var player_key = null;


    this.setupMatch = function (hearts_match, pos) {
	match = hearts_match;
	position = pos;
    }

    this.getName = function () {
	return name;
    }

    this.setupNextGame = function (game_of_hearts, pkey) {
    	current_game = game_of_hearts;
    	player_key = pkey;

    	game_of_hearts.registerEventHandler(Hearts.GAME_STARTED_EVENT, function (e) {
            console.log("Game Started");
            showNames(match);
            if(e.getPassType() !== Hearts.PASS_NONE){
              pass(e.getPassType);}
          });

      game_of_hearts.registerEventHandler(Hearts.TRICK_START_EVENT, function(e) {
            console.log("Trick Started");
            clearTheTable();
            if(position == e.getStartPos()){
              play();
            };
          });
      game_of_hearts.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, function(e) {
            console.log("Trick Continue");
            if(position == e.getNextPos()){
              play();
        };
          });

      game_of_hearts.registerEventHandler(Hearts.TRICK_COMPLETE_EVENT, function(e) {
            console.log("Trick Complete");
            var trick = e.getTrick();
            showWinner(trickInfo);
          });
      game_of_hearts.registerEventHandler(Hearts.CARD_PLAYED_EVENT, function(e) {
            var pPos = e.getPosition();
            var pCard = e.getCard();
            console.log("Card Played by:" + pPos);
            addToTable(pCard, pPos);
          });
      game_of_hearts.registerEventHandler(Hearts.GAME_OVER_EVENT, function(e) {
            console.log("Game Over. Scores Updated");
            updateScoreboard(match);
          });
    }

var clearTheTable = function() {
  for (i=0; i<4; i++){
    var div = document.getElementsByClassName('CardOnTable')[i];
    div.innerHTML = "?";
  }
}

var passDirection = function(passType) {
  if (passType == 1){
    return "Left";
  } else if (passType == 2){
    return "Right";
  } else {
    return "Across"
  }
}

var addToTable = function(pCard, pPos) {
  var toAdd = $("." + match.getPlayerName(pPos) + ' .CardOnTable');
  toAdd.html(pCard.toString);
}

var showPlayable = function() {
  $('.card').empty();
  var all = current_game.getHand(player_key).getUnplayedCards(player_key);
  var playable = current_game.getHand(player_key).getPlayableCards(player_key);
  console.log("Playable Cards: "+playable.length+" Unplayable Cards: "+(all.length - playable.length));
  for (i=0; i<all.length; i++){
    if(playable.includes(all[i])){
      var div = document.getElementsByClassName('card')[i];
      div.card = all[i];
      div.innerHTML = parseRank(all[i].getRank()) + " of " + parseSuit(all[i].getSuit());
      div.classList.add('playable');
      console.log("Entered Playable Loop");
    } else {
      var div = document.getElementsByClassName('card')[i];
      div.card = all[i];
      div.innerHTML = parseRank(all[i].getRank()) + " of " + parseSuit(all[i].getSuit());
    }
  }
}

var play = function() {
  $('.Button').empty().html("<div>Select a Card to Play</div>");
  showPlayable();

  $('.card').click(function(){
    if ($(this).hasClass('playable')){
      $(this).addClass('select');
      if ($('.select').length == 1){
        $('.Button').empty().html("<button id= 'playButton' type='button'>Play</button>");
      }
    } else{
      if($(this).hasClass('select')){
        $(this).toggleClass('select');
        $('.Button').empty().html("<div>Select a Card to Play</div");
      }
    }
  });

  $(".Button").click(function() {
      console.log("Play Button Clicked");
      $('.Button').empty();
      var div = document.getElementsByClassName('select')[0];
      var rank = div.card.getRank();
      var suit = div.card.getSuit();
      var toPlay = new Card(rank,suit);
      div.classList.toggle('select');
      current_game.playCard(toPlay, player_key);
      console.log("Card Played by User");
      showPlayable();
  });
}

var showWinner = function(trick) {
  var win = trick.getWinner();
  $('.trickWinner').empty().html("Trick Winner: " + win.getPlayerName());
}

var updateScoreboard = function(match) {
  $('.scoreboad').empty();
  var current = match.getScoreboard()
  $('scoreboard').append("<li id='nScore'>" + match.getPlayerName(Hearts.NORTH) + ": " + match.getScoreboard()[Hearts.NORTH]);
  $('scoreboard').append("<li id='eScore'>" + match.getPlayerName(Hearts.EAST) + ": " + match.getScoreboard()[Hearts.EAST]);
  $('scoreboard').append("<li id='sScore'>" + match.getPlayerName(Hearts.SOUTH) + ": " + match.getScoreboard()[Hearts.SOUTH]);
  $('scoreboard').append("<li id='wScore'>" + match.getPlayerName(Hearts.WEST) + ": " + match.getScoreboard()[Hearts.WEST]);
}

var showNames = function(match) {
  $(".NORTH").prepend("<div class='pname'>" + match.getPlayerName(Hearts.NORTH) + "</div>");
  $(".EAST").prepend("<div class='pname'>" + match.getPlayerName(Hearts.EAST) + "</div>");
  $(".SOUTH").prepend("<div class='pname'>" + match.getPlayerName(Hearts.SOUTH) + "</div>");
  $(".WEST").prepend("<div class='pname'>" + match.getPlayerName(Hearts.WEST) + "</div>");
}
var pass = function(passType) {
  var direction = passDirection(passType);
  $('.Button').empty().html("<div>Select 3 Cards to Pass " + direction + "</div");
  showPlayable();

  $('.card').click(function(){
    if ($('.select').length < 3){
      $(this).toggleClass('select');
      if ($('.select').length == 3){
        $('.Button').empty().html("<button id= 'passButton' type='button'>Pass</button>");
      }
    } else{
      if($(this).hasClass('select')){
        $(this).toggleClass('select');
        $('.Button').empty().html("<div>Select 3 Cards to Pass " + direction + "</div");
      }
    }
  });

    $(".Button").click(function(){
      $('.Button').empty();
      var toPass = [];
      for (i=0; i < $('.select').length; i++){
        var div = document.getElementsByClassName('select')[i];
        var rank = div.card.getRank();
        var suit = div.card.getSuit();
        toPass.push(new Card(rank,suit));
      }
      $('.select').each(function(){
        $(this).toggleClass('select');
      });
      current_game.passCards(toPass, player_key);
      showPlayable();
    });

}

var parseSuit = function(suit) {
  switch (suit) {
    case 0:
      return "Hearts";
    case 1:
      return "Spades";
    case 2:
      return "Diamonds";
    case 3:
      return "Clubs";
  }
}


var parseRank = function(rank) {
  switch (rank) {
    case 2:
        return "Two";
    case 3:
        return "Three";
    case 4:
        return "Four";
    case 5:
        return "Five";
    case 6:
        return "Six";
    case 7:
        return "Seven";
    case 8:
        return "Eight";
    case 9:
        return "Nine";
    case 10:
        return "Ten";
    case 11:
        return "Jack";
    case 12:
        return "Queen";
    case 13:
        return "King";
    case 14:
        return "Ace";

  }
}
}
