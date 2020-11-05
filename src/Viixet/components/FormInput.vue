<template>
<div class="form-item" ref="master">
    <label :class="{
        'switch': switcher,
        'selected': selected
    }">
        <span class="form-item--label" v-if="enableLabel">{{ label }}</span>
        <slot></slot>
        <span v-if="switcher">{{ label }}</span>
    </label>
</div>
</template>

<script>
export default {
    name: 'form-input',
    props: {
        label: {
            required: false,
            type: String
        },
        switcher: {
            required: false,
            type: Boolean
        }
    },
    data: () => ({
        selected: false
    }),
    computed: {
        enableLabel() {
            if (!!this.switcher) {
                return false;
            }

            if (!this.label || (!!this.label && this.label.length === 0)) {
                return false;
            }

            return true;
        }
    },
    mounted() {
        if (!this.switcher)
            return;

        this.$nextTick(() => {
            const master = this.$refs.master;
            const input = master.querySelector('input');
            
            if (input) {
                input.addEventListener('click', () => {
                    this.selected = input.checked;
                })

                if (input.checked) {
                    this.selected = true;
                }
            }
        })
    }
}
</script>
