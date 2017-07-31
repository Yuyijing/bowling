$(document).ready(function() {

	//重新遊戲
	$('#newgame').click(function() {
	    location.reload();
	});

	//使用按鈕輸入分數
	for (var i = 0; i <= 10; i++) (function(i) {
        $('#btn' + i).click(function() {
            addscore(i);
        })
    })(i);


    //遊戲畫面
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	var ballLength = 50;
	var x = canvas.width / 2;
	var y = canvas.height-60;
	var dy = -5;
	var flag = false;
	var pinWidth = 40;
	var pinHeight = 30;
	var pinPadding = 6;
	var score = 0;
	var count = 1;

	var pin = new Image();
	var ball = new Image();
	pin.src = "/assets/vendor/images/pin.png";
	ball.src = "/assets/vendor/images/ball.png";

	var pins = [];
	for (var i = 4; i > 0; i--) {
		pins[i] = [];
		for (var j = 0; j < i; j++) {
			pins[i][j] = { x: 0, y: 0, status: 1};
		}
	}

	//滑鼠事件監聽
	canvas.addEventListener("mousemove", mouseMoveHandler, false);
	canvas.addEventListener("click", mouseClickeHandler, false);

	//BALL
	function drawBall() {
		ctx.drawImage(ball, x, y, ballLength, ballLength);
	}

	//PINS
	function drawPins() {
		var pinOffsetLeft = 174;
		var pinOffsetTop = 30;
		for (var i = 4; i > 0; i--) {
			for (var j = 0; j < i; j++) {
				if (pins[i][j].status == 1) {
					var pinX = (j * (pinWidth + pinPadding)) + pinOffsetLeft;
		            var pinY = ((4 - i) * (pinHeight + pinPadding)) + pinOffsetTop;
		            pins[i][j].x = pinX;
		            pins[i][j].y = pinY;
		            ctx.drawImage(pin, pinX, pinY, 40, 70);
				}
			}
			pinOffsetLeft += pinWidth/2 + pinPadding/2;
		}
	}

	function draw() {
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	    drawPins();
	    drawBall();
	    if (flag) {
	    	y += dy;
	    	collisionDetection();
	    }

	    //一輪結束
	    if (y <= 0) {
	    	flag = false;
	    	addscore(score);
	    	x = canvas.width / 2;
			y = canvas.height-60;
	    	if (score == 10 || count == 2) {
	    		for (var i = 4; i > 0; i--) {
					for (var j = 0; j < i; j++) {
						pins[i][j].status = 1;
					}
				}
	    		count = 1;
		    } else {
				count++;
		    }
		    canvas.addEventListener("mousemove", mouseMoveHandler, false);
			canvas.addEventListener("click", mouseClickeHandler, false);
		    score = 0;
	    }
	}

	//偵測碰撞
	function collisionDetection() {
	    for (var i = 4; i > 0; i--) {
			for (var j = 0; j < i; j++) {
	            var pin = pins[i][j];
	            if(pin.status == 1) {
	                if(x + ballLength > pin.x && x < pin.x + pinWidth && y > pin.y && y < pin.y + pinHeight) {
	                    pin.status = 0;
	                    score++;
	                    if (i < 4) {
	                     	//左後方pin
	                     	probabilityDetection(pins[i+1][j], i, j);
	                     	//右後方pin
	                     	probabilityDetection(pins[i+1][j+1], i, j);
	                    }
	                    if ((j-1) > 0) {
	                    	//左邊pin
	                     	probabilityDetection(pins[i][j-1], i, j);
	                    }
	                    if ((j+1) < i) {
	                    	//右邊pin
	                     	probabilityDetection(pins[i][j+1], i, j);
	                    }
	                }
	            }
	        }
	    }
	}

	//隨機判斷左右及後方pin
	function probabilityDetection(pin, i, j) {
		if (pin.status == 1) {
			pin.status =  Math.round(Math.random());
			if (pin.status == 0) {
				score++;
				if (i < 4) {
					//左後方pin
		            return probabilityDetection(pins[i+1][j], i+1, j);
		            //右後方pin
		            return probabilityDetection(pins[i+1][j+1], i+1, j+1);
				}
				if ((j-1) > 0) {
	                //左邊pin
	                return probabilityDetection(pins[i][j-1], i, j-1);
	            }
	            if ((j+1) < i) {
	                //右邊pin
	                return probabilityDetection(pins[i][j+1], i, j+1);
	            }
			}
		}
	}

	//移動
	function mouseMoveHandler(e) {
		var relativeX = e.clientX - canvas.offsetLeft;
	    if(relativeX > 0 && relativeX < canvas.width) {
	        x = relativeX;
	    }
	}


	//點擊
	function mouseClickeHandler(e) {
		canvas.removeEventListener("mousemove", mouseMoveHandler, false);
		canvas.removeEventListener("click", mouseClickeHandler, false);
		return flag = true;
	}

	setInterval(draw, 20);
});

function addscore(score) {
    $.ajax({
            url: "/bowling/game2/start",
            data: {value: score},
            type: "GET",
            dataType: "json",
            success: function(jdata){
                showScore(jdata);
                isEnd(jdata);
            }
    });
}

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
            var name;
            while(1) {
            	name = prompt('請輸入你的名字');
            	if(name == null) {
            		location.href = "/bowling/game2";
            		break;
	            }else if(name == '') {
	            	alert('請輸入姓名');
	            }else {
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
                	break;	
	            }
            }   
        }, 100);
    }
}


