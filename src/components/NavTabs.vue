<template>
<div class="navtabs">
    <div class="container bg-primary-gradient">
        <slot></slot>
    </div>
</div>
</template>

<script>
import Vue from 'vue';
import dom from './DomService.js';

Vue.directive('nav-tab', function (el, binding) {
    //el.parentNode.classList.add('row');
    
    el.classList.add('navtabs__item');
    el.classList.add('col-xs');
});

Vue.directive('nav-tab-label', function(el) {
    el.classList.add('navtabs__item__label');
});

export default {
    name: 'nav-tabs',
    mounted() {
        const tabOnChange = () => {
            const tabCount = this.$el.querySelectorAll('.navtabs__item').length;
            
            this.$el.className = this.$el.className.replace(/tab-count-\d/g, '');

            if (tabCount < 5)
                this.$el.classList.add('tab-count-'+tabCount);
            else 
                this.$el.classList.add('tab-notext');
        };
        
        document.body.classList.add('has-navtabs');
        tabOnChange();

        this.$el.addEventListener(
            'DOMNodeInserted', 
            setTimeout.bind(null, tabOnChange, 0), 
            false
        );
    },
    watch: {
        '$route': function(value) {
            dom.enableScroll();
        }
    }
}
</script>

<style lang="scss">
.navtabs {

    a.router-link-exact-active {
        font-weight: 900;
        opacity: 1;
    }

    .container {
        box-shadow: 0 -3px 10px -3px #666;
    }
}

.navtabs.tab-count-4 {
    .navtabs__item__label {
        font-size: 0.55em;
    }
}

.navtabs.tab-notext {
    height: 2.5em;

    .navtabs__item__label {
        display: none;
    }

    a {
        padding: 0.6em 0;
    }
}

@media only screen and (min-width: 48em) {
    .navtabs {
        .container {
            border-top-left-radius: 1.35em;
            border-top-right-radius: 1.35em;
        }
    }
}
</style>
