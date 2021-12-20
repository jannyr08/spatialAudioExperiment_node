<template>
    <div class="UIDEntry" v-if="state=='ENTER_ID'">
        <span>
        Enter UID:
        </span>
        <input type="text" v-model="UID"/>
        <button @click="acceptID()">Submit</button>
    </div>
</template>

<script>
export default {
    props: ["state"],
    methods: {
        acceptID() {
            this.$emit('acceptID')
        }
    }
}
</script>
