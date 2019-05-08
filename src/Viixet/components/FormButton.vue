<template>
<button class="button">
    <span>{{ label }}</span>
</button>
</template>

<script>
export default {
    name: 'form-button',
    props: {
        action: {
            required: true,
            type: Function
        },
        label: {
            required: true,
            type: String
        }
    }
}
</script>
