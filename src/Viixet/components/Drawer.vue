<template>
<div class="side-drawer bg-black"
    :class="{
        'left': position === 'left',
        'right': position === 'right',
        'closed': !open
    }">
    <slot></slot>
</div>
</template>

<script>
export default {
    name: 'sideDrawer',
    props: {
        open: {
            required: true,
            default: false,
            type: Boolean
        },
        position: {
            required: false,
            default: 'left',
            type: String
        }
    }
}
</script>

<style lang="scss">
.side-drawer {
    position: fixed;
    display: inline-block;
    height: 100%;
    width: 80%;
    top: 0;
    transition: width 0.2s ease-out;
    overflow-x: hidden;
    z-index: 10;
}

.side-drawer.closed {
    width: 0%;
}

.side-drawer.left {
    left: 0;
}

.side-drawer.right {
    right: 0;
}

@media only screen and (min-width: 48em) {
    .side-drawer {
        width: 25%;
    }
}

</style>
