/* global AudioContext, MediaStream */
function AudioUtils (options) {
    this.audio_context = new AudioContext();
    this.audio = options.audio;
    this.silent = options.silent || false;

    this.audio_source = null;
    this.splitter = null;
    this.merger = null;
    this.init();
}
AudioUtils.prototype.init = function () {
    if (!this.audio_source) {
        if (this.audio instanceof MediaStream) {
            this.audio_source = this.audio_context.createMediaStreamSource(this.audio);
        } else {
            this.audio_source = this.audio_context.createMediaElementSource(this.audio);
        }
    }
    this.splitter = this.audio_context.createChannelSplitter();
    this.audio_source.connect(this.splitter);
    this.merger = this.audio_context.createChannelMerger(1);
    this.gainNodes = [];
    for (var i = 0; i < this.splitter.numberOfOutputs; i++) {
        var gainNode = this.audio_context.createGain();
        gainNode.gain.value = 1;
        this.gainNodes.push(gainNode);
    }
    for (var i = 0; i < this.splitter.numberOfOutputs; i++) {
        this.splitter.connect(this.gainNodes[i], i);
        this.gainNodes[i].connect(this.merger, 0, 0);
    }
    if (!this.silent) {
        this.merger.connect(this.audio_context.destination);
    }
};
AudioUtils.prototype.audioMeter = function (callback, accuracy) {
    /*
        Create mic preview
    */
    if (!accuracy) {
        accuracy = 50;
    }
    var max_level_L = 0;
    var old_level_L = 0;
    
    var javascriptNode = this.audio_context.createScriptProcessor(1024, 1, 1);

    this.audio_source.connect(javascriptNode);
    javascriptNode.connect(this.audio_context.destination);

    var running = false;
    javascriptNode.onaudioprocess = function (event) {
        var inpt_L = event.inputBuffer.getChannelData(0);
        var instant_L = 0.0;

        var sum_L = 0.0;
        for (var i = 0; i < inpt_L.length; ++i) {
            sum_L += inpt_L[i] * inpt_L[i];
        }
        instant_L = Math.sqrt(sum_L / inpt_L.length);
        max_level_L = Math.max(max_level_L, instant_L);
        instant_L = Math.max(instant_L, old_level_L - 0.008);
        old_level_L = instant_L;
        var percent = Math.ceil((instant_L / max_level_L) * 100);
        if (percent >= 0) {
            if (!running) {
                running = true;
                setTimeout(function () {
                    running = false;
                    callback(percent);
                }, accuracy);
            }
        }
    };
    this.audio_source.onended = function () {
        this.audio_source.disconnect(javascriptNode);
        javascriptNode.disconnect(this.audio_context.destination);
    };
};
AudioUtils.prototype.applyVolumeToChannel = function (channel, volume) {
    this.gainNodes[channel].gain.value = volume;
};