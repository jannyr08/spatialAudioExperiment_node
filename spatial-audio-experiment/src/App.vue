 <template>
   <div class="scene">
      <!-- ID prompt-->
      <div class="UIDEntry" v-if="state=='ENTER_ID'">
        <span>
          Enter UID:
        </span>
        <input type="text" v-model="UID" />
        <button @click="acceptID()">Submit</button>
      </div>

      <!-- stimulus display -->
      <div class="stimulus" v-if="state=='INSTRUCT'">
        <p v-for="line in instructions" :key="line.index">
          {{ line }}
        </p>
        <button @click="confirmInstructions()">Got it!</button>
      </div>

      <div class="stimulus" v-if="state=='TRIAL'">
        <!-- audio? -->
        <!-- <img src="fixationcross.png"> </img> -->

        <div class="prompt" v-if="substate=='PROMPT'">
          <img src="fixationcross.png" />
        </div>

        <div class="audio" v-if="substate=='AUDIO'">

        </div>

        <!-- effort q-->
        <div class="sa" v-if="substate=='EF'">
          <span class="efPrompt">
            How would you rate the difficulty of this trial?
          </span>
          <div>
            <button class="efAnswer"
              v-for="(text, ix) in efAnswers"
              @click="efDone(text)" :key="ix">
              {{text}}
            </button>
          </div>
        </div>

        <!-- MC qs-->
        <div class="mc" v-if="substate=='MC'">
          <span class="mcPrompt">
            {{ mcPrompt }}
          </span>
          <button class="mcAnswer"
            v-for="(text, ix) in mcChoices"
            @click="mcDone(text)" :key="ix">
            {{text}}
          </button>
        </div>

      </div>

      <div class="end" v-if="state=='END'">
        <p> Thank you for participating in the experiment!</p>
      </div>

    </div>
</template>

<script>

import jsonTrials from '../static/trials.json'
import ants from '../static/Ants_15.ogg'
import crow from '../static/Crow_15.ogg'
import gnat from '../static/Gnat_15.ogg'

import axios from 'axios'

var actx = null; 

if (window.AudioContext === undefined) {
    console.log("Browser cannot load audio.")
} else {
  actx = new (window.AudioContext || window.webkitAudioContext);
  actx.listener.setOrientation(0, 1, 0, 0, 0, 1)
}

  //Classes
  
  // class AudioNode {
  //   constructor(file, angle){
  //     this.panner = actx.createPanner()
  //     this.panner.panningModel = "HRTF"
  //     this.panner.distanceModel = "linear"
  //   }
  // }


// Can this trial class be a Vue app??? 
class Trial {
  constructor(trialNum, trialID, targetFile,distLFile,distRFile,angle,timeout,MCPrompt,MCChoices,MCCorrect, app){
    
    // setup prompt audio
    this.app = app
    this.promptText = "+"
    this.angle = angle

    this.trialID = trialID
    this.trialNum = trialNum

    this.targetFile = targetFile

    //this.promptAudio = new Audio(promptFile)
    //this.promptSource = actx.createMediaElementSource(this.promptAudio)

    // setup target audio

    this.targetPanner = actx.createPanner()
    this.targetPanner.panningModel = "HRTF"
    this.targetPanner.distanceModel = "linear"

    this.targetX = 10 * Math.cos((-90) * Math.PI / 180)
    this.targetY = 10 * Math.sin((-90) * Math.PI / 180)
    this.targetPanner.setPosition(this.targetX,this.targetY,0)

    this.targetAudio = new Audio(ants)
    this.targetAudio.setAttribute('crossorigin', 'anonymous');    
    this.targetAudio.load();
    
    this.targetAudio.loop = true
    this.targetSource = actx.createMediaElementSource(this.targetAudio)
    this.targetSource.connect(this.targetPanner)

    // setup left distractor audio

    this.distLPanner = actx.createPanner()
    this.distLPanner.panningModel = "HRTF"
    this.distLPanner.distanceModel = "linear"

    this.distLX = 10 * Math.cos((-angle - 90) * Math.PI / 180)
    this.distLY = 10 * Math.sin((-angle - 90) * Math.PI / 180)
    this.distLPanner.setPosition(this.distLX,this.distLY,0)

    this.distLAudio = new Audio(crow)
    this.distLAudio.crossorigin = 'anonymous';

    this.distLAudio.loop = true
    this.distLSource = actx.createMediaElementSource(this.distLAudio)
    this.distLSource.connect(this.distLPanner)

    // setup right distractor audio

    this.distRPanner = actx.createPanner()
    this.distRPanner.panningModel = "HRTF"
    this.distRPanner.distanceModel = "linear"

    this.distRX = 10 * Math.cos((angle - 90) * Math.PI / 180)
    this.distRY = 10 * Math.sin((angle - 90) * Math.PI / 180)
    this.distRPanner.setPosition(this.distRX,this.distRY,0)

    this.distRAudio = new Audio(gnat)
    this.distRAudio.crossorigin = 'anonymous';

    this.distRAudio.loop = true
    this.distRSource = actx.createMediaElementSource(this.distRAudio)
    this.distRSource.connect(this.distRPanner)

    //prep stress likert
    this.stressText = "How hard was it to track the target voice?"
    this.efReponse = null

    this.efStartTime = -1
    this.efResponseTime = -1

    //prep multiple choice question
    this.MCText = MCPrompt
    this.MCChoices = MCChoices
    this.MCCorrect = MCCorrect

    this.MCResponse = null
    this.MCStartTime = -1
    this.MCResponseTime = -1

    this.trialLog = {}
  }
    
