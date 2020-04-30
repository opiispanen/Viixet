<template>
<div class="file-master">
    <div class="file-image" 
        :style="{
            'background-image': `url(${ file.url })`
        }"
        v-if="file.mimetype.indexOf('image') > -1"></div>
    <div class="file-icon" v-if="file.mimetype.indexOf('image') > -1 && false">
        <i class="fa fa-file-image"></i>
    </div>
    <div class="file-icon" v-if="file.mimetype.indexOf('image') < 0">
        <i class="fa fa-file"></i>
    </div>
    <div class="file-name">{{ file.name }} ({{ size }} MB)</div>
</div>
</template>

<script>
export default {
    props: {
        file: {
            type: Object,
            required: true
        }
    },
    computed: {
        size() {
            return (this.file.size * 0.00000095367432).toFixed(2)
        }
    },
    mounted() {
    }
}
</script>

<style lang="scss">
.file-master {
    text-align: center;

    .file-image {
        height: 115px;
        width: 100%;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center;
    }

    .file-icon {
        font-size: 6rem;
    }

    .file-name {
        font-size: 0.8rem;
    }

    img {
        width: 100%;
        max-height: 6em;
    }
}

</style>