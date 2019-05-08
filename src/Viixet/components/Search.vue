<template>
<div class="form-item search">
    <input type="text" :value="search" @input="update($event.target.value)">
</div>
</template>

<script>
export default {
    props: {
        value: {
            type: String,
            required: true
        }
    },
    computed: {
        search() {
            return this.value;
        }
    },
    methods: {
        update(search) {
            this.$emit('input', search)
        }
    },
    mounted() {
        this.$el.querySelector('input').focus();
    }
}
</script>

<style lang="scss">
.form-item.search {
    position:absolute;
    top:0;
    transition-duration:0.25s;
}
</style>
