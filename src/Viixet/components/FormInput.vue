<template>
<div class="form-item">
    <label>
        <span class="form-item--label">{{ label }}</span>
        <slot></slot>
    </label>
</div>
</template>

<script>
export default {
    name: 'form-input',
    props: {
        label: {
            required: true,
            type: String
        }
    }
}
</script>
