$(document).ready(function(){


    //重新遊戲
    $('#newgame').click(function() {
        location.reload();
    });

    for (var i = 0; i <= 10; i++) (function(i) {
        $('#btn' + i).click(function() {
            $.ajax({
                url: "/bowling/game2/start",
                data: {value: i},
                type: "GET",
                dataType: "json",
                success: function(jdata){
                    showScore(jdata);
                    isEnd(jdata);
                }
            });
        })
    })(i); 

});

//顯示分數
function showScore(jdata) {
    var nowframe = Math.ceil(jdata['roundcounter']/2);
    for (var i = 1; i < nowframe; i ++){
        $('#f' + i + 'score').text(jdata['framescore'][i]);
    }
    for (var i = 1, j = 0; i <= 21; i ++){
        $('.box' + i).text(jdata['roundscore'][j]);
        if (jdata['roundscore'][j] == "X" && i < 19) {
            i++;
            $('.box' + i).text(" "); 
        }
        j++;
    }
}

//遊戲結束
function isEnd(jdata) {
    if (jdata['endflag'] || jdata['roundcounter'] > 23) {
        setTimeout(function() {
            alert('遊戲結束!');
            var name = prompt('請輸入你的名字');
            if(name != "") {
                $.ajax({
                      url: "/bowling/game2/score",
                      data: {Name: name,
                             Score: $('#f10score').text()},
                      type: "GET",
                      dataType: "text",
                      success: function(msg){
                          location.href = "/bowling/game2";
                          alert(msg);
                      }
                });
            }
        }, 100);
    }
}

// $('#btnstar').click(function() { 
  //   var frameCounter = bowling.frameCounter;
  //   if (frameCounter % 2 == 1) {
  //     max = 10;
  //   } else {
  //     max = 10 - bowling.rollsArray[frameCounter - 2] + 1;
  //   }
  //   var number = Math.floor(Math.random() * max);
  //   bowling.roll(number);
  //   afterRoll();
  // });