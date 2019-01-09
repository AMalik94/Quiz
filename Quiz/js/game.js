/* CS5003 - Practical One - Pub Quiz
 * A quiz game where users answers questions to get money
 * Student ID - 170022175
 */

$(document).ready(function() {

	var quiz, qN, cN, correct, wrong, timerId, lifeline = true, arr, score = 0, isEnd = false;
	var timeLeft = 30, elem = document.getElementById('timer');
	var username = "";

	function generateN() { return Math.ceil(Math.random()*100)%4; } // generate random number 

	// Timer Ref: "https://www.w3schools.com/jsref/met_win_setinterval.asp"
	function timeisup() {
		clearInterval(timerId);		

		timeLeft = 30;
		timerId = setInterval(countdown, 1000);
	}
    
	// callback function for timer.
	function countdown() {
		if (timeLeft == 0) {
			elem.innerHTML = timeLeft; 
			doSomething();
		}
		else 
			elem.innerHTML = timeLeft--;
	}
    
	// when time is up, this function is called.
	function doSomething() {
		alert("Sorry, Time is up!");
		wrong ++;
		$('#wrong_amount').text(wrong);
		if (wrong == 3) {
			isEnd = true;
			alert("Sorry, You need to retry from starting.");
			clearInterval(timerId);
			storeScore(); 
		} else {
			qN ++; show_quiz();
		}
	}
	
	function initConfig() {
		qN = 0; cN = -1; wrong = 0; correct = 0; lifeline = true; quiz = []; isEnd = false;
		for (var i = 0; i < 4; ++ i ) $("#score" + i + " a").text('0');
		$(".life_box ul li").addClass("active");
		$('#wrong_amount').text(0);
	}
    
	// display the quiz 
	function show_quiz() {
		if(isEnd) return;
		$("#question_box").text(quiz[qN].question); 
		cN = generateN(); 
		arr = quiz[qN].incorrect_answers;	
		if (cN == 3) {arr.push(quiz[qN].correct_answer);}
		else {arr.splice(cN, 0, quiz[qN].correct_answer);}
		for (var i = 0; i < arr.length; ++ i) { $("#answer" + i + " span").text(arr[i]); }
		timeisup(); 
	}
    
	// start quiz.
	function initQuiz() {
		show_quiz();
		timeisup();
	}
    
	// by ajax, here i have got the data for quiz.
	function successCallback(res) {
		initConfig();
		quiz = res.results;
		$(".start_modal").hide();
		$(".quiz_box").show(200);
		initQuiz();
	}
    
	// display the player's score on screen.
	function scoreMark() {
		score = correct * 200;
		var tmp = score, d = 0;
		while (tmp > 0) {
			var mod = tmp % 10;
			tmp = Math.floor(tmp / 10);
			$("#score" + d + " a").text(mod); d ++;
		}
	}
	// if the player clicked the 50:50 lifeline, by random, remove the incorrect answers
	function resort() {
		var keep = cN;
		while ( keep == cN ) {
			keep = generateN();
		}
		for (var i = 0; i < arr.length; ++ i) {
			if (keep != i && cN != i) {
				// console.log(keep+ " " + cN + " " + i);
				$('#answer' + i + " span").text('');
			}
		}
	}

	$('#play_btn').on('click', function() {
		username = $("input[name=username]").val();
		if (username == "" || username == undefined) {
			alert("Please enter your username");
		} else {
			$.ajax({
				method: "GET",
				url: "https://opentdb.com/api.php?amount=20&category=21&difficulty=easy&type=multiple",
				success: successCallback
			});
		}
	});
	// validates if the answer is correct or not
	$("button[name=answer]").on("click", function() {
		if(isEnd) return;
		var answerId = $(this).attr('id');
		if (answerId == ("answer"+cN)) {
			alert('Correct Answer!');
			qN ++; correct ++;
			scoreMark();
			show_quiz();
		} else {
			alert("Sorry, Wrong Answer!");
			wrong ++;
			$('#wrong_amount').text(wrong);
			if (wrong == 3) { 
				isEnd = true;
				alert("Sorry, You need to retry from starting.");
				clearInterval(timerId);
		
				// $('.start_modal').show();
				storeScore(); // store the score in localstorage.
			} else {
				qN ++; show_quiz(); 
			}
		}
	});

	$("#lifeLine").on("click", function () {
		if (lifeline) {
			resort();
			$(".life_box ul li").removeClass();
			lifeline = false;
		}
		return;
	});
	// display the usernames and scores on the leaderboard 
	$("h2.heading").on('click', function () {
		var leaderboard_e = document.getElementById('leaderboard_list');
		var html_ = "";
		for (var i = 0; i < localStorage.length; ++ i) {
			var _username = localStorage.key(i);  
			var _score 	  = localStorage.getItem(_username); 
			if (_username == username) html_ += "<li><span style='color: red'>" + _username + "</span>&nbsp;&nbsp;&nbsp;<span style='color: red'>" + _score + "</span></li>";
			else html_ += "<li><span>" + _username + "</span>&nbsp;&nbsp;&nbsp;<span>" + _score + "</span></li>";
			
		}
		leaderboard_e.innerHTML = html_;
		$(".quiz_box").hide(200);
		$("#leaderBoard").show(100);
	});

	$("#back_btn").on("click", function () {
		$("#leaderBoard").hide();
		$('.start_modal').show(300);
	});
	
	function storeScore() {
		if (typeof(Storage) !== "undefined") {
		    localStorage.setItem(username, score);
		} else {
		    alert("Sorry! No Web Storage support..");
		}
	}
});