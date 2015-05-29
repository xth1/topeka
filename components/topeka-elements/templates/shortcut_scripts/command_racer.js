
/* Set CommandRacer object with parameters*/
$CommandRacer = {
    num_question: 1, // initial value
    curr_questio: null,
    curr_points: 0,
    answered: false,
    correct_answered: false,
    // TIMER
    timelimit: 10000, // miliseconds
    update_time: 10, // miliseconds
    curr_time_ramaning: 0.0, //miliseconds
    timer_is_running: false, // boolean
    //
    time_between_question: 1500, // miliseconds
    can_skip_question: true
};

$CommandRacer.updatePoints = function() {
    $('#points_earned').html($CommandRacer.curr_points + "");
}

$CommandRacer.setAnswerClass = function(class_name) {
    $('#answer').removeClass("alert-success");
    $('#answer').removeClass("alert-danger");
    $('#answer').removeClass("alert-info");
    $('#answer').removeClass("alert-warning");
    $('#answer').addClass(class_name);
}

$CommandRacer.startRecordingKeys = function() {
    Mousetrap.record(function(sequence) {
        console.log('You pressed: ' + sequence.join(' '));
        var question = $CommandRacer.curr_question;
        if ($CommandRacer.answered == true) {
            return;
        }
        // Stores results

        $('#key_strokes').html(sequence);
        if (sequence == question.cmd) { // right answer
            // Add result 
            $Result.data.add({
                keystrokes: sequence,
                time: $CommandRacer.getTimeSeconds(),
                points: $CommandRacer.getPoints(),
                result: 'right'
            });

            // Set up interface
            $CommandRacer.setUpRightAnswer();
        } else { // wrong answer
            // Add result 
            $Result.data.add({
                keystrokes: sequence,
                time: $CommandRacer.getTimeSeconds(),
                points: 0,
                result: 'wrong'
            });
            $CommandRacer.setUpWrongAnswer();
        }
    });
}

$CommandRacer.setUpRightAnswer = function() {
    $CommandRacer.stopTimer();
    $CommandRacer.setAnswerClass("alert-success");

    var points = $CommandRacer.getPoints();
    var seconds = (parseFloat(points) / 100.0);
    $('#answer').html('Right answer remaning <b>'+seconds+ " s</b>. You got <b>"+points+"</b> points!");
    
    // Update points earned
    $CommandRacer.curr_points += points;
    $CommandRacer.updatePoints();
    // 
    $CommandRacer.answered = true;
    $CommandRacer.correct_answered = true;

    // Go to next question
    $CommandRacer.goToNextQuestion();
}

$CommandRacer.setUpWrongAnswer = function() {
    $CommandRacer.stopTimer();
    $('#answer').html('Wrong answer');
    $CommandRacer.setAnswerClass("alert-danger");

    // Sets that the question has been answered incorrectly
    $CommandRacer.answered = true;
    $CommandRacer.correct_answered = false;

    // Go to next question
    $CommandRacer.goToNextQuestion();
}

$CommandRacer.setUpEndScreen = function () {
    $('#question_widget').hide();
    $('#end_screen').removeClass('hidden');

    $('#final_score').html($CommandRacer.curr_points + "");
    $('#end_screen').fadeIn();

    // Adds result Summary
    var result_summary = $Result.buildSummary();
    $("div#result_summary").append(result_summary);
}


$CommandRacer.updateProgressBar = function() {
    var percent_completed = parseFloat($CommandRacer.num_question - 1) / parseFloat($QuestionsBase.size());
    percent_completed *= 100.0;
    console.log("completed " + percent_completed);
    $("#test_progress").css({
        width: (percent_completed) + "%"
    });
}

$CommandRacer.keyPressHandler = function() {
    $CommandRacer.stopTimer();
    $("#typing_message").html("<b>You start Typing! </b>");

    $CommandRacer.can_skip_question = false;

}


/* Wait time_between_question and then go to next question */
$CommandRacer.goToNextQuestion = function () {
    console.log('Go to next question ' + $CommandRacer.time_between_question);
    // Skip question flag
    $CommandRacer.can_skip_question = false;
    setTimeout(function(){
        console.log('timeout');
        $CommandRacer.setUpNextQuestion();
    }, $CommandRacer.time_between_question);
}

