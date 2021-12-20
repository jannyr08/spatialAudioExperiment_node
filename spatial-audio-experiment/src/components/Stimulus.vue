<template>
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
            v-for="(text) in mcChoices"
            @click="mcDone(text)" :key="text.id">
            {{text}}
        </button>
        </div>
    </div>

     <!-- <div class="end" v-if="state=='END'">
        <p> Thank you for participating in the experiment!</p>
    </div> -->

</template>

<script>
export default {
    props: ["state", "substate", "efPrompt", "efAnswers", "mcPrompt", "mcChoices"],
    methods: {
        efDone(text) {
            this.$emit('efDone', text)
        },
        mcDone(text) {
            this.$emit('mcDone', text)
        }
    }
}
</script>