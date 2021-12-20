<template>
    <div class="stimulus" v-if="state=='INSTRUCT'">
        <p v-for="line in instructions" :key="line.id">
        {{ line }}
        </p>
        <button @click="confirmInstructions()">Got it!</button>
    </div>
</template>

<script>
export default {
    props: ["state", "instructions"],
    methods: {
        confirmInstructions() {
            this.$emit('confirmInstructions')
        }
    }
}
</script>