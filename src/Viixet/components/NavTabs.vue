<template>
<div class="nav navtabs"
    :class="{
        'navtabs__left': position === 'left'
    }">
    <div class="container"
        :style="{
            padding: !isMobile && position === 'left' ? `${paddingVertical}px 0` : ''
        }">
        <div class="row">
            <slot></slot>
        </div>
    </div>
</div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from 'vuex'
import dom from './DomService.js';

Vue.directive('nav-tab', function (el, binding) {
    //el.parentNode.classList.add('row');
    
    el.classList.add('navtabs__item');
    el.classList.add('col-xs');
});

Vue.directive('nav-tab-label', function(el) {
    el.classList.add('navtabs__item__label');
});

/*
    :class="[
        position === 'left' ? 'navtabs__left' : '',
        tabCount > 0 ? 'test-'+tabCount : ''
    ]"
*/

export default {
    name: 'nav-tabs',
    props: {
        position: {
            type: String,
            required: false,
            default: 'bottom'
        }
    },
    data: () => ({
        tabCount: 0
    }),
    computed: {
        ...mapGetters({
            isMobile: 'isMobile'
        }),
        paddingVertical() {
            return ((window.innerHeight * 0.5) - this.tabCount * 40) * 0.5
        }
    },
    mounted() {
        const tabOnChange = () => {
            const tabCount = this.$el.querySelectorAll('.navtabs__item').length;
            
            this.$el.className = this.$el.className.replace(/tab-count-\d/g, '');

            if (tabCount < 5)
                this.$el.classList.add('tab-count-'+tabCount);
            else 
                this.$el.classList.add('tab-notext');

            this.tabCount = tabCount;
        };
        
        switch(this.position) {
            case 'bottom':
                document.body.classList.add('has-navtabs');
            break;
            case 'left': 
                document.body.classList.add('has-navtabs-left');
            break;
        }
        if (this.position === 'bottom') {
            document.body.classList.add('has-navtabs');
        }
        
        tabOnChange();

        this.$el.addEventListener(
            'DOMNodeInserted', 
            () => this.$nextTick(tabOnChange),
            false
        );
    },
    watch: {
        '$route': function(value) {
            //dom.enableScroll();
        },
        isMobile(value) {
            if (this.position === 'left') {
                if (value) {
                    document.body.classList.remove('has-navtabs-left');
                    document.body.classList.add('has-navtabs');
                } else {
                    document.body.classList.remove('has-navtabs');
                    document.body.classList.add('has-navtabs-left');
                }
            }
        }
    }
}
</script>

<style lang="scss">

</style>
