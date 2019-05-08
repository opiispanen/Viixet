<template>
<div class="card-base card" ref="card">
    <div class="card__header" v-if="checkSlot('header')">
        <slot name="header"></slot>
        <div class="card__date card__date__topright">
            <slot name="date"></slot>
        </div>
    </div>
    <slot name="content"></slot>
</div>
</template>

<script>
//import bg from '../../assets/logo-light.svg';

export default {
    name:'card',
    methods: {
        checkSlot: function(slotname) {
            return !!this.$slots[slotname];
        }
    },
    created() {

    },
    mounted() {
        // this.$refs.card.style.backgroundImage = `url(${ bg })`;
    }
}
</script>

<style lang="scss">

</style>