$CommandRacer.setUpNextQuestion = function () {
    console.log('Set up next question');
    // Sets that the questions has not been answered yet
    $CommandRacer.answered = false;
    $CommandRacer.correct_answered = false;

    // Removes handler for previous question
    if ($CommandRacer.curr_question != null) {
        Mousetrap.unbind($CommandRacer.curr_question.cmd);
    }

    // Clear the timer
    $CommandRacer.clearTimer();

    // Get the next question
    var question = $QuestionsBase.next();
    $CommandRacer.curr_question = question;
    if (question != null) {
        // Skip question flag
        $CommandRacer.can_skip_question = true;
        // clean keystrokes section
        $('#key_strokes').html("");

        $(".question:first").slideUp();
        // Set the title
        $('.question_title:first').html('Question ' + $CommandRacer.num_question);
        // Set the text
        $('.question_text:first').html(question.text);

        $('#answer').html("<b id ='typing_message'>Type now! </b><span id = 'timer_place'></span> remaning...");
        $CommandRacer.setAnswerClass("alert-info");

        //$CommandRacer.startMouseTrap($CommandRacer.curr_question);
        $CommandRacer.startRecordingKeys();
        // Increment the number of questions already showed
        $CommandRacer.num_question++;
        $CommandRacer.updateProgressBar();
        $(".question:first").slideDown(function() {
            $CommandRacer.startTimer();
        });
        
    } else {
        $CommandRacer.setUpEndScreen();
    }
}

///////////////////////////// Timer ////////////////////////////////

$CommandRacer.setUpTimeOut = function() {
    //Set status
    $CommandRacer.answered = true;
    $CommandRacer.correct_answered = false;

    // Add result 
    $Result.data.add({
        keystrokes: 'none',
        time: 0,
        points: 0,
        result: 'timeout'
    });

    // Update the answer div
    $('#answer').html("<b>Timeout!</b> Click in the skip question button below.");
    $CommandRacer.setAnswerClass("alert-warning");

}


$CommandRacer.updateTimer = function() {
    if ($CommandRacer.timer_is_running == false)
        return;
    $CommandRacer.curr_time_ramaning -= $CommandRacer.update_time;

    if ($CommandRacer.curr_time_ramaning <= 0) {
        $CommandRacer.curr_time_ramaning = 0;
        $CommandRacer.timer_is_running = false;

        $CommandRacer.setUpTimeOut();
        return;
    }


    var time_seconds = $CommandRacer.getTimeSeconds();
    // Update timer place
    $('#timer_place').html(time_seconds +" s");

    // Next call
    setTimeout($CommandRacer.updateTimer, $CommandRacer.update_time);
}
$CommandRacer.stopTimer = function() {
    $CommandRacer.timer_is_running = false;
}

$CommandRacer.clearTimer = function() {
    $CommandRacer.timer_is_running = false;
    $CommandRacer.curr_time_ramaning = 0;
}

$CommandRacer.startTimer = function() {
    $CommandRacer.timer_is_running = true;
    $CommandRacer.curr_time_ramaning = $CommandRacer.timelimit;
    $CommandRacer.updateTimer();
}

$CommandRacer.init = function () {
    console.log("INIT");
    // Start test event
    $(document).on("click", "#start-button", function () {
        console.log("start");
        // Hide the Start container
        $("#start-container").hide();
        // Show question container
        $('#question_widget').removeClass('hidden');
        $CommandRacer.answered = false;
        $CommandRacer.setUpNextQuestion();
        $(document).keypress($CommandRacer.keyPressHandler);
        return false;
    });

    // Next question event
    $(document).on("click", "a.next_question", function () {
        console.log("next_question");
        // Show question container

        if ($CommandRacer.answered == false && $CommandRacer.can_skip_question == true) {
            $Result.data.add({
                keystrokes: 'none',
                time: $CommandRacer.getTimeSeconds(),
                points: 0,
                result: 'skipped'
            });
        }
        if ($CommandRacer.can_skip_question == true)
            $CommandRacer.setUpNextQuestion();
    });
}

$(document).ready($CommandRacer.init());