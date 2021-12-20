<template>
     <div class="scene">
        <!-- ID prompt-->
        <div class="UIDEntry" v-if="state=='ENTER_ID'">
          <span>
            Enter UID:
          </span>
          <input type="text" v-model="UID"/>
          <button @click="acceptID()">Submit</button>
        </div>

        <!-- stimulus display -->
        <div class="stimulus" v-if="state=='INSTRUCT'">
          <p v-for="line in instructions" :key="line.id">
            {{ line }}
          </p>
          <button @click="confirmInstructions()">Got it!</button>
        </div>

        <div class="stimulus" v-if="state=='TRIAL'">
          <!-- audio? -->

          <div class="audio" v-if="false" if="substate=='AUDIO'">

          </div>

          <!-- effort q-->
          <div class="sa" v-if="substate=='EF'">
            <span class="efPrompt">
              {{ efPrompt }}
            </span>
            <div>
              <button class="efAnswer"
                v-for="(text) in efAnswers"
                @click="efDone(text)" :key="text.id">
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
              v-for="(text) in mcChoices"
              @click="mcDone(text)" :key="text.id">
              {{text}}
            </button>
          </div>

        </div>

        <div class="end" v-if="state=='END'">
          <p> Thank you for participating in the experiment!</p>
        </div>

      </div>
</template>