<template>
<div class="tabs-master">
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
    methods: {
        setActive(index) {
            this.toggle(false, this.active);
            this.toggle(true, index);

            this.active = index;
        },
        toggle(show, index) {
            const content = Array.prototype.slice.call(this.$refs.content.children);
            
            content[index].style.display = show ? 'block' : 'none'
        }
    },
    mounted() {
        this.setActive(0)

        this.unit = 100 / this.headings.length;
    }
}
</script>