<template>
<div class="nav navtabs"
    :class="{
        'navtabs__left': position === 'left',
        'navtabs__tight': viewMode === 'tight'
    }">
    <div class="flex" 
        :class="{ 
            'hero': viewMode === 'centered'
        }">
        <slot></slot>
    </div>
</div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from 'vuex'
import dom from './DomService.js';

Vue.directive('nav-tab', function (el, binding) {
    el.classList.add('navtabs__item');
});

Vue.directive('nav-tab-label', function(el) {
    el.classList.add('navtabs__item__label');
});

export default {
    name: 'nav-tabs',
    props: {
        position: {
            type: String,
            required: false,
            default: 'bottom'
        },
        viewMode: {
            type: String,
            required: false,
            default: 'centered'
        }
    },
    data: () => ({
        tabCount: 0
    }),
    computed: {
        ...mapGetters({
            isMobile: 'isMobile'
        })
    },
    methods: {
        onMobileChange(value) {
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
    },
    mounted() {
        const tabOnChange = () => {
            if (!this.isMobile && this.viewMode === 'tight') {
                this.$el.className = this.$el.className.replace(/tab-count-\d/g, '');    
                return;
            }

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
        
        this.onMobileChange(this.isMobile);
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
            this.onMobileChange(value);
        }
    }
}
</script>

<style lang="scss">

</style>
