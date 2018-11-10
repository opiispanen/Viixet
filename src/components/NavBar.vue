<template>
<div class="navbar" 
     :class="{ 
        'navbar-fixed': fixed,
        'blur': blur
        }">
    <div :class="{ 
            'bg-black': black,
            'bg-primary': primary && !gradient, 
            'bg-primary-gradient': primary && gradient,
            'bg-primary-gradient-horizontal': primary && gradientHorizontal,
            'bg-secondary': secondary && !gradient, 
            'bg-secondary-gradient': secondary && gradient,
            'bg-secondary-gradient-horizontal': secondary && gradientHorizontal,
            'bg-terniary': terniary && !gradient, 
            'bg-terniary-gradient': terniary && gradient,
            'bg-terniary-gradient-horizontal': terniary && gradientHorizontal,
            'container': !fluid,
            'container-fluid': fluid,
            'rounded': rounded,
            'chopped': chopped
        }">
        <transition name="custom-classes-transition"
                    enter-active-class="animated fadeIn"
                    leave-active-class="animated fadeOut">
            <div class="row middle-xs">
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
            type: 'boolean',
            required: false
        },
        primary: {
            type: 'boolean',
            required: false
        },
        secondary: {
            type: 'boolean',
            required: false
        },
        terniary: {
            type: 'boolean',
            required: false
        },
        gradient: {
            type: 'boolean',
            required: false
        },
        gradientHorizontal: {
            type: 'boolean',
            required: false
        },
        black: {
            type: 'boolean',
            required: false
        },
        fluid: {
            type: 'boolean',
            required: false
        },
        rounded: {
            type: 'boolean',
            required: false
        },
        chopped: {
            type: 'boolean',
            required: false
        },
        blur: {
            type: 'boolean',
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
