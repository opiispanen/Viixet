<template>
<div class="modal">
    <transition name="custom-classes-transition"
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut">
        <div class="modal__backdrop" v-if="show" @click="closeModal()"></div>
    </transition>
    <transition name="custom-classes-transition"
            enter-active-class="animated zoomIn"
            leave-active-class="animated zoomOut">
        <div class="modal__base card-base" 
             v-if="show"
             :class="{ wide: wide }">
            <slot></slot>
        </div>
    </transition>
</div>
</template>

<script>
import dom from './DomService.js';

export default {
    name: 'basic-modal',
    props: {
        show: {
            type: Boolean,
            required: true
        },
        wide: {
            type: Boolean,
            required: false
        }
    },
    methods: {
        closeModal() {
            this.$emit('close');
        }
    },
    watch: {
        show(val, oldVal) {
            if (val)
                dom.disableScroll();
            else
                dom.enableScroll();
        }
    }
}
</script>

<style lang="scss">

</style>