  startTrial(){
    //do the first action-- probably displaying the fixation cross, and playing the promptID
    this.playPrompt()
    
    // init certain data in app
    this.app.mcPrompt = this.MCText
    this.app.mcChoices = this.MCChoices

    //then set the timeout for the NEXT action (playing the trial audio proper)
  }
    
  playPrompt(){
    this.app.substate = "PROMPT"
    // this.promptSource.connect(actx.destination)
    // this.promptAudio.play()
    
    //when should I disconnect...?
    setTimeout(() => { this.stopPrompt(); }, 1000);
  }

  stopPrompt() {
    // this.promptAudio.pause()
    // this.promptAudio.currentTime = 0
    this.playTrial()
  }

  playTrial(){
    this.app.substate = "AUDIO"

    this.targetPanner.connect(actx.destination)
    this.distLPanner.connect(actx.destination)
    this.distRPanner.connect(actx.destination)

    this.targetAudio.play()
    this.distLAudio.play()
    this.distRAudio.play()

    // this.targetAudio.canplaythrough((e) => {
    //   console.log(e)
    //   this.targetAudio.play()
    // })

    // Error: App.vue?3dfd:213 Uncaught (in promise) DOMException: The element has no supported sources.
    
    //after starting, set a timeout for "stopAll()"
    setTimeout(() => { 
      this.stopAll(); 
      //but ALSO for "advance to effortPrompt"
      this.efStartTime = new Date().getTime();
      this.app.substate = "EF"
    }, 3000);
  }
    
  stopAll(){
    //this.promptAudio.pause()
    //this.promptAudio.currentTime = 0

    this.targetAudio.pause()
    this.targetAudio.currentTime = 0

    this.distLAudio.pause()
    this.distLAudio.currentTime = 0

    this.distRAudio.pause()
    this.distRAudio.currentTime = 0
  }

  logTrial() {
    this.app.log["trials"].push({
      "UID": this.app.UID,
      "timestamp": Math.floor(Date.now() / 1000),
      "trialNum": this.trialNum,
      "stimulusId": this.trialID,
      "angle": this.angle,
      "target_file": this.targetFile,
      "mc_choice": this.MCResponse,
      "ef_rate": this.efReponse,
      "ef_react": this.efResponseTime,
      "mc_correct": this.MCCorrect,
      "mc_react": this.MCResponseTime,
    })
   }
}

export default {
  name: 'App',
  data() {
    return {
      state: "ENTER_ID",
      substate: "",
      trial_id: 0,
      trials: [],
      jsonTrials: jsonTrials,
      current_trial: null,
      UID: "",
      UIDEntered: false,
      log: null,
      stimulus: "",
      mcPrompt: "",
      saPrompt: "",
      efPrompt: "How would you rate the difficulty of this trial?",
      efAnswers: ["0","1","2","3","4","5","6","7","8","9"],
      mcChoices: [],
      instructions: [
        "Try to listen closely to the audio in each trial to come.",
        "Focus on the CENTER voice.",
        "After listening for a few seconds, we'll ask you some comprehension questions."
      ]
    }
  }, 
  created() {
      // this.listenerSetup()
      this.startTime = new Date().getTime();
    },
  mounted() {
      //this.loadAudio();
      this.buildTrials();

  },
  
    methods: {
      listenerSetup(){
        window.addEventListener('keydown', (e) => {
          this.logEvent("keypress",e.key)
          if (e.key == 'ArrowLeft') {
            this.decrement();
          }
          if (e.key == 'ArrowRight') {
            this.increment();
          }
        });
      },

      acceptID(){
        this.state = "INSTRUCT"
        this.log = {"UID": this.UID, "trials": []}
      },

      efDone(answer) {
        this.current_trial.efResponseTime = new Date().getTime() - this.current_trial.efStartTime; 
        this.current_trial.efReponse = answer

        this.current_trial.MCStartTime = new Date().getTime(); 
        this.substate = "MC"
      },

      mcDone(answer) {
        this.current_trial.MCResponseTime = new Date().getTime() - this.current_trial.MCStartTime;
        this.current_trial.MCResponse = answer
        this.nextTrial()
      },

      confirmInstructions(){
        // initiate the first trial in the list 
        this.state = "TRIAL"
        this.nextTrial()
      },

      nextTrial(){   
        if (this.trials.length > 0) {
          this.trialNum += 1 
          this.current_trial = this.trials.shift()
          this.current_trial.startTrial()
        } else {
          this.state = "END"
          this.current_trial.logTrial()
          // console.log(this.log)
          this.saveTextfile()
          // savefile()
        }
      },
      
      setupLog(){
      
      },

      // App.vue?3dfd:206 Uncaught (in promise) DOMException: The element has no supported sources.

      saveTextfile() {
         axios.post('http://localhost:5001/save', this.log)
            .then(res => console.log(res.data))
            .catch(e => console.log(e));
      },
      
      readJson(){
        //  fetch('./trials.json')
        //   .then(response => response.json())
        //   .then(data => this.buildTrials(data));
      },

      buildTrials(){

        var trial; 
        for (var i = 0; i < 1; i++) {
          console.log(this.jsonTrials[i])
          var curr_data = this.jsonTrials[i];

          var trial_id = curr_data["trial_id"];
          var targetFile = curr_data["targetFile"];
          var distLFile = curr_data["distLFile"];
          var distRFile = curr_data["distRFile"];
          var angle = curr_data["angle"];
          var timeout = curr_data["timeout"];
          var mcPrompt = curr_data["mcPrompt"];
          var mcChoices = curr_data["mcChoices"];
          var mcCorrect = curr_data["mcCorrect"];

          trial = new Trial(trial_id, i + 1, targetFile, distLFile, distRFile, angle, timeout, mcPrompt, mcChoices, mcCorrect, this)
          this.trials.push(trial)
          // trials.push(trial)
        }
    
      }
    }
}

</script>
