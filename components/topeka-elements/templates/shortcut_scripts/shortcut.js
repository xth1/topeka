

/* Set ShortCut object with parameters*/
var $ShortCut = {
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

$ShortCut.startRecordingKeys = function(question) {
    Mousetrap.record(function(sequence) {
        console.log('You pressed: ' + sequence.join(' '));
    });
}