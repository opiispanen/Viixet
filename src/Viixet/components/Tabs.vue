<template>
<div class="tabs-master" ref="master">
    <div class="tabs row">
        <div class="tab col-xs" 
            v-for="(heading, index) in headings"
            :key="index"
            @click="setActive(index)"
            :class="{ 'active': active === index }">
            {{ heading }}
        </div>
        <div class="indicator-parent">
            <div class="indicator"
                :style="{
                    width: `${ unit }%`,
                    left: `${ active * unit }%`
                }">
            </div>
        </div>
    </div>
    <div class="content" ref="content">
        <slot></slot>
    </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    props: {
        headings: {
            required: true,
            type: Array
        }
    },
    data: () => ({
        unit: 0,
        active: 0
    }),
    computed: {
        ...mapGetters({
            isMobile: 'isMobile'
        }),
    },
    methods: {
        setActive(index) {
            if (index < 0 || index >= this.headings.length) {
                return;
            }

            this.toggle(false, this.active);
            this.toggle(true, index);

            this.active = index;
            this.$emit('change', index)
        },
        toggle(show, index) {
            const content = Array.prototype.slice.call(this.$refs.content.children);
            
            content[index].style.display = show ? 'block' : 'none'
        },
        update() {
            this.unit = 100 / this.headings.length;
            this.$forceUpdate();
        }
    },
    watch: {
        isMobile() {
            this.unit = 100 / this.headings.length;
            this.$forceUpdate();
        }
    },
    mounted() {
        this.setActive(0)

        this.unit = 100 / this.headings.length;

        if (typeof window.Hammer !== 'undefined') {
            const master = this.$refs.master;
            const mc = new Hammer(master);

            mc.on('swipeleft swiperight', (ev) => {
                const index = this.active + (ev.type === 'swipeleft' ? 1 : -1)
                
                this.setActive(index)
            });
        }
    }
}
</script>