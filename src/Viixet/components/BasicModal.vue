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
        <div class="modal__base card-base bg-darkgrey" 
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
$gutter: 0.6em;

.modal__backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(44,44,44,0.1);
    animation-duration: 0.15s;
    z-index: 10;
}

.modal__base {
    width: 95%;
    max-height: 80vh;
    overflow-y: auto;
    position: fixed;
    bottom: -1em;
    left: 0.5%;
    animation-duration: 0.15s;
    z-index: 10;

    header, .modal__content, footer {
        margin: 1em $gutter;
    }

    header {
        h1,h2,h3 {
            font-size: 1.25em;
        }

        margin-top: $gutter;
    }

    footer {
        border-top: 1px solid #d4d4d4;
        margin-bottom: $gutter;
        padding-top: $gutter;
    }

    .modal__footer {
        margin: $gutter -1em -1em -1em;
        background: rgba(255,255,255,0.15);
        padding: $gutter 1em;
    }

    * {
        user-select: none;
    }

    .container-fluid {
        padding: 0.5em
    }
}

@media only screen and (min-width: 64em) {
    .modal__base {
        width: 50%;
        top: 10%;
        bottom: unset;
        left: 25%;

        .container-fluid {
            padding: 1em
        }
    }

    .modal__base.wide {
        width: 75%;
        left: 12.5%;
    }
}
</style>
