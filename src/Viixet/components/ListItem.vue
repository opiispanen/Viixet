<template>
    <li class="itemlist__item" v-bind:class="{ 'has-image': !!image }">
        <div class="image" 
            v-if="!!image"
            v-bind:style="{ 'background-image': 'url('+image+')' }"></div>
        <div class="content">
            <slot name="content"></slot>
        </div>
        <div class="buttons" v-if="checkSlot('buttons')">
            <slot name="buttons"></slot>
        </div>
    </li>
</template>

<script>
export default {
    name: 'ListItem',
    props: {
        image: {
            type: 'string',
            required: false
        }
    },
    methods: {
        checkSlot: function(slotname) {
            return !!this.$slots[slotname];
        }
    },
    mounted() {
        const content = this.$el.querySelector('.content');

        if (this.checkSlot('buttons')) {
            let buttons = this.$el.querySelector('.buttons'),
                buttonsBounding = buttons.getBoundingClientRect();
                
            content.style.paddingRight = 'calc([width]px + 0.5em)'.replace('[width]', buttonsBounding.width);
        }
    }
}
</script>

<style lang="scss">
.itemlist {

    .itemlist__item {
        display: block;
        min-height: 3.5em;
        position: relative;
        border-bottom: 1px solid #c4c4c4;
        padding-left: 0.3em;

        .content {
            font-size: .85em;
            padding: 1.25em 0;
        }

        .image {
            width: 2.5em;
            height: 2.5em;
            position:absolute;
            top: 0.5em;
            left: 0.25em;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center; 
            border-radius: 100%;
        }

        .buttons {
            position: absolute;
            top: 0.5em;
            right: 0.3em;
            line-height: 2.25em;
        }
    }

    .itemlist__item:last-of-type {
        border-bottom: none;
    }

    .itemlist__item.has-image {
        .content {
            padding-left: 4em;
        }
    }
}
</style>