<template>
<div class="dropdown">
    <div class="dropdown__button">
        <slot name="button"></slot>
    </div>
    <transition name="custom-classes-transition"
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut">
        <div class="dropdown__backdrop" v-if="show" @click="$emit('close')"></div>
    </transition>
    <transition name="custom-classes-transition"
            enter-active-class="animated zoomIn"
            leave-active-class="animated zoomOut">
        <div class="dropdown__base bg-white align-left" 
             v-show="show">
            <slot name="options"></slot>
        </div>
    </transition>
</div>
</template>

<script>
import dom from './DomService.js';

export default {
    name: 'drop-down',
    props: {
        show: {
            type: 'boolean',
            required: true
        }
    },
    methods: {
        checkSlot: function(slotname) {
            return !!this.$slots[slotname];
        }
    },
    mounted() {
        const 
            button = this.$el.querySelector('.dropdown__button'),
            base = this.$el.querySelector('.dropdown__base'),
            options = this.$el.querySelectorAll('li'),
            buttonBounding = button.getBoundingClientRect();
            
        base.style.top = `${ buttonBounding.bottom / 4 }px`;
        base.style.right = `${ window.innerWidth - buttonBounding.right }px`;
        
        options.forEach((o) => o.addEventListener('click', () => this.$emit('close')));
    },
    watch: {
        show: function(val, oldVal) {
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
    
    .dropdown {
        z-index: 1;
    }

    .dropdown__backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(44,44,44,0.2);
        animation-duration: 0.15s;
        z-index: 2;
    }

    .dropdown__base {
        position: fixed;
        animation-duration: 0.15s;
        min-width: 150px;
        z-index: 3;
        border-radius: 2px;
        box-shadow: 0 4px 10px -1px #333;

        ul {
            list-style: none;
            width: 100%;

            li {
                padding: .6em;
                font-size: 1em;
                user-select: none;

                a {
                    display: inline-block;
                    width: 100%;
                }
            }
        }
    }

    .dropdown__bigbuttons {

        .dropdown__base {
            .fa {
                font-size: 2em;
                display: block;
            }

            li {
                text-align: center;
                padding: 1.6em .6em;
            }
        }
        
    }
</style>