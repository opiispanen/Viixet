<template>
<div class="navbar" 
     :class="{ 
        'navbar-fixed': fixed,
        'blur': blur
        }">
    <div :class="{ 
            'container': !fluid,
            'container-fluid': fluid,
            'no-gutter': noGutter,
            'rounded': rounded,
            'chopped': chopped
        }">
        <transition name="custom-classes-transition"
                    enter-active-class="animated fadeIn"
                    leave-active-class="animated fadeOut">
            <div class="container" v-if="innerContainer">
                <div class="row middle-xs">
                    <slot></slot>
                </div>
            </div>
            <div class="row middle-xs" v-if="!innerContainer">
                <slot></slot>
            </div>
        </transition>
    </div>
</div>
</template>

<script>
export default {
    name: 'navbar',
    props: {
        fixed: {
            type: Boolean,
            required: false
        },
        fluid: {
            type: Boolean,
            required: false
        },
        noGutter: {
            type: Boolean,
            required: false
        },
        rounded: {
            type: Boolean,
            required: false
        },
        chopped: {
            type: Boolean,
            required: false
        },
        blur: {
            type: Boolean,
            required: false
        },
        innerContainer: {
            type: Boolean,
            required: false
        }
    },
    mounted() {
        if (this.fixed)
            document.body.classList.add('has-navbar');
        else
            document.body.classList.remove('has-navbar');
    },
    destroyed() {
        if (this.fixed)
            document.body.classList.remove('has-navbar');
        else
            document.body.classList.add('has-navbar');
    }
}
</script>

<style lang="scss">
.navbar {

    [class*="col-xs"] {
        animation-duration: 0.15s;
    }

    .container,
    .container-fluid {
        box-shadow: 0 3px 10px -3px rgba(44, 44, 44, 0.75);
    }
}
</style>
