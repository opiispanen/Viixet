<template>
<div class="dropdown">
    <div class="dropdown__button" @click="toggleShow($event)">
        <slot name="button"></slot>
    </div>
    <transition name="custom-classes-transition"
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut">
        <div class="dropdown__backdrop" v-if="show" @click="show = false;"></div>
    </transition>
    <transition name="custom-classes-transition"
            enter-active-class="animated zoomIn"
            leave-active-class="animated zoomOut">
        <div class="dropdown__base bg-white align-left" 
            ref="base"
            v-show="show"
            @click="show = false;">
            <slot name="options"></slot>
        </div>
    </transition>
</div>
</template>

<script>
import dom from './DomService.js';

export default {
    name: 'drop-down',
    data: () => ({
        show: false
    }),
    methods: {
        checkSlot(slotname) {
            return !!this.$slots[slotname];
        },
        toggleShow(evt) {
            if (evt.target === this.$slots['button'][0].elm) {
                this.show = !this.show;
            }

            if (this.show) {
                this.adjustBasePosition();
            }
        },
        adjustBasePosition() {
            const base = this.$refs.base;
            const bounding = this.$slots['button'][0].elm.getBoundingClientRect();
            const distances = {
                toLeft: bounding.x,
                toRight: window.innerWidth - (bounding.x + bounding.width),
                toTop: bounding.y,
                toBottom: window.innerHeight - (bounding.y + bounding.height) 
            };
            const gap = 8;

            if (distances.toTop <= distances.toBottom) {
                base.style.top = `${ bounding.y + bounding.height + gap }px`;
            } else {
                base.style.bottom = `${ window.innerHeight - bounding.y + gap }px`;
            }

            if (distances.toLeft <= distances.toRight) {
                base.style.left = `${ bounding.x }px`;
            } else {
                base.style.right = `${ window.innerWidth - (bounding.x + bounding.width) }px`;
            }
        }
    },
    watch: {
        show(val, oldVal) {
            /*
            if (val)
                dom.disableScroll();
            else
                dom.enableScroll();
            */
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
                font-size: 1.25em;
                display: inline-block;
                margin-right: 0.5em;
            }

            li {
                padding: 1.25em .75em 1.25em 1.25em;
            }
        }
        
    }
    
    .dropdown__button > * > * {
        pointer-events: none;
        cursor: pointer;
    }
</style>