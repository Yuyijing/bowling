$(document).ready(function() {

	//重新遊戲
	$('#newgame').click(function() {
	    location.reload();
	});

	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	var ballradius = 25;
	var x = canvas.width / 2;
	var y = canvas.height-60;
	var dy = -5;
	var flag = false;
	var pinWidth = 30;
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
		ctx.drawImage(ball, x, y, 50, 50);
		// ctx.beginPath();
	 //    ctx.arc(x, y, ballradius, 0, Math.PI*2);
	 //    ctx.fillStyle = "#0095DD";
	 //    ctx.fill();
	 //    ctx.closePath();
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
		            // ctx.beginPath();
		            ctx.drawImage(pin, pinX, pinY, 40, 70);
		            // ctx.rect(pinX, pinY, 30, 30);
		            // ctx.fillStyle = "#0095DD";
		            // ctx.fill();
		            // ctx.closePath();
				}
			}
			pinOffsetLeft += 15;
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
	    	test(score);
	    	x = canvas.width / 2;
			y = canvas.height-30;
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
	                if(x + ballradius/2 > pin.x && x < pin.x + pinWidth + ballradius/2 && y > pin.y && y < pin.y + pinHeight) {
	                    pin.status = 0;
	                    score++;
	                }
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

	setInterval(draw, 10);
});

function test(score) {
    $.ajax({
            url: "/bowling/game2/start",
            data: {value: score},
            type: "GET",
            dataType: "json",
            success: function(jdata){
            	// console.log(jdata);
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

